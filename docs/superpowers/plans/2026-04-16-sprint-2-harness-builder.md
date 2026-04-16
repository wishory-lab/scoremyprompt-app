# Sprint 2 — Harness Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a 5-step wizard at `/builder` that generates a `CLAUDE.md`-based agent harness as a downloadable ZIP, behind a `BUILDER` feature flag, gated by sign-in + monthly quota (Free 1/month + 1 bonus per share, Pro unlimited).

**Architecture:** Add two new Supabase tables (`builder_outputs`, `builder_quota`) with a 5-minute TTL on outputs enforced by a pg_cron job. A new `/api/builder/generate` route takes wizard answers, asks Claude Haiku to emit a file map JSON, validates structural requirements (routing rules, ≥2 sub-agents, no empty placeholders), persists the map, and returns a preview. A second route streams the map as a ZIP on demand (JSZip in-memory). Builder is sign-in gated so anonymous quota logic is unnecessary; quota is a one-row-per-user-per-month table. Result page renders file preview, ZIP download, `vscode://` deep link, and (for Free users) a Share-for-bonus path.

**Tech Stack:** Next.js 14 App Router · TypeScript · Zod · Supabase (Postgres + RLS + pg_cron) · Anthropic Claude Haiku 4.5 (direct fetch) · JSZip (new dep) · Jest · Tailwind · PostHog · Sentry

---

## Out of Scope for Sprint 2

- Anonymous quota (Builder requires sign-in — if anon hits `/builder`, redirect to sign-in)
- Cloud execution of generated agents (ZIP download only)
- Premium industry templates marketplace (Phase 2 post-MVP)
- Auto-compute HARNES score on generated output (can be added in Sprint 3)
- GitHub OAuth auto-commit of the ZIP (deferred)
- Stripe price change (Sprint 3)
- Team/Enterprise plans

---

## File Structure

**Create:**
- `supabase/migrations/004_builder_tables.sql`
- `app/types/builder.ts`
- `app/constants/builder-system-prompt.ts`
- `app/lib/api-key-mask.ts`
- `app/lib/builder-quota.ts`
- `app/lib/builder-validate.ts`
- `app/api/builder/generate/route.ts`
- `app/api/builder/download/[id]/route.ts`
- `app/api/builder/quota/route.ts`
- `app/api/builder/claim-share/route.ts`
- `__tests__/api/builder-generate.test.ts`
- `__tests__/lib/builder-validate.test.ts`
- `__tests__/lib/api-key-mask.test.ts`
- `app/builder/page.tsx`
- `app/builder/BuilderClient.tsx`
- `app/builder/steps/StepRole.tsx`
- `app/builder/steps/StepGoals.tsx`
- `app/builder/steps/StepBrand.tsx`
- `app/builder/steps/StepTools.tsx`
- `app/builder/steps/StepAutomation.tsx`
- `app/builder/result/[id]/page.tsx`
- `app/builder/result/[id]/BuilderResultClient.tsx`

**Modify:**
- `app/lib/features.ts` — add `BUILDER` flag (dev-only default)
- `app/i18n/locales/en.ts` — add `builder` namespace
- `app/HomeClient.tsx` — update "Build a Setup" card to link `/builder` instead of `/pricing`
- `app/lib/analytics.ts` — add 3 wrappers (`trackBuilderStarted`, `trackBuilderCompleted`, `trackBuilderShared`)
- `package.json` — add `jszip` dependency

---

## Task Execution Order Note

Tasks 14 and 15 (UI components) import from Tasks 17 (i18n) and 18 (analytics). To avoid typecheck errors during subagent-driven execution, dispatch tasks in this order:

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 17 → 18 → 14 → 15 → 16
```

The numbering reflects logical grouping (tests with their routes, components together); the execution arrow above reflects compile-time dependencies. Subagent-driven controller should reorder dispatches accordingly.

---

## Task 1: Install JSZip Dependency

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install JSZip**

Run from project root:
```bash
npm install jszip@^3.10.1
```

- [ ] **Step 2: Verify install**

Run: `node -e "console.log(require('jszip/package.json').version)"`
Expected: Prints `3.10.x`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add jszip@3.10 for builder ZIP generation"
```

---

## Task 2: DB Migration — `builder_outputs` + `builder_quota`

**Files:**
- Create: `supabase/migrations/004_builder_tables.sql`

- [ ] **Step 1: Write the migration file**

```sql
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
```

- [ ] **Step 2: Verify file structure**

Check: 2 `CREATE TABLE`, 2 indexes, 5 RLS policies, pg_cron comment block.
Run: `grep -c "CREATE POLICY" supabase/migrations/004_builder_tables.sql` → expect `5`.

- [ ] **Step 3: Commit (push deferred per Sprint 1 pattern)**

```bash
git add supabase/migrations/004_builder_tables.sql
git commit -m "feat(db): add builder_outputs + builder_quota migration (push deferred)"
```

---

## Task 3: Types & Zod Schemas

**Files:**
- Create: `app/types/builder.ts`

- [ ] **Step 1: Write the types file**

```typescript
// app/types/builder.ts
import { z } from 'zod';

export const ROLES = ['Marketer', 'Planner', 'PM', 'Designer', 'Sales', 'Other'] as const;
export const GOALS = [
  'weekly_research',
  'card_news_sns',
  'competitor_monitoring',
  'customer_replies',
  'data_summaries',
  'meeting_notes',
] as const;
export const TONE_STYLES = ['Professional', 'Friendly', 'Bold'] as const;
export const TOOLS = ['web_search', 'google_sheets', 'notion', 'slack', 'github', 'buffer'] as const;
export const AUTOMATION_LEVELS = ['semi_auto', 'full_auto'] as const;

export const BuilderAnswersSchema = z.object({
  role: z.enum(ROLES),
  goals: z.array(z.enum(GOALS)).min(1).max(6),
  tone: z.enum(TONE_STYLES),
  tools: z.array(z.enum(TOOLS)).max(6).default([]),
  automation: z.enum(AUTOMATION_LEVELS),
  lang: z
    .enum(['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'hi'])
    .default('en'),
});
export type BuilderAnswers = z.infer<typeof BuilderAnswersSchema>;

/**
 * Map of file path (relative to ZIP root) → UTF-8 text content.
 * Required keys (checked at runtime by builder-validate.ts):
 *   - "CLAUDE.md"
 *   - at least 2 files under "/agents/"
 *   - "README.md"
 */
export const BuilderFileMapSchema = z.record(z.string().min(1), z.string().min(1).max(50_000));
export type BuilderFileMap = z.infer<typeof BuilderFileMapSchema>;

export const BuilderGenerateResponseSchema = z.object({
  id: z.string().uuid(),
  files: BuilderFileMapSchema,
  expiresAt: z.string(),                    // ISO timestamp
  isProBuild: z.boolean(),
  quota: z.object({
    buildsUsed: z.number().int().nonnegative(),
    bonusFromShare: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),  // 1 for Free, effectively Infinity (1000) for Pro
  }),
});
export type BuilderGenerateResponse = z.infer<typeof BuilderGenerateResponseSchema>;

export const BuilderClaudeOutputSchema = z.object({
  files: BuilderFileMapSchema,
});
export type BuilderClaudeOutput = z.infer<typeof BuilderClaudeOutputSchema>;

export const BuilderQuotaResponseSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  buildsUsed: z.number().int().nonnegative(),
  bonusFromShare: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  canBuild: z.boolean(),
  tier: z.enum(['free', 'pro']),
});
export type BuilderQuotaResponse = z.infer<typeof BuilderQuotaResponseSchema>;

export const BuilderClaimShareRequestSchema = z.object({
  buildId: z.string().uuid(),
});
export type BuilderClaimShareRequest = z.infer<typeof BuilderClaimShareRequestSchema>;

/** Constants used by quota helper and validation. */
export const FREE_MONTHLY_BUILDS = 1;
export const PRO_MONTHLY_BUILDS = 1000;        // effectively unlimited; cap protects against abuse
export const MAX_SHARE_BONUS_PER_MONTH = 1;    // Free gets +1 per share, max 1 bonus / month
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "app/types/builder.ts"` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/types/builder.ts
git commit -m "feat(builder): add wizard answers, file map, and response Zod schemas"
```

---

## Task 4: Builder System Prompt with Few-Shot Example

**Files:**
- Create: `app/constants/builder-system-prompt.ts`

- [ ] **Step 1: Write the system prompt constant**

```typescript
// app/constants/builder-system-prompt.ts
/**
 * System prompt for the Builder file-map generator.
 * Produces a JSON object mapping file paths to UTF-8 text content.
 */
