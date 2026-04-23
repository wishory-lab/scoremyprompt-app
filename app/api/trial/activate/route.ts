import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import { TRIAL_DURATION_MS } from '@/app/constants';

/**
 * POST /api/trial/activate
 * Activates a 24-hour Pro trial for authenticated free-tier users.
 * One-time only per account.
 */
export async function POST(request: Request) {
  const rl = await rateLimit(request, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;

  try {
    // ── Auth check ──
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('로그인이 필요합니다.', 'AUTH_MISSING', 401);
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new AppError('서비스를 사용할 수 없습니다.', 'DB_NOT_CONFIGURED', 500);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.substring(7));
    if (authError || !user) {
      throw new AppError('인증에 실패했습니다.', 'AUTH_INVALID', 401);
    }

    // ── Check current profile ──
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tier, trial_used, trial_activated_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AppError('프로필을 찾을 수 없습니다.', 'PROFILE_NOT_FOUND', 404);
    }

    // Premium users don't need a trial
    if (profile.tier === 'premium') {
      throw new AppError('이미 프리미엄 회원입니다.', 'ALREADY_PREMIUM', 400);
    }

    // Check if already used
    if (profile.trial_used) {
      throw new AppError('이미 Pro 맛보기를 사용하셨습니다. 프리미엄으로 업그레이드하세요!', 'TRIAL_ALREADY_USED', 400);
    }

    // Check if trial is currently active
    if (profile.trial_activated_at) {
      const activatedAt = new Date(profile.trial_activated_at).getTime();
      const expiresAt = activatedAt + TRIAL_DURATION_MS;
      if (Date.now() < expiresAt) {
        throw new AppError('Pro 맛보기가 이미 활성화되어 있습니다.', 'TRIAL_ACTIVE', 400);
      }
    }

    // ── Activate trial ──
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        trial_activated_at: now,
        trial_used: true,
        // Reset daily analysis count so user gets full premium experience
        analyses_today: 0,
      })
      .eq('id', user.id);

    if (updateError) {
      logger.error('Trial activation failed', { error: updateError.message, userId: user.id });
      throw new AppError('트라이얼 활성화에 실패했습니다.', 'TRIAL_ACTIVATE_FAILED', 500);
    }

    const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();

    logger.info('Pro trial activated', { userId: user.id, expiresAt });

    return Response.json({
      success: true,
      trial_activated_at: now,
      expires_at: expiresAt,
      message: 'Pro 맛보기가 활성화되었습니다! 24시간 동안 모든 Pro 기능을 무료로 이용하세요.',
    });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Trial activation error', { error: String(error) });
    return errorResponse(error as Error);
  }
}
