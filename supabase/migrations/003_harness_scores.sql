-- Migration 003: Harness Score storage
-- Stores scoring results for /api/harness/analyze.
-- Mirrors `analyses` table patterns (user_id nullable, share_id for public lookups, ip_hash for anon rate limiting).

CREATE TABLE IF NOT EXISTS harness_scores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id  text,
  ip_hash       text,
  share_id      text UNIQUE,

  -- Input: first 200 chars only for preview; full text NOT stored (privacy)
  input_preview text,
  input_hash    text,

  -- Scoring result
  scores        jsonb NOT NULL,       -- { H, A, R, N, E, S } integers
  total         int  NOT NULL CHECK (total BETWEEN 0 AND 100),
  tier          text NOT NULL CHECK (tier IN ('Elite','Proficient','Developing','NeedsHarness')),
  feedback      jsonb NOT NULL,       -- array of { dim, issue, fix }
  quick_wins    jsonb NOT NULL,       -- array of strings

  lang          text DEFAULT 'en',

  -- Anthropic usage
  input_tokens  int,
  output_tokens int,

  created_at    timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_harness_user_created
  ON harness_scores(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_harness_share
  ON harness_scores(share_id)
  WHERE share_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_harness_ip_created
  ON harness_scores(ip_hash, created_at DESC)
  WHERE ip_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_harness_input_hash
  ON harness_scores(input_hash)
  WHERE input_hash IS NOT NULL;

-- RLS
ALTER TABLE harness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read shared harness scores"
  ON harness_scores FOR SELECT
  USING (share_id IS NOT NULL);

CREATE POLICY "Users can read own harness scores"
  ON harness_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert harness scores"
  ON harness_scores FOR INSERT
  WITH CHECK (true);