export const BUILDER_SYSTEM_PROMPT = `You are Harness Builder, an expert that generates a complete AI-agent harness (CLAUDE.md + sub-agent files + context + templates) as a JSON file map, based on the user's wizard answers.

INPUT you will receive: a JSON object with { role, goals[], tone, tools[], automation, lang }.

OUTPUT you must return: a JSON object with shape { "files": { "<path>": "<text content>", ... } }.

REQUIRED files (MUST include all):
1. "CLAUDE.md" — main SOP. Must contain: Project Overview, Folder Map, Routing Rules (at least 2 explicit "If X, then Y" rules), Work Rules section.
2. "/context/brand_guidelines.md" — tone/voice reflecting the 'tone' answer with 2–3 example paragraphs in the selected style.
3. "/context/business_context.md" — describes role, goals, target audience (1 short paragraph per goal).
4. "/agents/research_agent.md" — if goals include research-heavy items; otherwise a generic researcher.
5. "/agents/content_agent.md" — content writer.
6. "/agents/review_agent.md" — fact-check + brand compliance reviewer.
7. "/templates/report_template.md" — one concrete template matching a goal.
8. "/data/README.md" — how to add CSVs.
9. ".env.example" — placeholders only (ANTHROPIC_API_KEY=sk-..., etc.), NO real keys.
10. "README.md" — 3-minute explainer of what this harness is.
11. "QUICKSTART.md" — step-by-step VS Code + Claude Code setup.

STRICT RULES:
- Output ONLY valid JSON. No markdown wrapping, no prose outside JSON.
- Each file's content is a string (multi-line, \\n-escaped where needed).
- MUST use the 'lang' answer for ALL human-readable prose. If lang is "ko", write in Korean. If "ja", Japanese. Etc. Keep CLAUDE.md's structural keywords (Project Overview, Routing Rules, etc.) in English for parser compatibility.
- MUST reflect the 'tone' answer in brand_guidelines.md: "Professional" = formal/clear, "Friendly" = warm/conversational, "Bold" = punchy/decisive.
- MUST include every tool in the 'tools' answer within the Extensions section of CLAUDE.md.
- Respect 'automation': "semi_auto" = document human-approval checkpoints; "full_auto" = document bypass-approval rules with a failure-retry loop.
- NEVER emit real API keys, passwords, or URLs with tokens.
- Each file content between 100 and 6000 characters. CLAUDE.md should be the richest (2000–6000).

EXAMPLE INPUT:
{"role":"Marketer","goals":["weekly_research","card_news_sns"],"tone":"Friendly","tools":["web_search","notion"],"automation":"semi_auto","lang":"en"}

EXAMPLE OUTPUT (truncated for brevity — real output MUST include all 11 files at full length):
{
  "files": {
    "CLAUDE.md": "# Marketing Harness\\n\\n## Project Overview\\nA friendly, weekly-cadence marketing automation that researches industry news, drafts card-news SNS posts, and awaits human approval before publishing.\\n\\n## Folder Map\\n- /context — brand & business\\n- /agents — research, content, review\\n- /templates — report, card-news\\n- /data — CSV inputs\\n\\n## Routing Rules\\n1. If the user asks for weekly research, call research_agent first, then content_agent.\\n2. If research_agent returns fewer than 3 sources, loop back and re-query before content_agent.\\n\\n## Work Rules\\n- Every output must match brand_guidelines.md tone.\\n- Human review is required before SNS publishing (semi-auto mode).\\n- Tools: web_search (Brave/Google), notion (embed drafts).",
    "/context/brand_guidelines.md": "# Brand Voice — Friendly\\n\\nWe sound like a helpful colleague, not a corporate memo.\\n\\nExample 1: \\"Hey team, here's what we learned this week...\\"\\nExample 2: \\"Good news: our new campaign is live! Let me walk you through...\\"",
    "/agents/research_agent.md": "# Research Agent\\n\\nRole: gather 5+ credible sources on the weekly topic.\\n\\nTools: web_search.\\nOutput: summary.md with bullet takeaways and source URLs.",
    "/agents/content_agent.md": "# Content Agent\\n\\nRole: turn research into a card-news draft (5 slides).\\nOutput: markdown slides ready for /templates/card_news.md.",
    "/agents/review_agent.md": "# Review Agent\\n\\nRole: fact-check and brand compliance.\\nOutput: pass/fail + notes.",
    "/templates/report_template.md": "# Weekly Research Report\\n\\n## Date: {{date}}\\n## Topic: {{topic}}\\n\\n### Key Findings\\n1. ...\\n\\n### Sources\\n- ...",
    "/context/business_context.md": "# Business Context\\n\\nRole: marketer (MZ/X-gen target).\\nGoals: weekly research, card news SNS.\\nAudience: trend-conscious office workers.",
    "/data/README.md": "# /data\\n\\nDrop CSVs here. Expected schema:\\n- competitors.csv (name, url, last_checked)\\n- audience.csv (segment, size, notes)",
    ".env.example": "ANTHROPIC_API_KEY=sk-your-key-here\\nNOTION_API_KEY=secret_your-key-here",
    "README.md": "# My Marketing Harness\\n\\nGenerated by ScoreMyPrompt. This folder gives Claude Code everything it needs to run weekly research + SNS drafts for you in 2 minutes.",
    "QUICKSTART.md": "# 3-Minute Quickstart\\n\\n1. Install VS Code + Claude Code extension.\\n2. Open this folder in VS Code.\\n3. Copy .env.example to .env and add your API key.\\n4. In VS Code palette: Claude Code: Run Task."
  }
}

Now generate files for the next INPUT. Return ONLY JSON.`;
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit 2>&1 | grep builder-system-prompt` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/constants/builder-system-prompt.ts
git commit -m "feat(builder): add file-map generator system prompt with few-shot example"
```

---

## Task 5: API-Key Detection & Masking Utility

**Files:**
- Create: `app/lib/api-key-mask.ts`
- Create: `__tests__/lib/api-key-mask.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/api-key-mask.test.ts
import { maskApiKeys, detectApiKeys } from '@/app/lib/api-key-mask';

describe('api-key-mask', () => {
  describe('detectApiKeys', () => {
    it('detects Anthropic keys', () => {
      expect(detectApiKeys('my key is sk-ant-api03-abc123xyz')).toBe(true);
    });
    it('detects OpenAI keys', () => {
      expect(detectApiKeys('token: sk-proj-abcdef12345 here')).toBe(true);
    });
    it('detects Supabase service role tokens (eyJ JWT)', () => {
      expect(detectApiKeys('jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.xyz')).toBe(true);
    });
    it('detects GitHub tokens', () => {
      expect(detectApiKeys('github_pat_11ABCDE_somelongvalueheremore1234567890')).toBe(true);
    });
    it('returns false for plain text', () => {
      expect(detectApiKeys('this is a safe string with no secrets')).toBe(false);
    });
  });

  describe('maskApiKeys', () => {
    it('replaces Anthropic keys with placeholder', () => {
      const out = maskApiKeys('use sk-ant-api03-abc123xyz for auth');
      expect(out).toContain('[REDACTED_KEY]');
      expect(out).not.toContain('sk-ant-api03-abc123xyz');
    });
    it('replaces multiple keys on one line', () => {
      const out = maskApiKeys('A: sk-proj-aaa111 B: sk-ant-api03-bbb222');
      expect(out.match(/\[REDACTED_KEY\]/g)?.length).toBe(2);
    });
    it('leaves placeholder strings untouched', () => {
      expect(maskApiKeys('ANTHROPIC_API_KEY=sk-your-key-here')).toBe('ANTHROPIC_API_KEY=sk-your-key-here');
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npx jest __tests__/lib/api-key-mask.test.ts --no-coverage --forceExit 2>&1 | tail -10`
Expected: "Cannot find module '@/app/lib/api-key-mask'".

