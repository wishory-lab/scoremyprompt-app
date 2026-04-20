-- Migration 003: Credit-based monetization system
-- SMP Revenue Model v2: Guest(2) → Free(3+ads) → Premium(33, no ads)
-- Run this in Supabase SQL Editor

-- 1. Update tier CHECK constraint to include 'premium' (replace 'pro')
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_tier_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_tier_check
  CHECK (tier IN ('free', 'pro', 'premium'));

-- 2. Add credit system columns
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS bonus_credits INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ad_credits_today INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_ad_credit_date DATE,
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- 3. Migrate existing 'pro' users to 'premium'
UPDATE user_profiles SET tier = 'premium' WHERE tier = 'pro';

-- 4. Now remove 'pro' from allowed values (optional, keep for backward compat)
-- ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_tier_check;
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_tier_check
--   CHECK (tier IN ('free', 'premium'));

-- 5. Create ad_reward_log table to prevent abuse
CREATE TABLE IF NOT EXISTS ad_reward_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  reward_type TEXT DEFAULT 'analysis_credit',
  ip_hash TEXT,
  -- Fraud detection: ad session token from client
  ad_session_token TEXT
);

-- 6. Index for daily ad reward count queries
CREATE INDEX IF NOT EXISTS idx_ad_reward_log_user_daily
  ON ad_reward_log (user_id, created_at DESC);

-- 7. Index for user_profiles credit lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier
  ON user_profiles (tier);

-- 8. Function to reset daily credits (run via Supabase cron or Edge Function)
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET analyses_today = 0,
      ad_credits_today = 0,
      last_analysis_date = NULL
  WHERE analyses_today > 0 OR ad_credits_today > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update existing handle_new_user() to grant 10 bonus credits on signup
-- (merges with existing trigger instead of creating a duplicate)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url, tier, bonus_credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    10  -- signup bonus
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. (no new trigger needed — existing on_auth_user_created still fires handle_new_user)

-- 11. RLS for ad_reward_log
ALTER TABLE ad_reward_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ad rewards" ON ad_reward_log;
CREATE POLICY "Users can read own ad rewards" ON ad_reward_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ad rewards" ON ad_reward_log;
CREATE POLICY "Users can insert own ad rewards" ON ad_reward_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
