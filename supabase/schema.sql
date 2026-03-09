-- ============================================
-- ScoreMyPrompt — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Analyses: 모든 프롬프트 분석 결과 저장
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
  anonymous_id TEXT, -- fingerprint or session ID for non-logged-in users
  ip_hash TEXT, -- hashed IP for rate limiting (never store raw IP)

  -- Share
  share_id TEXT UNIQUE, -- short ID for share URLs (e.g., /s/abc123)
  share_count INT DEFAULT 0,

  -- API usage tracking
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_overall_score ON analyses(overall_score DESC);
CREATE INDEX idx_analyses_job_role ON analyses(job_role);
CREATE INDEX idx_analyses_grade ON analyses(grade);
CREATE INDEX idx_analyses_share_id ON analyses(share_id) WHERE share_id IS NOT NULL;
CREATE INDEX idx_analyses_user_id ON analyses(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analyses_anonymous_id ON analyses(anonymous_id) WHERE anonymous_id IS NOT NULL;

-- 2. Waitlist: 뉴스레터 구독자
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website', -- website, share_page, etc.
  is_verified BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_waitlist_email ON waitlist(email);

-- 3. Weekly Leaderboard View (materialized for performance)
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT
  a.id,
  a.created_at,
  a.overall_score,
  a.grade,
  a.job_role,
  a.dim_precision,
  a.dim_role,
  a.dim_output_format,
  a.dim_mission_context,
  a.dim_prompt_structure,
  a.dim_tailoring,
  a.share_id,
  a.user_id,
  a.prompt_preview,
  ROW_NUMBER() OVER (ORDER BY a.overall_score DESC, a.created_at ASC) AS rank
FROM analyses a
WHERE a.created_at >= date_trunc('week', now())
  AND a.overall_score >= 50 -- minimum quality threshold
ORDER BY a.overall_score DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_leaderboard_weekly_id ON leaderboard_weekly(id);

-- Refresh function (call via cron or on-demand)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly;
END;
$$ LANGUAGE plpgsql;

-- 4. Daily Stats (for admin dashboard / monitoring)
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

-- 5. RLS (Row Level Security) Policies
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Public can read leaderboard-eligible analyses (no full prompt text)
CREATE POLICY "Public can read shared analyses"
  ON analyses FOR SELECT
  USING (share_id IS NOT NULL);

-- Authenticated users can read their own analyses
CREATE POLICY "Users can read own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- API can insert analyses (service role key)
CREATE POLICY "Service can insert analyses"
  ON analyses FOR INSERT
  WITH CHECK (true);

-- Waitlist: service role only
CREATE POLICY "Service can manage waitlist"
  ON waitlist FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Functions for API

-- Generate a short share ID
CREATE OR REPLACE FUNCTION generate_share_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Increment share count
CREATE OR REPLACE FUNCTION increment_share_count(analysis_share_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE analyses
  SET share_count = share_count + 1
  WHERE share_id = analysis_share_id;
END;
$$ LANGUAGE plpgsql;

-- Get role percentile
CREATE OR REPLACE FUNCTION get_role_percentile(p_score INT, p_job_role TEXT)
RETURNS INT AS $$
DECLARE
  total_count INT;
  below_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM analyses
  WHERE job_role = p_job_role
    AND created_at >= now() - INTERVAL '30 days';

  IF total_count = 0 THEN
    RETURN 50;
  END IF;

  SELECT COUNT(*) INTO below_count
  FROM analyses
  WHERE job_role = p_job_role
    AND overall_score < p_score
    AND created_at >= now() - INTERVAL '30 days';

  RETURN LEAST(99, GREATEST(1, (below_count * 100 / total_count)));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. User Profiles (Sprint 2: Auth + Value Gate)
-- ============================================

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

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service can manage profiles"
  ON user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);
