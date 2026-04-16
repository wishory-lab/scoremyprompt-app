import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import { readStripePriceIds } from '@/app/lib/pricing-plan';

export async function POST(request: Request) {
  const rl = rateLimit(request, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid auth token', 'AUTH_MISSING', 401);
    }

    const token = authHeader.substring(7);

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new AppError('Database not configured', 'DB_NOT_CONFIGURED', 500);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new AppError('Unauthorized: Invalid auth token', 'AUTH_INVALID', 401);
    }

    const userEmail = user.email;
    if (!userEmail) {
      throw new AppError('User email not found', 'NO_EMAIL', 400);
    }

    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    let stripePriceId: string;
    let pricingPlan: 'legacy_999' | 'pro_499';
    try {
      const ids = readStripePriceIds();
      if (isFeatureEnabled(FEATURES.PRICING_V2)) {
        stripePriceId = ids.v2;
        pricingPlan = 'pro_499';
      } else if (ids.legacy) {
        stripePriceId = ids.legacy;
        pricingPlan = 'legacy_999';
      } else {
        throw new AppError('Stripe price not configured', 'STRIPE_NOT_CONFIGURED', 500);
      }
    } catch (err) {
      throw new AppError((err as Error).message, 'STRIPE_NOT_CONFIGURED', 500);
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!stripeApiKey) {
      throw new AppError('Payment service not configured', 'STRIPE_NOT_CONFIGURED', 500);
    }

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', stripePriceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${baseUrl}/pricing`);
    params.append('customer_email', userEmail);
    params.append('metadata[userId]', user.id);
    // pricingPlan is picked up by the Stripe webhook (app/api/stripe/webhook/route.ts)
    // on checkout.session.completed → stamped to user_profiles.pricing_plan.
    params.append('metadata[pricingPlan]', pricingPlan);
    params.append('subscription_data[trial_period_days]', '7');

    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${stripeApiKey}`,
      },
      body: params.toString(),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      logger.error('Stripe API error', { error: JSON.stringify(errorData) });
      throw new AppError('Failed to create checkout session', 'STRIPE_ERROR', checkoutResponse.status);
    }

    const session = await checkoutResponse.json();
    return Response.json({ url: session.url }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Checkout error', { error: String(error) });
    return errorResponse(error as Error);
  }
}