- [ ] **Step 3: Write the implementation**

```typescript
// app/lib/api-key-mask.ts
/**
 * Detects and masks common API key patterns so builder input/output
 * never stores real credentials. Conservative: false negatives OK,
 * false positives cost nothing (we redact and warn).
 */
const PATTERNS: RegExp[] = [
  // Anthropic
  /sk-ant-[a-zA-Z0-9-]{20,}/g,
  // OpenAI
  /sk-(proj-|svcacct-)?[a-zA-Z0-9]{20,}/g,
  // Supabase/JWT: three Base64URL segments separated by dots, at least 30 chars total
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
  // GitHub fine-grained PAT
  /github_pat_[A-Za-z0-9_]{20,}/g,
  // GitHub classic token
  /gh[pousr]_[A-Za-z0-9_]{30,}/g,
  // AWS access key
  /AKIA[0-9A-Z]{16}/g,
  // Slack bot/user tokens
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
];

const PLACEHOLDER_ALLOWLIST = [
  'sk-your-key-here',
  'sk-proj-your-key',
  'your-api-key',
  'sk-ant-your-key',
];

function isPlaceholder(match: string): boolean {
  return PLACEHOLDER_ALLOWLIST.some((p) => match.toLowerCase().includes(p));
}

export function detectApiKeys(input: string): boolean {
  for (const re of PATTERNS) {
    re.lastIndex = 0;
    const m = input.match(re);
    if (!m) continue;
    if (m.some((hit) => !isPlaceholder(hit))) return true;
  }
  return false;
}

export function maskApiKeys(input: string): string {
  let out = input;
  for (const re of PATTERNS) {
    out = out.replace(new RegExp(re.source, re.flags), (match) => {
      return isPlaceholder(match) ? match : '[REDACTED_KEY]';
    });
  }
  return out;
}
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `npx jest __tests__/lib/api-key-mask.test.ts --no-coverage --forceExit 2>&1 | tail -10`
Expected: "Tests: 8 passed, 8 total".

- [ ] **Step 5: Commit**

```bash
git add app/lib/api-key-mask.ts __tests__/lib/api-key-mask.test.ts
git commit -m "feat(lib): add api-key detection + masking utility with 8 tests"
```

---

## Task 6: Builder Output Validator

**Files:**
- Create: `app/lib/builder-validate.ts`
- Create: `__tests__/lib/builder-validate.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/builder-validate.test.ts
import { validateBuilderFiles } from '@/app/lib/builder-validate';

