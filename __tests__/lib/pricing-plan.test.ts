import {
  resolvePricingPlanFromStripePrice,
  isLegacyPlan,
  displayPrice,
} from '@/app/lib/pricing-plan';

describe('pricing-plan helpers', () => {
  describe('resolvePricingPlanFromStripePrice', () => {
    it('returns legacy_999 for the legacy price id', () => {
      expect(resolvePricingPlanFromStripePrice('price_999_legacy', {
        legacy: 'price_999_legacy',
        v2: 'price_499_new',
      })).toBe('legacy_999');
    });
    it('returns pro_499 for the v2 price id', () => {
      expect(resolvePricingPlanFromStripePrice('price_499_new', {
        legacy: 'price_999_legacy',
        v2: 'price_499_new',
      })).toBe('pro_499');
    });
    it('returns null for unknown price id', () => {
      expect(resolvePricingPlanFromStripePrice('price_mystery', {
        legacy: 'price_999_legacy',
        v2: 'price_499_new',
      })).toBeNull();
    });
  });

  describe('isLegacyPlan', () => {
    it('returns true for legacy_999', () => {
      expect(isLegacyPlan('legacy_999')).toBe(true);
    });
    it('returns false for pro_499', () => {
      expect(isLegacyPlan('pro_499')).toBe(false);
    });
    it('returns false for null', () => {
      expect(isLegacyPlan(null)).toBe(false);
    });
  });

  describe('displayPrice', () => {
    it('returns $9.99 for legacy_999', () => {
      expect(displayPrice('legacy_999')).toBe('$9.99');
    });
    it('returns $4.99 for pro_499', () => {
      expect(displayPrice('pro_499')).toBe('$4.99');
    });
    it('returns the new-subscriber default $4.99 for null', () => {
      expect(displayPrice(null)).toBe('$4.99');
    });
  });
});
