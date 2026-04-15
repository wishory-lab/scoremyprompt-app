-- Migration 004: Harness Builder tables
-- builder_outputs: generated file maps, 5-min TTL (pg_cron cleanup)
-- builder_quota: one row per user per calendar month

CREATE TABLE IF NOT EXISTS builder_outputs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers       jsonb NOT NULL,       -- { role, goals, tone, tools, automation, lang }
  files         jsonb NOT NULL,       -- { "CLAUDE.md": "...", "/agents/research_agent.md": "...", ... }
  is_pro_build  boolean DEFAULT false,
  expires_at    timestamptz DEFAULT (now() + interval '5 minutes') NOT NULL,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_outputs_user
  ON builder_outputs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_builder_outputs_expires
  ON builder_outputs(expires_at);

CREATE TABLE IF NOT EXISTS builder_quota (
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_key         text NOT NULL,        -- "YYYY-MM"
  builds_used       int  DEFAULT 0 NOT NULL,
  bonus_from_share  int  DEFAULT 0 NOT NULL,
  last_share_at     timestamptz,
  last_build_id     uuid REFERENCES builder_outputs(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, month_key)
);

-- RLS
ALTER TABLE builder_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own builder outputs"
  ON builder_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert builder outputs"
  ON builder_outputs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can delete builder outputs"
  ON builder_outputs FOR DELETE
  USING (true);

CREATE POLICY "Users can read own quota"
  ON builder_quota FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can upsert quota"
  ON builder_quota FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update quota"
  ON builder_quota FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- pg_cron cleanup job (5-minute cadence, deletes expired rows)
-- NOTE: requires pg_cron extension; if unavailable, schedule a manual cron webhook instead.
-- Run once in SQL editor:
-- SELECT cron.schedule(
--   'builder-outputs-ttl',
--   '* * * * *',
--   $$DELETE FROM builder_outputs WHERE expires_at < now()$$
-- );