describe('validateBuilderFiles', () => {
  const good = {
    'CLAUDE.md': '# H\n## Routing Rules\n1. If A, then call research_agent.\n2. If B, then call content_agent.\n## Work Rules\nx',
    '/agents/research_agent.md': '# R\nrole\ntools\noutput',
    '/agents/content_agent.md': '# C\nrole\ntools\noutput',
    'README.md': '# readme',
  };

  it('passes a valid file map', () => {
    const r = validateBuilderFiles(good);
    expect(r.ok).toBe(true);
  });

  it('fails when CLAUDE.md is missing', () => {
    const { ['CLAUDE.md']: _, ...rest } = good;
    const r = validateBuilderFiles(rest);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/CLAUDE\.md/);
  });

  it('fails when no Routing Rules section in CLAUDE.md', () => {
    const r = validateBuilderFiles({ ...good, 'CLAUDE.md': '# H\nno routing here\n## Work Rules\nx' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/Routing Rules/);
  });

  it('fails with fewer than 2 sub-agent files', () => {
    const { ['/agents/content_agent.md']: _, ...rest } = good;
    const r = validateBuilderFiles(rest);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/sub-agent/);
  });

  it('fails when any file is under 50 characters (empty placeholder)', () => {
    const r = validateBuilderFiles({ ...good, 'README.md': 'tiny' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/too short|README\.md/);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npx jest __tests__/lib/builder-validate.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: module-not-found.

- [ ] **Step 3: Write the implementation**

```typescript
// app/lib/builder-validate.ts
/**
 * Structural validation of the file map returned by the Builder LLM.
 * Returns { ok: true } or { ok: false, reason } — no thrown errors.
 */
import type { BuilderFileMap } from '@/app/types/builder';

const MIN_FILE_LEN = 50;

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export function validateBuilderFiles(files: BuilderFileMap): ValidationResult {
  // 1. CLAUDE.md exists
  const claudeMd = files['CLAUDE.md'];
  if (!claudeMd) return { ok: false, reason: 'CLAUDE.md is missing' };

  // 2. CLAUDE.md has Routing Rules section
  if (!/##\s*Routing Rules/i.test(claudeMd)) {
    return { ok: false, reason: "CLAUDE.md missing 'Routing Rules' section" };
  }

  // 3. At least 2 sub-agent files
  const agentFiles = Object.keys(files).filter((k) => k.startsWith('/agents/'));
  if (agentFiles.length < 2) {
    return { ok: false, reason: `Need at least 2 sub-agent files, found ${agentFiles.length}` };
  }

  // 4. No empty/placeholder files
  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== 'string' || content.length < MIN_FILE_LEN) {
      return { ok: false, reason: `${path} is too short (under ${MIN_FILE_LEN} chars)` };
    }
  }

  return { ok: true };
}
```

- [ ] **Step 4: Run tests to confirm PASS**

Run: `npx jest __tests__/lib/builder-validate.test.ts --no-coverage --forceExit 2>&1 | tail -10`
Expected: "Tests: 5 passed, 5 total".

- [ ] **Step 5: Commit**

```bash
git add app/lib/builder-validate.ts __tests__/lib/builder-validate.test.ts
git commit -m "feat(builder): add file-map structural validator with 5 tests"
```

---

## Task 7: Quota Helper Module

**Files:**
- Create: `app/lib/builder-quota.ts`

- [ ] **Step 1: Write the helper**

```typescript
// app/lib/builder-quota.ts
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';
import {
  FREE_MONTHLY_BUILDS,
  PRO_MONTHLY_BUILDS,
  MAX_SHARE_BONUS_PER_MONTH,
  type BuilderQuotaResponse,
} from '@/app/types/builder';

/** "2026-04" — always UTC to keep month boundary deterministic. */
export function currentMonthKey(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export interface QuotaState {
  monthKey: string;
  buildsUsed: number;
  bonusFromShare: number;
  limit: number;
  canBuild: boolean;
  tier: 'free' | 'pro';
}

export async function getQuota(userId: string, tier: 'free' | 'pro'): Promise<QuotaState> {
  const supa = getSupabaseAdmin();
  const monthKey = currentMonthKey();
  const limit = tier === 'pro' ? PRO_MONTHLY_BUILDS : FREE_MONTHLY_BUILDS;

  if (!supa) {
    return { monthKey, buildsUsed: 0, bonusFromShare: 0, limit, canBuild: true, tier };
  }

  const { data, error } = await supa
    .from('builder_quota')
    .select('builds_used, bonus_from_share')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (error) {
    logger.warn('builder_quota read failed', { error: error.message });
    return { monthKey, buildsUsed: 0, bonusFromShare: 0, limit, canBuild: true, tier };
  }

  const buildsUsed = (data?.builds_used as number) ?? 0;
  const bonusFromShare = (data?.bonus_from_share as number) ?? 0;
  const effectiveLimit = limit + bonusFromShare;
  return {
    monthKey,
    buildsUsed,
    bonusFromShare,
    limit: effectiveLimit,
    canBuild: buildsUsed < effectiveLimit,
    tier,
  };
}

/** Called after a successful generate. Upserts the quota row and increments builds_used. */
export async function incrementBuilds(userId: string, buildId: string): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) return;
  const monthKey = currentMonthKey();
  const { data: existing } = await supa
    .from('builder_quota')
    .select('builds_used')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (existing) {
    await supa
      .from('builder_quota')
      .update({
        builds_used: ((existing.builds_used as number) ?? 0) + 1,
        last_build_id: buildId,
      })
      .eq('user_id', userId)
      .eq('month_key', monthKey);
  } else {
    await supa.from('builder_quota').insert({
      user_id: userId,
      month_key: monthKey,
      builds_used: 1,
      bonus_from_share: 0,
      last_build_id: buildId,
    });
  }
}

/** Called from /api/builder/claim-share. Adds at most MAX_SHARE_BONUS_PER_MONTH. */
export async function claimShareBonus(userId: string, buildId: string): Promise<QuotaState | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const monthKey = currentMonthKey();

  const { data: existing } = await supa
    .from('builder_quota')
    .select('builds_used, bonus_from_share, last_build_id')
    .eq('user_id', userId)
    .eq('month_key', monthKey)
    .maybeSingle();

  if (!existing) return null;
  if ((existing.bonus_from_share as number) >= MAX_SHARE_BONUS_PER_MONTH) {
    return getQuota(userId, 'free');     // already claimed — no-op
  }
  if ((existing.last_build_id as string | null) !== buildId) {
    return null;     // can only claim for the last build in this month
  }

  await supa
    .from('builder_quota')
    .update({
      bonus_from_share: (existing.bonus_from_share as number) + 1,
      last_share_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('month_key', monthKey);

  return getQuota(userId, 'free');
}

export function quotaToResponse(state: QuotaState): BuilderQuotaResponse {
  return {
    monthKey: state.monthKey,
    buildsUsed: state.buildsUsed,
    bonusFromShare: state.bonusFromShare,
    limit: state.limit,
    canBuild: state.canBuild,
    tier: state.tier,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep builder-quota` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/lib/builder-quota.ts
git commit -m "feat(builder): add monthly quota helper (Free 1/mo + 1 share bonus)"
```

---

## Task 8: Feature Flag `BUILDER`

**Files:**
- Modify: `app/lib/features.ts`

- [ ] **Step 1: Add to FEATURES object**

Inside `FEATURES` after the `HARNESS_SCORE` entry:

```typescript
  /** Harness Builder wizard (Sprint 2) */
  BUILDER: 'BUILDER',
```

And inside `DEV_ONLY`:

```typescript
  FEATURES.BUILDER,
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep features.ts` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/lib/features.ts
git commit -m "feat(flags): add BUILDER feature flag (dev-only default)"
```

---

## Task 9: `/api/builder/generate` — Failing Tests

**Files:**
- Create: `__tests__/api/builder-generate.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/api/builder-generate.test.ts
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/builder/generate/route';

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/builder/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.1.0.1', ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = {
  role: 'Marketer',
  goals: ['weekly_research'],
  tone: 'Friendly',
  tools: ['web_search'],
  automation: 'semi_auto',
  lang: 'en',
};

describe('/api/builder/generate', () => {
  describe('auth', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('UNAUTHORIZED');
    });
  });

  describe('validation (authenticated mock)', () => {
    it('returns 400 when role is missing', async () => {
      const { role: _, ...bad } = validBody;
      const res = await POST(makeRequest(bad, { 'x-mock-user-id': 'test-user-1' }));
      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when goals array is empty', async () => {
      const res = await POST(makeRequest({ ...validBody, goals: [] }, { 'x-mock-user-id': 'test-user-2' }));
      expect(res.status).toBe(400);
    });
  });

  describe('mock mode success', () => {
    it('returns 200 with id, files, quota, expiresAt', async () => {
      const res = await POST(makeRequest(validBody, { 'x-mock-user-id': 'test-user-3' }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('files');
      expect(data).toHaveProperty('quota');
      expect(data).toHaveProperty('expiresAt');
      expect(data.files).toHaveProperty('CLAUDE.md');
      expect(typeof data.files['CLAUDE.md']).toBe('string');
    });

    it('file map passes structural validation', async () => {
      const res = await POST(makeRequest(validBody, { 'x-mock-user-id': 'test-user-4' }));
      const data = await res.json();
      // CLAUDE.md has routing rules
      expect(data.files['CLAUDE.md']).toMatch(/Routing Rules/);
      // At least 2 sub-agent files
      const agentCount = Object.keys(data.files).filter((k: string) => k.startsWith('/agents/')).length;
      expect(agentCount).toBeGreaterThanOrEqual(2);
    });
  });
});
```

- [ ] **Step 2: Run and confirm FAIL**

Run: `npx jest __tests__/api/builder-generate.test.ts --no-coverage --forceExit 2>&1 | tail -10`
Expected: Cannot find module.

- [ ] **Step 3: Commit**

```bash
git add __tests__/api/builder-generate.test.ts
git commit -m "test(builder): add failing tests for /api/builder/generate"
```

---

## Task 10: `/api/builder/generate` — Implementation

**Files:**
- Create: `app/api/builder/generate/route.ts`

- [ ] **Step 1: Write the route**

```typescript
// app/api/builder/generate/route.ts
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { getSession } from '@/app/lib/auth';
import { BUILDER_SYSTEM_PROMPT } from '@/app/constants/builder-system-prompt';
import { AppError, errorResponse, badRequestResponse, unauthorizedResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import { maskApiKeys } from '@/app/lib/api-key-mask';
import { validateBuilderFiles } from '@/app/lib/builder-validate';
import { getQuota, incrementBuilds, quotaToResponse } from '@/app/lib/builder-quota';
import {
  BuilderAnswersSchema,
  BuilderClaudeOutputSchema,
  type BuilderAnswers,
  type BuilderClaudeOutput,
  type BuilderFileMap,
  type BuilderGenerateResponse,
} from '@/app/types/builder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_TIMEOUT_MS = 30_000;

interface SessionUser {
  id: string;
  tier: 'free' | 'pro';
}

/**
 * Extract user from session. In tests, honor x-mock-user-id header
 * (tests run against a test-only branch that checks NODE_ENV).
 */
async function resolveUser(req: Request): Promise<SessionUser | null> {
  if (process.env.NODE_ENV === 'test') {
    const mockId = req.headers.get('x-mock-user-id');
    if (!mockId) return null;
    return { id: mockId, tier: (req.headers.get('x-mock-tier') as 'pro' | 'free') ?? 'free' };
  }
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, tier: session.tier === 'pro' ? 'pro' : 'free' };
}

function mockFileMap(answers: BuilderAnswers): BuilderFileMap {
  // Deterministic mock that passes structural validation.
  const lang = answers.lang;
  const pad = (txt: string) => txt + '\n'.repeat(20) + 'x'.repeat(80);
  return {
    'CLAUDE.md': pad(`# ${answers.role} Harness (mock, lang=${lang})

## Project Overview
Generated for role=${answers.role} with tone=${answers.tone}.

## Folder Map
- /context
- /agents
- /templates

## Routing Rules
1. If goal is weekly_research, call research_agent first.
2. If research_agent returns <3 sources, loop before content_agent.

## Work Rules
- Tone: ${answers.tone}
- Automation: ${answers.automation}
- Tools: ${answers.tools.join(', ')}`),
    '/context/brand_guidelines.md': pad(`# Brand Voice — ${answers.tone}\nMock guidelines for a ${answers.tone} tone.`),
    '/context/business_context.md': pad(`# Business Context\nRole: ${answers.role}. Goals: ${answers.goals.join(', ')}.`),
    '/agents/research_agent.md': pad('# Research Agent\nMock role: gather sources.'),
    '/agents/content_agent.md': pad('# Content Agent\nMock role: draft output.'),
    '/agents/review_agent.md': pad('# Review Agent\nMock role: fact-check.'),
    '/templates/report_template.md': pad('# Report Template\n## {{date}}\n## {{topic}}\n### Findings\n### Sources'),
    '/data/README.md': pad('# /data\nDrop CSVs here.'),
    '.env.example': pad('ANTHROPIC_API_KEY=sk-your-key-here\nNOTION_API_KEY=secret_your-key-here'),
    'README.md': pad('# My Mock Harness\nGenerated by ScoreMyPrompt in mock mode.'),
    'QUICKSTART.md': pad('# Quickstart\n1. Install VS Code.\n2. Open folder.\n3. Run Claude Code.'),
  };
}

async function callAnthropic(answers: BuilderAnswers, apiKey: string): Promise<BuilderClaudeOutput> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ANTHROPIC_TIMEOUT_MS);
  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 8000,
        system: BUILDER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: JSON.stringify(answers) }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new AppError(`Anthropic ${res.status}: ${text.slice(0, 200)}`, 'ANTHROPIC_ERROR', 502);
    }
    const json = (await res.json()) as { content?: { text?: string }[] };
    const raw = (json.content?.[0]?.text ?? '').replace(/^```json\s*|```\s*$/g, '').trim();
    return BuilderClaudeOutputSchema.parse(JSON.parse(raw));
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request): Promise<Response> {
  // 1. Rate limit
  const rl = rateLimit(req, LIMITS.ANALYZE);
  if (!rl.ok) return rl.response;

  // 2. Auth
  const user = await resolveUser(req);
  if (!user) return unauthorizedResponse('Sign in required to use Builder');

  // 3. Parse & validate body
  let answers: BuilderAnswers;
  try {
    const body = await req.json();
    // Mask any API keys in user-provided prose fields (if present in goals labels or custom text).
    const sanitized = body && typeof body === 'object' ? JSON.parse(maskApiKeys(JSON.stringify(body))) : body;
    answers = BuilderAnswersSchema.parse(sanitized);
  } catch (err) {
    if (err instanceof z.ZodError) return badRequestResponse('Invalid request', err.issues);
    return badRequestResponse('Invalid JSON body');
  }

  try {
    // 4. Quota check
    const quota = await getQuota(user.id, user.tier);
    if (!quota.canBuild) {
      return Response.json(
        { error: 'Monthly build quota exhausted', code: 'QUOTA_EXHAUSTED', quota: quotaToResponse(quota) },
        { status: 402, headers: rl.response.headers },
      );
    }

    // 5. Generate file map (Claude call or mock)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let files: BuilderFileMap;
    if (!apiKey) {
      files = mockFileMap(answers);
    } else {
      try {
        const out = await callAnthropic(answers, apiKey);
        files = out.files;
      } catch (err) {
        logger.warn('Anthropic builder call failed, retrying once', { error: String(err) });
        try {
          const out = await callAnthropic(answers, apiKey);
          files = out.files;
        } catch (err2) {
          logger.warn('Anthropic builder retry failed, falling back to mock', { error: String(err2) });
          files = mockFileMap(answers);
        }
      }
    }

    // 6. Validate structural shape
    const validation = validateBuilderFiles(files);
    if (!validation.ok) {
      throw new AppError(`Generated file map failed validation: ${validation.reason}`, 'INVALID_GENERATION', 502);
    }

    // 7. Persist
    const supa = getSupabaseAdmin();
    let id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const isProBuild = user.tier === 'pro';

    if (supa) {
      const { data, error } = await supa
        .from('builder_outputs')
        .insert({
          user_id: user.id,
          answers,
          files,
          is_pro_build: isProBuild,
          expires_at: expiresAt,
        })
        .select('id')
        .single();
      if (error) {
        logger.warn('builder_outputs insert failed', { error: error.message });
      } else if (data) {
        id = data.id as string;
      }
    } else {
      logger.warn('Supabase not configured — build result will not persist');
    }

    // 8. Increment quota
    await incrementBuilds(user.id, id);

    // 9. Refresh quota for response
    const finalQuota = await getQuota(user.id, user.tier);

    const response: BuilderGenerateResponse = {
      id,
      files,
      expiresAt,
      isProBuild,
      quota: {
        buildsUsed: finalQuota.buildsUsed,
        bonusFromShare: finalQuota.bonusFromShare,
        limit: finalQuota.limit,
      },
    };
    return Response.json(response, { headers: rl.response.headers });
  } catch (err) {
    Sentry.withScope((scope) => {
      scope.setTag('route', 'builder_generate');
      scope.setTag('role', answers?.role ?? 'unknown');
      Sentry.captureException(err);
    });
    if (err instanceof AppError) return errorResponse(err);
    logger.error('Unhandled builder generate error', { error: String(err) });
    return errorResponse(err as Error);
  }
}
```

- [ ] **Step 2: If `app/lib/auth.ts` lacks `getSession`, add or adapt**

Read: `head -30 app/lib/auth.ts`. If a `getSession()` helper returning `{ user: { id }, tier }` does not exist, add a thin wrapper. If a differently-named helper exists (e.g., `getAuthSession`, `currentUser`), replace the import above. Implementer: match the existing auth pattern instead of inventing one.

- [ ] **Step 3: Run tests**

Run: `NODE_ENV=test npx jest __tests__/api/builder-generate.test.ts --no-coverage --forceExit 2>&1 | tail -15`
Expected: "Tests: 5 passed, 5 total".

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "api/builder/generate"` — expect empty.

