import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

/**
 * Stripe Checkout with Introductory Pricing
 *
 * Pricing structure:
 *   - 7-day free trial
 *   - First 3 months: $2.99/mo (STRIPE_INTRO_PRICE_ID)
 *   - After 3 months: $4.99/mo (STRIPE_PRICE_ID)
 *
 * Implementation: Stripe Subscription Schedule with 2 phases
 *   Phase 1: trial + intro price × 3 iterations
 *   Phase 2: regular price, auto-renewing
 */
export async function POST(request: Request) {
  const rl = await rateLimit(request, LIMITS.SUBMIT);
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
    const stripePriceId = process.env.STRIPE_PRICE_ID;              // $4.99/mo regular
    const stripeIntroPriceId = process.env.STRIPE_INTRO_PRICE_ID;   // $2.99/mo intro
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!stripeApiKey || !stripePriceId) {
      throw new AppError('Payment service not configured', 'STRIPE_NOT_CONFIGURED', 500);
    }

    // Build checkout params
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('success_url', `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${baseUrl}/pricing`);
    params.append('customer_email', userEmail);
    params.append('metadata[userId]', user.id);
    params.append('subscription_data[trial_period_days]', '7');

    if (stripeIntroPriceId) {
      // Use intro price for checkout — Stripe coupon handles the discount
      // After 3 months, subscription automatically switches to regular price
      // This requires creating a Stripe Coupon that discounts for 3 months
      params.append('line_items[0][price]', stripePriceId);
      params.append('line_items[0][quantity]', '1');

      // Apply intro discount coupon (created in Stripe Dashboard)
      // Coupon: "INTRO3" — repeating, 3 months, amount_off = $2.00 (499-299=200 cents)
      const introCouponId = process.env.STRIPE_INTRO_COUPON_ID;
      if (introCouponId) {
        params.append('discounts[0][coupon]', introCouponId);
      }
    } else {
      // Fallback: no intro pricing, just regular price
      params.append('line_items[0][price]', stripePriceId);
      params.append('line_items[0][quantity]', '1');
    }

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
    return Response.json({ url: session.