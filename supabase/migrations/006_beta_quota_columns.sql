-- Migration 006: Beta quota tracking columns on user_profiles.
-- Tracks per-account lifetime usage + weekly rolling window.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS beta_uses_total int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS beta_week_start timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS beta_uses_week int DEFAULT 0;

COMMENT ON COLUMN user_profiles.beta_uses_total IS
  'Lifetime beta analysis count (resets when beta ends and paid tier begins)';
COMMENT ON COLUMN user_profiles.beta_uses_week IS
  'Rolling weekly beta analysis count (resets when beta_week_start + 7d < now())';
