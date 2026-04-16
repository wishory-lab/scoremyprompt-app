/**
 * Canonical helpers for the Pro pricing plan column.
 *
 * Legacy subscribers ($9.99 → price_999_legacy) remain grandfathered forever.
 * New subscribers use the $4.99 v2 plan (price_499_new).
 */

export type PricingPlan = 'legacy_999' | 'pro_499';

export interface StripePriceIds {
  legacy: string;
  v2: string;
}

/** Look up the plan corresponding to a Stripe price id. Returns null if unknown. */
export function resolvePricingPlanFromStripePrice(
  priceId: string,
  env: StripePriceIds,
): PricingPlan | null {
  if (priceId === env.legacy) return 'legacy_999';
  if (priceId === env.v2) return 'pro_499';
  return null;
}

/** True if this plan is a grandfathered Legacy subscription. */
export function isLegacyPlan(plan: PricingPlan | null): boolean {
  return plan === 'legacy_999';
}

/** Human-readable price string. Null defaults to the current advertised price. */
export function displayPrice(plan: PricingPlan | null): string {
  if (plan === 'legacy_999') return '$9.99';
  return '$4.99';
}

/** Read both Stripe price ids from env. Throws if v2 is missing (legacy optional). */
export function readStripePriceIds(): StripePriceIds {
  const legacy = process.env.STRIPE_PRICE_ID ?? '';
  const v2 = process.env.STRIPE_PRICE_ID_499 ?? '';
  if (!v2) {
    throw new Error('STRIPE_PRICE_ID_499 env var is required (Sprint 3).');
  }
  return { legacy, v2 };
}
