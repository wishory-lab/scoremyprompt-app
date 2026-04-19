import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';

export const BETA_PER_ACCOUNT = 50;
export const BETA_PER_WEEK = 300;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldResetWeek(weekStart: string | null): boolean {
  if (!weekStart) return true;
  return Date.now() - new Date(weekStart).getTime() > WEEK_MS;
}

export interface BetaQuotaInput {
  betaUsesTotal: number;
  betaUsesWeek: number;
  weekNeedsReset: boolean;
}

export interface BetaQuotaResult {
  allowed: boolean;
  remainingAccount: number;
  remainingWeek: number;
  reason?: string;
}

/** Pure logic — no DB calls. Testable independently. */
export function checkBetaQuota(input: BetaQuotaInput): BetaQuotaResult {
  const effectiveWeek = input.weekNeedsReset ? 0 : input.betaUsesWeek;
  const remainingAccount = Math.max(0, BETA_PER_ACCOUNT - input.betaUsesTotal);
  const remainingWeek = Math.max(0, BETA_PER_WEEK - effectiveWeek);

  if (input.betaUsesTotal >= BETA_PER_ACCOUNT) {
    return {
      allowed: false,
      remainingAccount: 0,
      remainingWeek,
      reason: `Beta account limit reached (${BETA_PER_ACCOUNT} total uses). Full access coming soon.`,
    };
  }
  if (!input.weekNeedsReset && input.betaUsesWeek >= BETA_PER_WEEK) {
    return {
      allowed: false,
      remainingAccount,
      remainingWeek: 0,
      reason: `Weekly beta limit reached (${BETA_PER_WEEK}/week). Try again next week.`,
    };
  }
  return { allowed: true, remainingAccount, remainingWeek };
}

/** Read quota state from DB, check, and return result. */
export async function getBetaQuotaForUser(userId: string): Promise<BetaQuotaResult> {
  const supa = getSupabaseAdmin();
  if (!supa) return { allowed: true, remainingAccount: BETA_PER_ACCOUNT, remainingWeek: BETA_PER_WEEK };

  const { data, error } = await supa
    .from('user_profiles')
    .select('beta_uses_total, beta_week_start, beta_uses_week')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logger.warn('beta quota read failed', { error: error.message });
    return { allowed: true, remainingAccount: BETA_PER_ACCOUNT, remainingWeek: BETA_PER_WEEK };
  }

  const betaUsesTotal = (data?.beta_uses_total as number) ?? 0;
  const betaUsesWeek = (data?.beta_uses_week as number) ?? 0;
  const weekStart = (data?.beta_week_start as string) ?? null;
  const weekNeedsReset = shouldResetWeek(weekStart);

  return checkBetaQuota({ betaUsesTotal, betaUsesWeek, weekNeedsReset });
}

/** Increment counters after a successful analysis. */
export async function incrementBetaUse(userId: string): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) return;

  const { data } = await supa
    .from('user_profiles')
    .select('beta_uses_total, beta_week_start, beta_uses_week')
    .eq('id', userId)
    .maybeSingle();

  const weekStart = (data?.beta_week_start as string) ?? null;
  const needsReset = shouldResetWeek(weekStart);

  const update: Record<string, unknown> = {
    beta_uses_total: ((data?.beta_uses_total as number) ?? 0) + 1,
  };

  if (needsReset) {
    update.beta_week_start = new Date().toISOString();
    update.beta_uses_week = 1;
  } else {
    update.beta_uses_week = ((data?.beta_uses_week as number) ?? 0) + 1;
  }

  await supa.from('user_profiles').update(update).eq('id', userId);
}