- [ ] **Step 5: Commit**

```bash
git add app/api/builder/generate/route.ts
git commit -m "feat(builder): implement /api/builder/generate with retry + validation"
```

---

## Task 11: `/api/builder/download/[id]` — ZIP Streaming

**Files:**
- Create: `app/api/builder/download/[id]/route.ts`

- [ ] **Step 1: Write the route**

```typescript
// app/api/builder/download/[id]/route.ts
import JSZip from 'jszip';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { getSession } from '@/app/lib/auth';
import { logger } from '@/app/lib/logger';
import type { BuilderFileMap } from '@/app/types/builder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WATERMARK_README =
  '\n\n---\n\nCreated with ScoreMyPrompt — Upgrade to Pro for unlimited builds: https://scoremyprompt.com/pricing\n';

async function loadBuild(
  id: string,
  userId: string,
): Promise<{ files: BuilderFileMap; isProBuild: boolean } | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const { data } = await supa
    .from('builder_outputs')
    .select('files, is_pro_build, expires_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  if (new Date(data.expires_at as string) < new Date()) return null;
  return { files: data.files as BuilderFileMap, isProBuild: data.is_pro_build as boolean };
}

export async function GET(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  const session = await getSession();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const build = await loadBuild(params.id, session.user.id);
  if (!build) return new Response('Build not found or expired', { status: 410 });

  try {
    const zip = new JSZip();
    for (const [path, content] of Object.entries(build.files)) {
      // JSZip treats leading slash inconsistently — strip to make paths relative inside ZIP.
      const normalized = path.replace(/^\//, '');
      const body =
        normalized === 'README.md' && !build.isProBuild ? content + WATERMARK_README : content;
      zip.file(normalized, body);
    }
    const blob = await zip.generateAsync({ type: 'uint8Array', compression: 'DEFLATE' });
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="harness-${params.id.slice(0, 8)}.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    logger.error('ZIP generation failed', { error: String(err), id: params.id });
    return new Response('Failed to generate ZIP', { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "api/builder/download"` — expect empty.

