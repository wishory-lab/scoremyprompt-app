-- ScoreMyPrompt · Sprint 1+2+3 통합 마이그레이션
-- Supabase Studio > SQL Editor 에서 한 번에 붙여넣고 Run.
-- 작성일: 2026-04-17 · 커밋 기준: PR #1

-- ============================================================
-- Migration 003: Harness Score storage (Sprint 1)
-- ============================================================

CREATE TABLE IF NOT EXISTS harness_scores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id  text,
  ip_hash       text,
  share_id      text UNIQUE,
  input_preview text,
  input_hash    text,
  scores        jsonb NOT NULL,
  total         int  NOT NULL CHECK (total BETWEEN 0 AND 100),
  tier          text NOT NULL CHECK (tier IN ('Elite','Proficient','Developing','NeedsHarness')),
  feedback      jsonb NOT NULL,
  quick_wins    jsonb NOT NULL,
  lang          text DEFAULT 'en',
  input_tokens  int,
  output_tokens int,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_harness_user_created ON harness_scores(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_harness_share ON harness_scores(share_id) WHERE share_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_harness_ip_created ON harness_scores(ip_hash, created_at DESC) WHERE ip_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_harness_input_hash ON harness_scores(input_hash) WHERE input_hash IS NOT NULL;

ALTER TABLE harness_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read shared harness scores" ON harness_scores;
CREATE POLICY "Public can read shared harness scores" ON harness_scores FOR SELECT USING (share_id IS NOT NULL);
DROP POLICY IF EXISTS "Users can read own harness scores" ON harness_scores;
CREATE POLICY "Users can read own harness scores" ON harness_scores FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service can insert harness scores" ON harness_scores;
CREATE POLICY "Service can insert harness scores" ON harness_scores FOR INSERT WITH CHECK (true);

-- ============================================================
-- Migration 004: Harness Builder tables (Sprint 2)
-- ============================================================

CREATE TABLE IF NOT EXISTS builder_outputs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers       jsonb NOT NULL,
  files         jsonb NOT NULL,
  is_pro_build  boolean DEFAULT false,
  expires_at    timestamptz DEFAULT (now() + interval '5 minutes') NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_outputs_user ON builder_outputs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_builder_outputs_expires ON builder_outputs(expires_at);

CREATE TABLE IF NOT EXISTS builder_quota (
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_key         text NOT NULL,
  builds_used       int  DEFAULT 0 NOT NULL,
  bonus_from_share  int  DEFAULT 0 NOT NULL,
  last_share_at     timestamptz,
  last_build_id     uuid REFERENCES builder_outputs(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, month_key)
);

ALTER TABLE builder_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_quota ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own builder outputs" ON builder_outputs;
CREATE POLICY "Users can read own builder outputs" ON builder_outputs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service can insert builder outputs" ON builder_outputs;
CREATE POLICY "Service can insert builder outputs" ON builder_outputs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can delete builder outputs" ON builder_outputs;
CREATE POLICY "Service can delete builder outputs" ON builder_outputs FOR DELETE USING (true);
DROP POLICY IF EXISTS "Users can read own quota" ON builder_quota;
CREATE POLICY "Users can read own quota" ON builder_quota FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service can upsert quota" ON builder_quota;
CREATE POLICY "Service can upsert quota" ON builder_quota FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service can update quota" ON builder_quota;
CREATE POLICY "Service can update quota" ON builder_quota FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- Migration 005: user_profiles.pricing_plan (Sprint 3)
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS pricing_plan text
  CHECK (pricing_plan IN ('legacy_999', 'pro_499'));

-- Backfill: all existing Pro users → Legacy
UPDATE user_profiles
SET pricing_plan = 'legacy_999'
WHERE tier = 'pro' AND pricing_plan IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_pricing_plan
  ON user_profiles(pricing_plan)
  WHERE pricing_plan IS NOT NULL;

COMMENT ON COLUMN user_profiles.pricing_plan IS
  'Pricing plan: legacy_999 (원 $9.99 구독자, grandfathered) or pro_499 (신규 $4.99 구독자). NULL for Free tier.';

-- ============================================================
-- pg_cron: builder_outputs TTL 정리 (5분)
-- * 주의: pg_cron extension 활성화 필요 (Supabase Dashboard > Database > Extensions)
-- * 권한 이슈 시 Supabase support 문의 또는 Vercel Cron 라우트로 대체
-- ============================================================

-- Extension 활성화 (이미 활성화된 경우 스킵됨)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 기존 job 제거 (idempotent)
SELECT cron.unschedule('builder-outputs-ttl')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'builder-outputs-ttl');

-- 1분마다 만료 레코드 삭제
SELECT cron.schedule(
  'builder-outputs-ttl',
  '* * * * *',
  $$DELETE FROM builder_outputs WHERE expires_at < now()$$
);

-- ============================================================
-- 검증 쿼리 (실행 후 확인용)
-- ============================================================

SELECT
  'harness_scores' AS table_name,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'harness_scores') AS exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'harness_scores') AS policies
UNION ALL
SELECT
  'builder_outputs',
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'builder_outputs'),
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'builder_outputs')
UNION ALL
SELECT
  'builder_quota',
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'builder_quota'),
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'builder_quota')
UNION ALL
SELECT
  'user_profiles.pricing_plan',
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'user_profiles' AND column_name = 'pricing_plan'),
  0;

-- Legacy Pro 유저 수 확인
SELECT pricing_plan, COUNT(*) FROM user_profiles GROUP BY pricing_plan;

-- ============================================================
-- DB 정리 정책: analyses 90일 TTL + harness_scores 90일 TTL
-- 무한 성장 방지 (Supabase 500MB 한도 관리)
-- ============================================================

SELECT cron.schedule(
  'analyses-90d-ttl',
  '0 3 * * *',
  $$DELETE FROM analyses WHERE created_at < now() - interval '90 days'$$
);

SELECT cron.schedule(
  'harness-scores-90d-ttl',
  '0 3 * * *',
  $$DELETE FROM harness_scores WHERE created_at < now() - interval '90 days'$$
);

-- ============================================================
-- Migration 006: Beta quota columns (Sprint 4)
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS beta_uses_total int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS beta_week_start timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS beta_uses_week int DEFAULT 0;

COMMENT ON COLUMN user_profiles.beta_uses_total IS
  'Lifetime beta analysis count (Sprint 4)';
COMMENT ON COLUMN user_profiles.beta_uses_week IS
  'Rolling weekly beta count — resets when beta_week_start + 7d < now()';
