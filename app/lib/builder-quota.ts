import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';
import {
  FREE_MONTHLY_BUILDS,
  PRO_MONTHLY_BUILDS,
  MAX_SHARE_BONUS_PER_MONTH,
  type BuilderQuotaResponse,
} from '@/app/types/builder';

/** "2026-04" — always UTC to keep month boundary deterministic. */
export function currentMonthKey(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export interface QuotaState {
  monthKey: string;
  buildsUsed: number;
  bonusFromShare: number;
  limit: number;
  canBuild: boolean;
  tier: 'free' | 'pro';
}

export async function getQuota(userId: string, tier: 'free' | 'pro'): Promise<QuotaState> {
  const supa = getSupabaseAdmin();
  const monthKey = currentMonthKey();
  const baseLimit = tier === 'pro' ? PRO_MONTHLY_BUILDS : FREE_MONTHLY_BUILDS;

  if (!supa) {
    return { monthKey, buildsUsed: 0, bonusFromShare: 0, limit: baseLimit, canBuild: true, tier };
  }

  const { data, error } = await supa
    .from('builder_quota')
    .select('builds_used, bonus_from_share')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (error) {
    logger.warn('builder_quota read failed', { error: error.message });
    return { monthKey, buildsUsed: 0, bonusFromShare: 0, limit: baseLimit, canBuild: true, tier };
  }

  const buildsUsed = (data?.builds_used as number) ?? 0;
  const bonusFromShare = (data?.bonus_from_share as number) ?? 0;
  const effectiveLimit = baseLimit + bonusFromShare;
  return {
    monthKey,
    buildsUsed,
    bonusFromShare,
    limit: effectiveLimit,
    canBuild: buildsUsed < effectiveLimit,
    tier,
  };
}

/** Called after a successful generate. Upserts the quota row and increments builds_used. */
export async function incrementBuilds(userId: string, buildId: string): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) return;
  const monthKey = currentMonthKey();
  const { data: existing } = await supa
    .from('builder_quota')
    .select('builds_used')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (existing) {
    await supa
      .from('builder_quota')
      .update({
        builds_used: ((existing.builds_used as number) ?? 0) + 1,
        last_build_id: buildId,
      })
      .eq('user_id', userId)
      .eq('month_key', monthKey);
  } else {
    await supa.from('builder_quota').insert({
      user_id: userId,
      month_key: monthKey,
      builds_used: 1,
      bonus_from_share: 0,
      last_build_id: buildId,
    });
  }
}

/** Called from /api/builder/claim-share. Adds at most MAX_SHARE_BONUS_PER_MONTH. */
export async function claimShareBonus(userId: string, buildId: string): Promise<QuotaState | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const monthKey = currentMonthKey();

  const { data: existing } = await supa
    .from('builder_quota')
    .select('builds_used, bonus_from_share, last_build_id')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (!existing) return null;
  if ((existing.bonus_from_share as number) >= MAX_SHARE_BONUS_PER_MONTH) {
    return getQuota(userId, 'free');     // already claimed — no-op
  }
  if ((existing.last_build_id as string | null) !== buildId) {
    return null;     // can only claim for the last build in this month
  }

  await supa
    .from('builder_quota')
    .update({
      bonus_from_share: (existing.bonus_from_share as number) + 1,
      last_share_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('month_key', monthKey);

  return getQuota(userId, 'free');
}

export function quotaToResponse(state: QuotaState): BuilderQuotaResponse {
  return {
    monthKey: state.monthKey,
    buildsUsed: state.buildsUsed,
    bonusFromShare: state.bonusFromShare,
    limit: state.limit,
    canBuild: state.canBuild,
    tier: state.tier,
  };
}