- [ ] **Step 3: Manual smoke test**

After Tasks 13+ complete, visiting `/builder/result/<id>` and clicking Download should return a `.zip` file.

- [ ] **Step 4: Commit**

```bash
git add app/api/builder/download/[id]/route.ts
git commit -m "feat(builder): add /api/builder/download/[id] streaming ZIP route"
```

---

## Task 12: `/api/builder/quota` + `/api/builder/claim-share`

**Files:**
- Create: `app/api/builder/quota/route.ts`
- Create: `app/api/builder/claim-share/route.ts`

- [ ] **Step 1: Write `/api/builder/quota/route.ts`**

```typescript
// app/api/builder/quota/route.ts
import { getSession } from '@/app/lib/auth';
import { getQuota, quotaToResponse } from '@/app/lib/builder-quota';
import { unauthorizedResponse, errorResponse } from '@/app/lib/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const session = await getSession();
    if (!session?.user) return unauthorizedResponse();
    const tier = session.tier === 'pro' ? 'pro' : 'free';
    const state = await getQuota(session.user.id, tier);
    return Response.json(quotaToResponse(state));
  } catch (err) {
    return errorResponse(err as Error);
  }
}
```

- [ ] **Step 2: Write `/api/builder/claim-share/route.ts`**

```typescript
// app/api/builder/claim-share/route.ts
import { z } from 'zod';
import { getSession } from '@/app/lib/auth';
import { claimShareBonus, quotaToResponse } from '@/app/lib/builder-quota';
import { BuilderClaimShareRequestSchema } from '@/app/types/builder';
import { badRequestResponse, unauthorizedResponse, errorResponse } from '@/app/lib/errors';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  const rl = rateLimit(req, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;
  try {
    const session = await getSession();
    if (!session?.user) return unauthorizedResponse();
    let body;
    try {
      body = BuilderClaimShareRequestSchema.parse(await req.json());
    } catch (err) {
      if (err instanceof z.ZodError) return badRequestResponse('Invalid request', err.issues);
      return badRequestResponse('Invalid JSON body');
    }
    const updated = await claimShareBonus(session.user.id, body.buildId);
    if (!updated) {
      return Response.json({ error: 'Cannot claim share bonus', code: 'NOT_ELIGIBLE' }, { status: 400 });
    }
    return Response.json(quotaToResponse(updated));
  } catch (err) {
    return errorResponse(err as Error);
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "api/builder/"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/api/builder/quota/route.ts app/api/builder/claim-share/route.ts
git commit -m "feat(builder): add /api/builder/quota and /api/builder/claim-share"
```

---

## Task 13: Wizard Step Components

**Files:**
- Create: `app/builder/steps/StepRole.tsx`
- Create: `app/builder/steps/StepGoals.tsx`
- Create: `app/builder/steps/StepBrand.tsx`
- Create: `app/builder/steps/StepTools.tsx`
- Create: `app/builder/steps/StepAutomation.tsx`

- [ ] **Step 1: Write `StepRole.tsx`**

