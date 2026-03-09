import crypto from 'crypto';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

async function getRawBody(request: Request): Promise<string> {
  const buffer = await request.arrayBuffer();
  return Buffer.from(buffer).toString('utf-8');
}

function verifyStripeSignature(body: string, signature: string, webhookSecret: string): boolean {
  const hash = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  return hash === signature;
}

interface StripeEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ received: true }, { status: 200 });
    }

    const rawBody = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Missing Stripe signature header');
      return Response.json({ received: true }, { status: 200 });
    }

    if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
      logger.warn('Invalid Stripe signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: StripeEvent = JSON.parse(rawBody);

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      logger.error('Supabase not configured');
      return Response.json({ received: true }, { status: 200 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = (session.metadata as Record<string, string>)?.userId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (userId && stripeCustomerId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              tier: 'pro',
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) logger.error('Error updating user profile', { error: error.message });
          else logger.info(`User ${userId} upgraded to pro tier`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;

        if (stripeCustomerId) {
          const { data: user, error: findError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();

          if (findError) {
            logger.error('Error finding user by Stripe customer ID', { error: findError.message });
          } else if (user) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ tier: 'free', updated_at: new Date().toISOString() })
              .eq('id', user.id);

            if (updateError) logger.error('Error downgrading user', { error: updateError.message });
            else logger.info(`User ${user.id} downgraded to free tier`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string;

        if (stripeCustomerId) {
          const { data: user, error: findError } = await supabase
            .from('user_profiles')
            .select('id, email')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();

          if (!findError && user) {
            logger.warn(`Payment failed for user ${user.id} (${user.email}). Invoice: ${invoice.id}`);
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook error', { error: String(error) });
    return Response.json({ received: true }, { status: 200 });
  }
}
