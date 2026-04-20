/**
 * POST /api/ad-reward
 *
 * Called after user watches a rewarded ad (timer popup).
 * Grants 1 additional analysis credit for the day.
 *
 * Requires authenticated user (free tier).
 * Returns updated credit info.
 */

import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import { MAX_AD_CREDITS_PER_DAY, AD_WATCH_SECONDS } from '@/app/constants';

export async function POST(request: Request) {
  const rl = await rateLimit(request, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;

  try {
    // ─── Auth check ───
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 'AUTH_MISSING', 401);
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new AppError('Database not configured', 'DB_NOT_CONFIGURED', 500);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.substring(7));
    if (authError || !user) {
      throw new AppError('Unauthorized', 'AUTH_INVALID', 401);
    }

    // ─── Get user profile ───
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tier, ad_credits_today, last_ad_credit_date')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AppError('Profile not found', 'PROFILE_NOT_FOUND', 404);
    }

    // Premium users don't need ads
    if (profile.tier === 'premium' || profile.tier === 'pro') {
      return Response.json({
        success: false,
        message: 'Premium users don\'t need to watch ads!',
      }, { status: 400 });
    }

    // ─── Check daily ad credit limit ───
    const today = new Date().toISOString().split('T')[0];
    const lastAdDate = profile.last_ad_credit_date;
    let adCreditsToday = profile.ad_credits_today || 0;

    // Reset if it's a new day
    if (lastAdDate !== today) {
      adCreditsToday = 0;
    }

    if (adCreditsToday >= MAX_AD_CREDITS_PER_DAY) {
      return Response.json({
        success: false,
        message: `Daily ad credit limit (${MAX_AD_CREDITS_PER_DAY}) reached. Upgrade to Premium!`,
        adCreditsToday,
        maxAdCredits: MAX_AD_CREDITS_PER_DAY,
      }, { status: 429 });
    }

    // ─── Validate request body ───
    const body = await request.json().catch(() => ({}));
    const watchDuration = (body as Record<string, unknown>).watchDuration as number;

    // Basic fraud prevention: client must report watching for at least AD_WATCH_SECONDS
    if (!watchDuration || watchDuration < AD_WATCH_SECONDS - 2) {
      throw new AppError('Ad was not watched completely', 'AD_INCOMPLETE', 400);
    }

    // ─── Grant credit ───
    const newAdCredits = adCreditsToday + 1;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        ad_credits_today: newAdCredits,
        last_ad_credit_date: today,
      })
      .eq('id', user.id);

    if (updateError) {
      logger.error('Failed to grant ad credit', { userId: user.id, error: updateError.message });
      throw new AppError('Failed to grant credit', 'UPDATE_FAILED', 500);
    }

    // ─── Log for fraud detection ───
    const ipHash = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    await supabase.from('ad_reward_log').insert({
      user_id: user.id,
      reward_type: 'analysis_credit',
      ip_hash: ipHash ? ipHash.substring(0, 16) : null,
      ad_session_token: (body as Record<string, unknown>).sessionToken as string || null,
    });

    logger.info(`Ad credit granted to user ${user.id}`, { adCreditsToday: newAdCredits });

    return Response.json({
      success: true,
      message: 'Credit granted! You can now analyze another prompt.',
      adCreditsToday: newAdCredits,
      maxAdCredits: MAX_AD_CREDITS_PER_DAY,
      creditsRemaining: MAX_AD_CREDITS_PER_DAY - newAdCredits,
    });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Ad reward error', { error: String(error) });
    return errorResponse(error as Error);
  }
}
