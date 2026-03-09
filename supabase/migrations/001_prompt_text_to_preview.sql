-- Migration: Remove prompt_text, add prompt_preview
-- Purpose: Privacy compliance — stop storing full prompt text in DB
-- Date: 2025-02-25
--
-- IMPORTANT: Run this AFTER deploying the new code that writes prompt_preview.
-- Existing rows will have their prompt_text truncated to prompt_preview.

-- Step 1: Add the new prompt_preview column
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS prompt_preview TEXT;

-- Step 2: Backfill prompt_preview from existing prompt_text data
UPDATE analyses
SET prompt_preview = LEFT(prompt_text, 80) || CASE WHEN char_length(prompt_text) > 80 THEN '...' ELSE '' END
WHERE prompt_preview IS NULL AND prompt_text IS NOT NULL;

-- Step 3: Drop the generated column that depends on prompt_text
ALTER TABLE analyses DROP COLUMN IF EXISTS prompt_length;

-- Step 4: Drop prompt_text (the full prompt is no longer stored)
ALTER TABLE analyses DROP COLUMN IF EXISTS prompt_text;

-- Step 5: Add prompt_length as a standalone column (optional, for analytics)
-- No longer generated from prompt_text; set from app code if needed.
-- ALTER TABLE analyses ADD COLUMN prompt_length INT;
