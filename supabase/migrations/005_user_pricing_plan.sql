-- Migration 005: Track which Pro pricing plan a subscriber is on.
-- Existing Pro subscribers before this migration ran are assumed to be on the
-- $9.99 plan (Legacy); the Stripe webhook sets 'v2' for new checkouts after
-- STRIPE_PRICE_ID_499 is live.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS pricing_plan text
  CHECK (pricing_plan IN ('legacy_999', 'pro_499'));

-- Backfill: every row that already has tier='pro' is Legacy.
UPDATE user_profiles
SET pricing_plan = 'legacy_999'
WHERE tier = 'pro' AND pricing_plan IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_pricing_plan
  ON user_profiles(pricing_plan)
  WHERE pricing_plan IS NOT NULL;

-- Comment so human readers of the schema know the contract.
COMMENT ON COLUMN user_profiles.pricing_plan IS
  'Pricing plan: legacy_999 (original $9.99 subscribers, grandfathered) or pro_499 (new $4.99 subscribers). NULL for Free tier.';
