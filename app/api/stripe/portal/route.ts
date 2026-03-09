import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';

export async function POST(request: Request) {
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

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.stripe_customer_id) {
      throw new AppError('Stripe customer ID not found', 'NO_STRIPE_CUSTOMER', 404);
    }

    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!stripeApiKey) {
      throw new AppError('Payment service not configured', 'STRIPE_NOT_CONFIGURED', 500);
    }

    const params = new URLSearchParams();
    params.append('customer', userProfile.stripe_customer_id);
    params.append('return_url', `${baseUrl}/dashboard`);

    const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${stripeApiKey}`,
      },
      body: params.toString(),
    });

    if (!portalResponse.ok) {
      const errorData = await portalResponse.json();
      logger.error('Stripe API error', { error: JSON.stringify(errorData) });
      throw new AppError('Failed to create portal session', 'STRIPE_ERROR', portalResponse.status);
    }

    const session = await portalResponse.json();
    return Response.json({ url: session.url }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Portal error', { error: String(error) });
    return errorResponse(error as Error);
  }
}
