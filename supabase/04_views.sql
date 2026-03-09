-- ScoreMyPrompt Database Schema
-- Step 4: Views & Materialized Views
-- Run this in Supabase SQL Editor (after 01_tables.sql)

-- Weekly Leaderboard (materialized for performance)
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
  AND a.overall_score >= 50
ORDER BY a.overall_score DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_leaderboard_weekly_id ON leaderboard_weekly(id);