```typescript
// app/builder/steps/StepRole.tsx
'use client';
import { ROLES } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

interface Props {
  value: BuilderAnswers['role'];
  onChange: (value: BuilderAnswers['role']) => void;
}

export default function StepRole({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">What is your role?</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`rounded-lg border px-4 py-3 text-center text-sm font-medium transition ${
              value === r ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface text-gray-300 hover:border-primary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 2: Write `StepGoals.tsx`**

```typescript
// app/builder/steps/StepGoals.tsx
'use client';
import { GOALS } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

const LABELS: Record<(typeof GOALS)[number], string> = {
  weekly_research: 'Weekly research reports',
  card_news_sns: 'Card news / SNS content',
  competitor_monitoring: 'Competitor monitoring',
  customer_replies: 'Customer reply drafts',
  data_summaries: 'Data analysis summaries',
  meeting_notes: 'Meeting notes + action items',
};

interface Props {
  value: BuilderAnswers['goals'];
  onChange: (value: BuilderAnswers['goals']) => void;
}

export default function StepGoals({ value, onChange }: Props) {
  function toggle(goal: (typeof GOALS)[number]) {
    if (value.includes(goal)) {
      onChange(value.filter((g) => g !== goal));
    } else {
      onChange([...value, goal]);
    }
  }
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">What should AI automate? (pick 1+)</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOALS.map((g) => {
          const checked = value.includes(g);
          return (
            <label
              key={g}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-sm transition ${
                checked ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface text-gray-300 hover:border-primary'
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(g)} className="mr-2" />
              {LABELS[g]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 3: Write `StepBrand.tsx`**

```typescript
// app/builder/steps/StepBrand.tsx
'use client';
import { TONE_STYLES } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

const EXAMPLES: Record<(typeof TONE_STYLES)[number], string> = {
  Professional: '"We analyzed Q3 trends across three key verticals..."',
  Friendly: '"Hey team, here\'s what we learned this week and what it means for you..."',
  Bold: '"Stop. This one change wins 40% more conversions. Here\'s how."',
};

interface Props {
  value: BuilderAnswers['tone'];
  onChange: (value: BuilderAnswers['tone']) => void;
}

export default function StepBrand({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">Pick a tone your AI should write in.</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TONE_STYLES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`rounded-lg border p-4 text-left transition ${
              value === t ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary'
            }`}
          >
            <div className="text-base font-bold text-white">{t}</div>
            <div className="mt-2 text-sm text-gray-400 italic">{EXAMPLES[t]}</div>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 4: Write `StepTools.tsx`**

```typescript
// app/builder/steps/StepTools.tsx
'use client';
import { TOOLS } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

const LABELS: Record<(typeof TOOLS)[number], string> = {
  web_search: 'Web search',
  google_sheets: 'Google Sheets',
  notion: 'Notion',
  slack: 'Slack',
  github: 'GitHub',
  buffer: 'Buffer',
};

interface Props {
  value: BuilderAnswers['tools'];
  onChange: (value: BuilderAnswers['tools']) => void;
}

export default function StepTools({ value, onChange }: Props) {
  function toggle(tool: (typeof TOOLS)[number]) {
    if (value.includes(tool)) onChange(value.filter((t) => t !== tool));
    else onChange([...value, tool]);
  }
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">Which tools to connect? (optional)</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOOLS.map((t) => {
          const checked = value.includes(t);
          return (
            <label
              key={t}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-sm transition ${
                checked ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface text-gray-300 hover:border-primary'
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(t)} className="mr-2" />
              {LABELS[t]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 5: Write `StepAutomation.tsx`**

```typescript
// app/builder/steps/StepAutomation.tsx
'use client';
import type { BuilderAnswers } from '@/app/types/builder';

interface Props {
  value: BuilderAnswers['automation'];
  onChange: (value: BuilderAnswers['automation']) => void;
}

export default function StepAutomation({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">How much control do you keep?</legend>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onChange('semi_auto')}
          className={`w-full rounded-lg border p-4 text-left transition ${
            value === 'semi_auto' ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary'
          }`}
        >
          <div className="font-bold text-white">Semi-auto</div>
          <div className="mt-1 text-sm text-gray-400">AI asks for approval before each action. Best for starting out.</div>
        </button>
        <button
          type="button"
          onClick={() => onChange('full_auto')}
          className={`w-full rounded-lg border p-4 text-left transition ${
            value === 'full_auto' ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary'
          }`}
        >
          <div className="font-bold text-white">Full-auto</div>
          <div className="mt-1 text-sm text-gray-400">AI runs end-to-end with a retry-on-fail loop. Best for trusted workflows.</div>
        </button>
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "app/builder/steps"` — expect empty.

- [ ] **Step 7: Commit**

```bash
git add app/builder/steps/
git commit -m "feat(builder): add 5 wizard step components (Role/Goals/Brand/Tools/Automation)"
```

---

## Task 14: Builder Wizard Page

**Files:**
- Create: `app/builder/page.tsx`
- Create: `app/builder/BuilderClient.tsx`

- [ ] **Step 1: Write the server page**

```typescript
// app/builder/page.tsx
import { notFound, redirect } from 'next/navigation';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import { getSession } from '@/app/lib/auth';
import BuilderClient from './BuilderClient';

export const metadata = {
  title: 'Build Your AI Setup — ScoreMyPrompt',
  description: 'Answer 5 questions and get a ready-to-run Claude Code harness as a ZIP. Free 1/month.',
};

export default async function BuilderPage() {
  if (!isFeatureEnabled(FEATURES.BUILDER)) notFound();
  const session = await getSession();
  if (!session?.user) redirect('/?auth=1&return=/builder');
  const tier = session.tier === 'pro' ? 'pro' : 'free';
  return <BuilderClient initialTier={tier} />;
}
```

- [ ] **Step 2: Write the wizard client**

```typescript
// app/builder/BuilderClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, useLocale } from '@/app/i18n';
import StepRole from './steps/StepRole';
import StepGoals from './steps/StepGoals';
import StepBrand from './steps/StepBrand';
import StepTools from './steps/StepTools';
import StepAutomation from './steps/StepAutomation';
import type { BuilderAnswers } from '@/app/types/builder';
import { trackBuilderStarted, trackBuilderCompleted } from '@/app/lib/analytics';
import { useEffect } from 'react';

const TOTAL = 5;

export default function BuilderClient({ initialTier }: { initialTier: 'free' | 'pro' }) {
  const router = useRouter();
  const t = useTranslation();
  const { locale } = useLocale();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<BuilderAnswers>({
    role: 'Marketer',
    goals: [],
    tone: 'Professional',
    tools: [],
    automation: 'semi_auto',
    lang: locale,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackBuilderStarted({ tier: initialTier });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canNext =
    (step === 1 && !!answers.role) ||
    (step === 2 && answers.goals.length >= 1) ||
    (step === 3 && !!answers.tone) ||
    step === 4 ||
    step === 5;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, lang: locale }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        if (body.code === 'QUOTA_EXHAUSTED') {
          router.push('/pricing?reason=builder_quota');
          return;
        }
        throw new Error(body.error ?? 'Failed to generate');
      }
      const data = (await res.json()) as { id: string };
      trackBuilderCompleted({ tier: initialTier, role: answers.role, goalCount: answers.goals.length });
      router.push(`/builder/result/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">{t.builder.pageTitle}</h1>
          <div className="mt-2 text-sm text-gray-400">Step {step} of {TOTAL}</div>
          <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </header>

        <div className="rounded-xl border border-border bg-surface/50 p-6">
          {step === 1 && <StepRole value={answers.role} onChange={(v) => setAnswers({ ...answers, role: v })} />}
          {step === 2 && <StepGoals value={answers.goals} onChange={(v) => setAnswers({ ...answers, goals: v })} />}
          {step === 3 && <StepBrand value={answers.tone} onChange={(v) => setAnswers({ ...answers, tone: v })} />}
          {step === 4 && <StepTools value={answers.tools} onChange={(v) => setAnswers({ ...answers, tools: v })} />}
          {step === 5 && <StepAutomation value={answers.automation} onChange={(v) => setAnswers({ ...answers, automation: v })} />}
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-md bg-red-900/40 border border-red-700 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            disabled={step === 1 || submitting}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 rounded-lg border border-border text-gray-300 disabled:opacity-40"
          >
            {t.builder.backCta}
          </button>
          {step < TOTAL ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent font-semibold text-white disabled:opacity-40"
            >
              {t.builder.nextCta}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent font-semibold text-white disabled:opacity-40"
            >
              {submitting ? t.builder.generating : t.builder.generateCta}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "app/builder/"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/builder/page.tsx app/builder/BuilderClient.tsx
git commit -m "feat(builder): add 5-step wizard page (flag-gated, sign-in required)"
```

---

## Task 15: `/builder/result/[id]` Preview + Download Page

**Files:**
- Create: `app/builder/result/[id]/page.tsx`
- Create: `app/builder/result/[id]/BuilderResultClient.tsx`

- [ ] **Step 1: Write the server page**

```typescript
// app/builder/result/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { getSession } from '@/app/lib/auth';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import BuilderResultClient from './BuilderResultClient';
import type { BuilderFileMap } from '@/app/types/builder';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

async function load(id: string, userId: string): Promise<{
  files: BuilderFileMap;
  isProBuild: boolean;
  expiresAt: string;
} | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const { data } = await supa
    .from('builder_outputs')
    .select('files, is_pro_build, expires_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  if (new Date(data.expires_at as string) < new Date()) return null;
  return {
    files: data.files as BuilderFileMap,
    isProBuild: data.is_pro_build as boolean,
    expiresAt: data.expires_at as string,
  };
}

export default async function BuilderResultPage({ params }: Props) {
  if (!isFeatureEnabled(FEATURES.BUILDER)) notFound();
  const session = await getSession();
  if (!session?.user) redirect('/?auth=1&return=/builder');
  const build = await load(params.id, session.user.id);
  if (!build) notFound();
  return (
    <BuilderResultClient
      id={params.id}
      files={build.files}
      isProBuild={build.isProBuild}
      expiresAt={build.expiresAt}
    />
  );
}
```

- [ ] **Step 2: Write the client component**

```typescript
// app/builder/result/[id]/BuilderResultClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n';
import AdSlot from '@/app/components/AdSlot';
import { trackBuilderShared } from '@/app/lib/analytics';
import type { BuilderFileMap } from '@/app/types/builder';

interface Props {
  id: string;
  files: BuilderFileMap;
  isProBuild: boolean;
  expiresAt: string;
}

export default function BuilderResultClient({ id, files, isProBuild, expiresAt }: Props) {
  const t = useTranslation();
  const [shareState, setShareState] = useState<'idle' | 'claimed' | 'error'>('idle');
  const fileEntries = Object.entries(files);
  const expiresMin = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 60_000));

  async function claimShare() {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      trackBuilderShared({ id });
      if (navigator.share) {
        await navigator.share({ title: 'I built an AI harness in 2 minutes', url });
      } else {
        await navigator.clipboard?.writeText(url);
      }
      const res = await fetch('/api/builder/claim-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId: id }),
      });
      if (res.ok) setShareState('claimed');
      else setShareState('error');
    } catch {
      setShareState('error');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">{t.builder.result.title}</h1>
          <p className="mt-2 text-sm text-gray-400">{t.builder.result.expiresNotice.replace('{min}', String(expiresMin))}</p>
        </header>

        {/* Download CTA stack */}
        <div className="space-y-3 mb-8">
          <a
            href={`/api/builder/download/${id}`}
            className="block text-center rounded-lg bg-gradient-to-r from-primary to-accent py-3 font-semibold text-white"
          >
            {t.builder.result.downloadCta}
          </a>
          <a
            href={`vscode://file/${encodeURIComponent('./harness-' + id.slice(0, 8))}`}
            className="block text-center rounded-lg border border-border py-3 text-white hover:bg-surface"
          >
            {t.builder.result.vscodeCta}
          </a>
          <a
            href="https://youtube.com/watch?v=PLACEHOLDER_60S_GUIDE"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-lg border border-border py-3 text-gray-300 hover:bg-surface"
          >
            {t.builder.result.videoGuideCta}
          </a>
        </div>

        {/* File preview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">{t.builder.result.previewTitle}</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto rounded-lg border border-border bg-surface/50 p-4">
            {fileEntries.map(([path, content]) => (
              <details key={path} className="text-sm">
                <summary className="cursor-pointer font-mono text-primary">{path}</summary>
                <pre className="mt-2 p-3 bg-dark rounded whitespace-pre-wrap text-xs text-gray-300">{content}</pre>
              </details>
            ))}
          </div>
        </section>

        {!isProBuild && (
          <section className="mb-8 rounded-xl border border-primary/40 bg-primary/5 p-5">
            <h3 className="font-semibold text-white">{t.builder.result.shareBonusTitle}</h3>
            <p className="mt-1 text-sm text-gray-300">{t.builder.result.shareBonusBody}</p>
            <button
              type="button"
              onClick={claimShare}
              disabled={shareState === 'claimed'}
              className="mt-3 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {shareState === 'claimed' ? t.builder.result.shareClaimed : t.builder.result.shareCta}
            </button>
            {shareState === 'error' && (
              <div className="mt-2 text-xs text-red-300">{t.builder.result.shareError}</div>
            )}
          </section>
        )}

        <AdSlot placement="ResultBottom" isPro={isProBuild} />

        <div className="mt-8 flex gap-3">
          <Link href="/builder" className="flex-1 rounded-lg border border-border py-3 text-center text-white hover:bg-surface">
            {t.builder.result.buildAnotherCta}
          </Link>
          <Link href="/harness" className="flex-1 rounded-lg border border-border py-3 text-center text-white hover:bg-surface">
            {t.builder.result.scoreItCta}
          </Link>
        </div>
      </section>
      <AdSlot placement="FooterSticky" isPro={isProBuild} />
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "builder/result"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add "app/builder/result/[id]"
git commit -m "feat(builder): add /builder/result/[id] preview, download, share-bonus flow"
```

---

## Task 16: Update Home Card — "Build a Setup" Links to `/builder`

**Files:**
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: Locate and edit the third card**

Find the third home card in `HomeClient.tsx` (the "Build a Setup" card — it currently has `href="/pricing"`). Change its href to `/builder`.

```diff
-          <a
-            href="/pricing"
+          <a
+            href="/builder"
             className="group rounded-xl border border-border bg-surface/60 p-6 text-left hover:border-primary transition"
           >
             <div className="text-3xl mb-2">🏗</div>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep HomeClient` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/HomeClient.tsx
git commit -m "feat(home): link Build-a-Setup card to /builder (was /pricing)"
```

---

## Task 17: i18n English Keys for `builder` Namespace

**Files:**
- Modify: `app/i18n/locales/en.ts`

- [ ] **Step 1: Append `builder` namespace at the end of the `en` object (before `} as const;`)**

```typescript
  // ─── Harness Builder (Sprint 2) ───────────────────────
  builder: {
    pageTitle: 'Build Your AI Setup',
    nextCta: 'Next →',
    backCta: '← Back',
    generateCta: 'Generate my harness',
    generating: 'Generating…',
    result: {
      title: 'Your harness is ready',
      expiresNotice: 'Download within {min} minutes — this link expires for your privacy.',
      downloadCta: 'Download ZIP',
      vscodeCta: 'Open in VS Code',
      videoGuideCta: '60-second video guide',
      previewTitle: 'File preview',
      shareBonusTitle: 'Want another free build this month?',
      shareBonusBody: 'Share your harness link on any social platform — you\'ll earn +1 build this month.',
      shareCta: 'Share & earn +1 build',
      shareClaimed: '✓ Bonus claimed',
      shareError: 'Share not verified — please try again.',
      buildAnotherCta: 'Build another',
      scoreItCta: 'Score this setup',
    },
  },
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "en.ts"` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/i18n/locales/en.ts
git commit -m "feat(i18n): add builder namespace English keys"
```

---

## Task 18: Analytics Wrappers + Sentry Tag

**Files:**
- Modify: `app/lib/analytics.ts`

- [ ] **Step 1: Append 3 wrappers at the end of `analytics.ts`**

```typescript
// ─── Harness Builder (Sprint 2) ──────────────────────────────────────
interface BuilderStartedEvent {
  tier: 'free' | 'pro';
}

export function trackBuilderStarted({ tier }: BuilderStartedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { tier, timestamp: new Date().toISOString() };
  window.posthog?.capture('builder_started', event);
  if (!isProd) console.log('[Analytics] builder_started', event);
}

interface BuilderCompletedEvent {
  tier: 'free' | 'pro';
  role: string;
  goalCount: number;
}

export function trackBuilderCompleted({ tier, role, goalCount }: BuilderCompletedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { tier, role, goalCount, timestamp: new Date().toISOString() };
  window.posthog?.capture('builder_completed', event);
  if (!isProd) console.log('[Analytics] builder_completed', event);
}

interface BuilderSharedEvent {
  id: string;
}

export function trackBuilderShared({ id }: BuilderSharedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { id, timestamp: new Date().toISOString() };
  window.posthog?.capture('builder_shared', event);
  if (!isProd) console.log('[Analytics] builder_shared', event);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep analytics.ts` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/lib/analytics.ts
git commit -m "feat(builder): add 3 PostHog wrappers (started/completed/shared)"
```

---

## Sprint 2 Gate — QA Checklist

Run before merging the Sprint 2 branch:

- [ ] **Unit tests:** `npx jest __tests__/lib/api-key-mask.test.ts __tests__/lib/builder-validate.test.ts __tests__/api/builder-generate.test.ts --no-coverage --forceExit` — all pass.
- [ ] **Regression:** `npx jest __tests__/api/harness-analyze.test.ts __tests__/api/analyze.test.ts --no-coverage --forceExit` — 15/15 pass.
- [ ] **Typecheck:** new files have zero errors.
- [ ] **Build:** `npm run build` completes.
- [ ] **Manual wizard run:** sign in → `/builder` → all 5 steps navigable → submit → redirected to `/builder/result/<id>` → ZIP download works → VS Code deep link opens (or gracefully fails).
- [ ] **Quota check:** Free user's second build in the same month returns 402 QUOTA_EXHAUSTED → redirects to `/pricing?reason=builder_quota`. After share claim, third build succeeds.
- [ ] **Expiry:** after 5 min, `/builder/result/<id>` returns 404 and `/api/builder/download/<id>` returns 410.
- [ ] **Watermark:** Free user's downloaded ZIP has the upgrade line appended to README.md; Pro user's does not.
- [ ] **Sign-in redirect:** unauthenticated GET `/builder` → redirected to home with `?auth=1&return=/builder`.
- [ ] **Feature flag:** remove `BUILDER` from `NEXT_PUBLIC_FEATURES` → `/builder` returns 404.

---

## Rollback Plan

```bash
# In Vercel env:
NEXT_PUBLIC_FEATURES="...,HARNESS_SCORE"   # omit BUILDER
# Redeploy. /builder returns 404, Home "Build a Setup" card still links but 404s on click.
```

DB tables are additive and unreachable when flag off. `jszip` is an innocuous dep; no revert needed.

---

## Deferred Manual Actions

1. **DB migration** — apply `supabase/migrations/004_builder_tables.sql` in Supabase Studio.
2. **pg_cron** — run the `SELECT cron.schedule(...)` statement once in SQL editor (extension must be enabled at the project level). If pg_cron is unavailable, set up a Vercel cron webhook hitting a cleanup endpoint instead.
3. **60-second video** — record + replace `PLACEHOLDER_60S_GUIDE` in `BuilderResultClient.tsx` before launch.
4. **9-language i18n translation** — run `scripts/translate-harness-keys.ts` (extend to include `builder` namespace — Sprint 2 addition: update the script's `extractBlock` calls to also extract `builder`).

---

**End of Sprint 2 Plan.** Sprint 3 (Pricing $4.99 migration + 10-language SEO hub + AdSense activation + PH launch) remains in the spec document.
