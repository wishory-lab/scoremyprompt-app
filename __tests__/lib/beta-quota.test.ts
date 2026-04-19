import {
  checkBetaQuota,
  BETA_PER_ACCOUNT,
  BETA_PER_WEEK,
  shouldResetWeek,
} from '@/app/lib/beta-quota';

describe('beta-quota', () => {
  describe('shouldResetWeek', () => {
    it('returns true if week start is more than 7 days ago', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      expect(shouldResetWeek(eightDaysAgo)).toBe(true);
    });
    it('returns false if week start is within 7 days', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      expect(shouldResetWeek(twoDaysAgo)).toBe(false);
    });
    it('returns true if week start is null', () => {
      expect(shouldResetWeek(null)).toBe(true);
    });
  });

  describe('checkBetaQuota', () => {
    it('allows a fresh user', () => {
      const result = checkBetaQuota({ betaUsesTotal: 0, betaUsesWeek: 0, weekNeedsReset: false });
      expect(result.allowed).toBe(true);
      expect(result.remainingAccount).toBe(BETA_PER_ACCOUNT);
    });
    it('denies when account limit reached', () => {
      const result = checkBetaQuota({ betaUsesTotal: BETA_PER_ACCOUNT, betaUsesWeek: 0, weekNeedsReset: false });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/account/i);
    });
    it('denies when weekly limit reached', () => {
      const result = checkBetaQuota({ betaUsesTotal: 10, betaUsesWeek: BETA_PER_WEEK, weekNeedsReset: false });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/week/i);
    });
    it('allows when week needs reset even if weekly counter was high', () => {
      const result = checkBetaQuota({ betaUsesTotal: 10, betaUsesWeek: 300, weekNeedsReset: true });
      expect(result.allowed).toBe(true);
      expect(result.remainingWeek).toBe(BETA_PER_WEEK);
    });
  });

  describe('constants', () => {
    it('BETA_PER_ACCOUNT is 50', () => expect(BETA_PER_ACCOUNT).toBe(50));
    it('BETA_PER_WEEK is 300', () => expect(BETA_PER_WEEK).toBe(300));
  });
});
