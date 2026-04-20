import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

// Initialize Stripe with the secret key
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}

/**
 * Grace period days before downgrading on payment failure.
 * User keeps Pro access during this period while Stripe retries payment.
 */
const GRACE_PERIOD_DAYS = 7;

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      logger.error('Stripe not configured (missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET)');
      return Response.json({ received: true }, { status: 200 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Missing Stripe signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature using Stripe SDK
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn('Invalid Stripe webhook signature', { error: message });
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      logger.error('Supabase not configured — cannot process webhook');
      return Response.json({ received: true }, { status: 200 });
    }

    switch (event.type) {
      // ─── Checkout completed: Upgrade to Pro ───
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (userId && stripeCustomerId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              tier: 'premium',
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              grace_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) {
            logger.error('Failed to upgrade user to pro', { userId, error: error.message });
          } else {
            logger.info(`User ${userId} upgraded to pro tier`, { stripeCustomerId });
          }
        }
        break;
      }

      // ─── Subscription updated: Handle status changes ───
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;
        const status = subscription.status;

        const user = await findUserByCustomerId(supabase, stripeCustomerId);
        if (!user) break;

        if (status === 'active' || status === 'trialing') {
          // Subscription is healthy — ensure Pro and clear grace period
          await supabase
            .from('user_profiles')
            .update({
              tier: 'premium',
              grace_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          logger.info(`User ${user.id} subscription active`, { status });
        } else if (status === 'past_due') {
          // Payment failed but Stripe is retrying — set grace period
          const gracePeriodEnd = new Date();
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

          await supabase
            .from('user_profiles')
            .update({
              grace_period_end: gracePeriodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          logger.warn(`User ${user.id} subscription past_due — grace period until ${gracePeriodEnd.toISOString()}`);
        } else if (status === 'canceled' || status === 'unpaid') {
          // Subscription is done — downgrade immediately
          await supabase
            .from('user_profiles')
            .update({
              tier: 'free',
              grace_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          logger.info(`User ${user.id} downgraded to free (subscription ${status})`);
        }
        break;
      }

      // ─── Subscription deleted: Downgrade to free ───
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const user = await findUserByCustomerId(supabase, stripeCustomerId);
        if (!user) break;

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            tier: 'free',
            grace_period_end: null,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          logger.error('Failed to downgrade user', { userId: user.id, error: updateError.message });
        } else {
          logger.info(`User ${user.id} downgraded to free (subscription deleted)`);
        }
        break;
      }

      // ─── Invoice payment failed: Start grace period ───
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        const user = await findUserByCustomerId(supabase, stripeCustomerId);
        if (!user) break;

        // Only set grace period if not already set
        if (!user.grace_period_end) {
          const gracePeriodEnd = new Date();
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

          await supabase
            .from('user_profiles')
            .update({
              grace_period_end: gracePeriodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          logger.warn(`Payment failed for user ${user.id} — grace period set until ${gracePeriodEnd.toISOString()}`);
        } else {
          logger.warn(`Payment failed again for user ${user.id} — grace period already active until ${user.grace_period_end}`);
        }
        break;
      }

      // ─── Invoice paid: Clear any grace period ───
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        const user = await findUserByCustomerId(supabase, stripeCustomerId);
        if (!user) break;

        if (user.grace_period_end) {
          await supabase
            .from('user_profiles')
            .update({
              tier: 'premium',
              grace_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          logger.info(`User ${user.id} payment recovered — grace period cleared`);
        }
        break;
      }

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook processing error', { error: String(error) });
    // Always return 200 to prevent Stripe from retrying on our errors
    return Response.json({ received: true }, { status: 200 });
  }
}

// ─── Helpers ───

interface UserProfile {
  id: string;
  email?: string;
  grace_period_end?: string | null;
}

async function findUserByCustomerId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  stripeCustomerId: string
): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('id, email, grace_period_end')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error) {
    logger.error('Failed to find user by Stripe customer ID', {
      stripeCustomerId,
      error: error.message,
    });
    return null;
  }

  return user;
}
