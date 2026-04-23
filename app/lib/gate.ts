import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tier, GateCheckResult } from '../types';
import { TIER_LIMITS, MAX_AD_CREDITS_PER_DAY, TRIAL_DURATION_MS } from '../constants';

export { TIER_LIMITS };

/** Check if a user has an active Pro trial */
export function isTrialActive(trialActivatedAt: string | null | undefined): boolean {
  if (!trialActivatedAt) return false;
  const activatedAt = new Date(trialActivatedAt).getTime();
  return Date.now() < activatedAt + TRIAL_DURATION_MS;
}

/** Get trial expiry timestamp (ms) */
export function getTrialExpiresAt(trialActivatedAt: string): number {
  return new Date(trialActivatedAt).getTime() + TRIAL_DURATION_MS;
}

export function hashIP(ip: string): string {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// ─── Guest usage count (IP-based) ───

export async function getGuestUsageCount(supabase: SupabaseClient, ipHash: string): Promise<number> {
  if (!supabase || !ipHash) return 0;

  try {
    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('guest_ip_hash', ipHash)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if (error) {
      console.warn('Error fetching guest usage count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error in getGuestUsageCount:', err);
    return 0;
  }
}

// ─── Main gate check ───

/**
 * SMP Credit System Gate Check
 *
 * 🎉 오픈 이벤트 (~2025.05.31)
 * Guest (비로그인):   5회/일 — 초과 시 회원가입 유도
 * Free  (무료 회원):  50회/일 기본 + 보너스크레딧 + 광고 시청으로 추가 획득
 * Premium (월 구독):  무제한 — 광고 없음
 */
export async function checkGate(
  supabase: SupabaseClient | null,
  userId: string | null,
  tier: Tier,
  options: { ipHash?: string } = {}
): Promise<GateCheckResult> {
  if (!supabase) {
    return { allowed: false, remaining: 0, limit: 0, message: 'Service unavailable' };
  }

  // ─── Premium tier ───
  if (tier === 'premium') {
    const limit = TIER_LIMITS.premium;

    // Check grace period
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('grace_period_end, analyses_today')
        .eq('id', userId)
        .single();

      if (profile?.grace_period_end) {
        const graceEnd = new Date(profile.grace_period_end);
        if (graceEnd < new Date()) {
          // Grace period expired — treat as free
          return checkGate(supabase, userId, 'free', options);
        }
      }

      const used = profile?.analyses_today || 0;
      const remaining = Math.max(0, limit - used);
      return {
        allowed: used < limit,
        remaining,
        limit,
        message: remaining > 0
          ? `${remaining} analyses remaining today`
          : 'Daily Premium limit reached. Resets at midnight.',
      };
    }

    return { allowed: true, remaining: limit, limit, message: `${limit} analyses available today` };
  }

  // ─── Guest tier (비로그인) ───
  if (tier === 'guest') {
    const limit = TIER_LIMITS.guest; // 2
    const ipHash = options.ipHash;

    if (!ipHash) {
      return { allowed: false, remaining: 0, limit, message: 'Cannot determine guest identity' };
    }

    const usageCount = await getGuestUsageCount(supabase, ipHash);
    const remaining = Math.max(0, limit - usageCount);

    if (usageCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        message: 'Sign up for free to get more analyses! You\'ll receive 10 bonus credits.',
        showAdPrompt: false,
      };
    }

    return { allowed: true, remaining, limit, message: `${remaining} free analyses remaining` };
  }

  // ─── Free tier (무료 회원) ───
  const baseLimit = TIER_LIMITS.free; // 3

  if (!userId) {
    return { allowed: false, remaining: 0, limit: baseLimit, message: 'Please sign in to continue' };
  }

  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('analyses_today, bonus_credits, ad_credits_today')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.warn('Could not fetch profile for gate check:', error);
      return { allowed: true, remaining: baseLimit, limit: baseLimit, message: `${baseLimit} analyses remaining` };
    }

    const usedToday = profile.analyses_today || 0;
    const bonusCredits = profile.bonus_credits || 0;
    const adCreditsToday = profile.ad_credits_today || 0;

    // Total available = base daily + bonus credits + ad credits earned today
    const totalAvailable = baseLimit + bonusCredits + adCreditsToday;
    const remaining = Math.max(0, totalAvailable - usedToday);

    if (usedToday < totalAvailable) {
      // Determine which pool is being used
      let source = 'daily';
      if (usedToday >= baseLimit && bonusCredits > 0) source = 'bonus';
      if (usedToday >= baseLimit + bonusCredits) source = 'ad';

      return {
        allowed: true,
        remaining,
        limit: totalAvailable,
        message: source === 'bonus'
          ? `Using bonus credit (${bonusCredits - Math.max(0, usedToday - baseLimit)} left)`
          : source === 'ad'
            ? `Using ad credit (${remaining} left today)`
            : `${remaining} analyses remaining today`,
        adCreditsUsed: adCreditsToday,
      };
    }

    // All credits exhausted — show ad prompt
    const canWatchAd = adCreditsToday < MAX_AD_CREDITS_PER_DAY;

    return {
      allowed: false,
      remaining: 0,
      limit: totalAvailable,
      message: canWatchAd
        ? 'Daily limit reached. Watch a short ad to get 1 more analysis!'
        : 'Daily limit reached. Upgrade to Premium for unlimited analyses!',
      showAdPrompt: canWatchAd,
      adCreditsUsed: adCreditsToday,
    };
  } catch (err) {
    console.error('Error in checkGate:', err);
    return { allowed: false, remaining: 0, limit: baseLimit, message: 'Error checking usage limits' };
  }
}

// ─── Consume a credit after successful analysis ───

export async function consumeCredit(
  supabase: SupabaseClient,
  userId: string,
  tier: Tier
): Promise<void> {
  try {
    // Increment analyses_today
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('analyses_today, bonus_credits')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const usedToday = (profile.analyses_today || 0) + 1;
    const baseLimit = TIER_LIMITS[tier] || TIER_LIMITS.free;

    const updates: Record<string, unknown> = {
      analyses_today: usedToday,
      last_analysis_date: new Date().toISOString(),
    };

    // If exceeding base limit, consume bonus credit first
    if (tier === 'free' && usedToday > TIER_LIMITS.free && profile.bonus_credits > 0) {
      updates.bonus_credits = Math.max(0, profile.bonus_credits - 1);
    }

    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
  } catch (err) {
    console.error('Error consuming credit:', err);
  }
}
