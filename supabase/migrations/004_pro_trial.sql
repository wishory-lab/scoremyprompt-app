-- Migration 004: Pro Trial (맛보기) system
-- Allows free users to activate a 24-hour Pro experience once
-- Run this in Supabase SQL Editor

-- 1. Add trial columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false;

-- 2. Index for trial queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial
  ON user_profiles (trial_activated_at)
  WHERE trial_activated_at IS NOT NULL;
