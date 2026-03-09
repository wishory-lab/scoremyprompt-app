-- ScoreMyPrompt Database Schema
-- Step 1: Tables
-- Run this in Supabase SQL Editor

-- 1. Analyses: stores all prompt analysis results
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Input (prompt_text removed for privacy; only preview stored)
  prompt_preview TEXT,
  job_role TEXT NOT NULL CHECK (job_role IN ('Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other')),

  -- PROMPT Score Results
  overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  grade CHAR(1) NOT NULL CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),

  -- 6 Dimensions (stored individually for leaderboard queries)
  dim_precision INT NOT NULL DEFAULT 0,
  dim_role INT NOT NULL DEFAULT 0,
  dim_output_format INT NOT NULL DEFAULT 0,
  dim_mission_context INT NOT NULL DEFAULT 0,
  dim_prompt_structure INT NOT NULL DEFAULT 0,
  dim_tailoring INT NOT NULL DEFAULT 0,

  -- Full JSON result for detailed view
  result_json JSONB NOT NULL,

  -- AI Rewrite suggestion
  rewrite_suggestion TEXT,

  -- User tracking (anonymous or authenticated)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  ip_hash TEXT,

  -- Share
  share_id TEXT UNIQUE,
  share_count INT DEFAULT 0,

  -- API usage tracking
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0
);

-- 2. Waitlist: newsletter subscribers
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  is_verified BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ
);

-- 3. Daily Stats: admin dashboard / monitoring
CREATE TABLE daily_stats (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  total_analyses INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  grade_s_count INT DEFAULT 0,
  grade_a_count INT DEFAULT 0,
  grade_b_count INT DEFAULT 0,
  grade_c_count INT DEFAULT 0,
  grade_d_count INT DEFAULT 0,
  total_input_tokens INT DEFAULT 0,
  total_output_tokens INT DEFAULT 0,
  estimated_cost_usd DECIMAL(8,4) DEFAULT 0,
  waitlist_signups INT DEFAULT 0
);

-- 4. User Profiles (Auth + Value Gate)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  display_name TEXT,
  avatar_url TEXT,
  job_role TEXT DEFAULT 'Other',
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  analyses_today INT DEFAULT 0,
  last_analysis_date TIMESTAMPTZ,
  total_analyses INT DEFAULT 0,
  best_score INT DEFAULT 0,
  best_grade CHAR(1)
);
