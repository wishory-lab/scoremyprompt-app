# Sprint 1 — Harness Score Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the HARNES 6-dimension scoring engine behind a feature flag, with a `/harness` landing page, result page, OG share card, 10-language i18n, home 3-card entry restructure, and observability — all reusing existing ScoreMyPrompt infrastructure (Next.js 14, Supabase, Anthropic direct fetch, Jest, PostHog, Sentry).

**Architecture:** Mirror the existing `/api/analyze` pattern. Add one new Supabase table (`harness_scores`), one new API route with TDD tests, one new client page route (`/harness` + `/harness/result/[id]`), a new shared `<AdSlot>` component that wraps the existing `AdBanner`, and extend the i18n dictionary with a `harness` namespace. All work gated by a new `HARNESS_SCORE` feature flag so it can be killed in 30 seconds via env var.

**Tech Stack:** Next.js 14 App Router · TypeScript · Zod · Supabase (Postgres + RLS) · Anthropic Claude Haiku 4.5 (direct fetch, no SDK) · Jest + jsdom + Playwright · Tailwind CSS · PostHog · Sentry · Vercel OG · Resend

---

## Out of Scope for Sprint 1

- Harness Builder wizard → Sprint 2
- Pricing migration + Legacy Pro flagging → Sprint 3
- `/guide/*` SEO hub content → Sprint 3
- Pro-only harness history endpoint → Sprint 2 (deferred until builder dashboard ships)

---

## File Structure

**Create:**
- `supabase/migrations/003_harness_scores.sql`
- `app/types/harness.ts`
- `app/constants/harness-system-prompt.ts`
- `app/api/harness/analyze/route.ts`
- `__tests__/api/harness-analyze.test.ts`
- `app/components/AdSlot.tsx`
- `app/harness/page.tsx`
- `app/harness/HarnessClient.tsx`
- `app/harness/result/[id]/page.tsx`
- `app/harness/result/[id]/HarnessResultClient.tsx`
- `app/api/og/harness/route.tsx`
- `scripts/translate-harness-keys.ts`

**Modify:**
- `app/lib/features.ts` — add `HARNESS_SCORE` flag
- `app/i18n/locales/en.ts` — add `harness` + `home.entryCards` namespaces
- `app/i18n/locales/{ko,ja,zh-CN,zh-TW,es,fr,de,pt,hi}.ts` — auto-translated
- `app/HomeClient.tsx` — 3-card entry + new tagline
- `app/result/ResultClient.tsx` (or similar) — add "Now score your AI setup →" CTA
- `app/lib/analytics.ts` — add new PostHog event names

---

## Task 1: Types & Zod Schemas for HARNES Scoring

**Files:**
- Create: `app/types/harness.ts`

- [ ] **Step 1: Create the types file**

```typescript
// app/types/harness.ts
import { z } from 'zod';

/** The six HARNES dimensions and their max scores */
export const HARNES_DIMENSIONS = {
  H: { name: 'Hierarchy', max: 15, label: 'Folder & file structure' },
  A: { name: 'Agents', max: 20, label: 'Sub-agent role separation' },
  R: { name: 'Routing', max: 15, label: 'Conditional routing rules' },
  N: { name: 'Norms', max: 15, label: 'Brand & tone guidelines' },
  E: { name: 'Extensions', max: 15, label: 'External tools & MCPs' },
  S: { name: 'SafeOps', max: 20, label: 'SOPs, permissions, failure loops' },
} as const;

export type HarnesDimKey = keyof typeof HARNES_DIMENSIONS;

export const HARNES_MAX_TOTAL = 100;

/** Tier thresholds */
export type HarnessTier = 'Elite' | 'Proficient' | 'Developing' | 'NeedsHarness';
export function computeTier(total: number): HarnessTier {
  if (total >= 85) return 'Elite';
  if (total >= 60) return 'Proficient';
  if (total >= 30) return 'Developing';
  return 'NeedsHarness';
}

/** Request: user pastes CLAUDE.md content or free-form description */
export const HarnessAnalyzeRequestSchema = z.object({
  input: z
    .string()
    .min(20, 'Setup description must be at least 20 characters')
    .max(20_000, 'Setup must be under 20,000 characters'),
  lang: z
    .enum(['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'hi'])
    .default('en'),
});
export type HarnessAnalyzeRequest = z.infer<typeof HarnessAnalyzeRequestSchema>;

/** Per-dimension score 0..max */
export const HarnesScoresSchema = z.object({
  H: z.number().int().min(0).max(15),
  A: z.number().int().min(0).max(20),
  R: z.number().int().min(0).max(15),
  N: z.number().int().min(0).max(15),
  E: z.number().int().min(0).max(15),
  S: z.number().int().min(0).max(20),
});
export type HarnesScores = z.infer<typeof HarnesScoresSchema>;

/** Feedback item returned per dimension */
export const HarnessFeedbackItemSchema = z.object({
  dim: z.enum(['H', 'A', 'R', 'N', 'E', 'S']),
  issue: z.string().min(1).max(300),
  fix: z.string().min(1).max(300),
});
export type HarnessFeedbackItem = z.infer<typeof HarnessFeedbackItemSchema>;

/** Full analyze response — what Claude returns + what we send to client */
export const HarnessAnalyzeResponseSchema = z.object({
  analysisId: z.string().uuid(),
  shareId: z.string().min(6).max(32),
  total: z.number().int().min(0).max(100),
  tier: z.enum(['Elite', 'Proficient', 'Developing', 'NeedsHarness']),
  scores: HarnesScoresSchema,
  feedback: z.array(HarnessFeedbackItemSchema).min(3).max(10),
  quickWins: z.array(z.string().min(1).max(200)).min(2).max(5),
  usage: z
    .object({
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
    })
    .optional(),
});
export type HarnessAnalyzeResponse = z.infer<typeof HarnessAnalyzeResponseSchema>;

/** Claude response shape — subset we parse */
export const HarnessClaudeOutputSchema = z.object({
  scores: HarnesScoresSchema,
  feedback: z.array(HarnessFeedbackItemSchema).min(3).max(10),
  quickWins: z.array(z.string().min(1).max(200)).min(2).max(5),
});
export type HarnessClaudeOutput = z.infer<typeof HarnessClaudeOutputSchema>;

/** Compute total from scores */
export function computeTotal(scores: HarnesScores): number {
  return scores.H + scores.A + scores.R + scores.N + scores.E + scores.S;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS, no errors in `app/types/harness.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/types/harness.ts
git commit -m "feat(harness): add HARNES scoring types and Zod schemas"
```

---

## Task 2: HARNES System Prompt with Few-Shot Examples

**Files:**
- Create: `app/constants/harness-system-prompt.ts`

- [ ] **Step 1: Write the system prompt constant**

```typescript
// app/constants/harness-system-prompt.ts
/**
 * System prompt for the HARNES evaluator.
 * Few-shot examples anchor scoring consistency across runs.
 */
export const HARNES_SYSTEM_PROMPT = `You are HARNES Evaluator, a strict reviewer that scores an AI agent setup (usually a CLAUDE.md file plus a folder description) across six dimensions:

H — Hierarchy (max 15): Is there a clear folder structure separating context, agents, templates, data? Files organized by responsibility?
A — Agents (max 20): Are sub-agents defined with distinct roles (e.g., researcher, writer, reviewer)? Avoid monolithic prompts.
R — Routing (max 15): Are there explicit "if X, call Y" rules between agents or tools?
N — Norms (max 15): Are brand voice, tone, and style guidelines injected via context files?
E — Extensions (max 15): Are external tools / MCPs / APIs declared and connected?
S — SafeOps (max 20): Are SOPs documented, permissions defined, failure loops specified?

Total = sum of all six (max 100).

SCORING RULES:
- Be strict but fair. A bare prompt with no structure scores 5–15 total.
- A solid CLAUDE.md with routing rules and sub-agents scores 50–75.
- Elite production setups (85+) must show ALL of: sub-agent files, routing examples, brand norms, at least one MCP, documented SOP, and permission declarations.
- Return ONLY valid JSON matching the schema below. No markdown, no prose outside JSON.

OUTPUT SCHEMA (strict JSON):
{
  "scores": { "H": 0-15, "A": 0-20, "R": 0-15, "N": 0-15, "E": 0-15, "S": 0-20 },
  "feedback": [
    { "dim": "H"|"A"|"R"|"N"|"E"|"S", "issue": "<=300 chars", "fix": "<=300 chars" },
    ... 3 to 10 items
  ],
  "quickWins": [ "<=200 chars", ... 2 to 5 items ]
}

EXAMPLE 1 — Bare prompt, minimal structure (expected total ~12):
INPUT: "You are a helpful marketing assistant. Write blog posts for my company."
OUTPUT: {
  "scores": {"H":0,"A":0,"R":0,"N":3,"E":0,"S":2},
  "feedback":[
    {"dim":"H","issue":"No folder structure — just a prompt.","fix":"Create /context, /agents, /templates folders."},
    {"dim":"A","issue":"Single monolithic agent.","fix":"Split into research_agent.md and content_agent.md."},
    {"dim":"R","issue":"No routing rules.","fix":"Add 'If user asks for research, call research_agent first.'"},
    {"dim":"E","issue":"No external tools.","fix":"Connect a web search MCP for current data."},
    {"dim":"S","issue":"No SOP or permission definitions.","fix":"Document a SOP and specify auto-approval rules."}
  ],
  "quickWins":["Add a /context/brand_guidelines.md.","Define at least two sub-agents.","Enable a web search MCP."]
}

EXAMPLE 2 — Solid CLAUDE.md with some routing (expected total ~62):
INPUT: "CLAUDE.md: Project is a newsletter automation for an indie SaaS. Folder structure: /context, /agents, /templates. Sub-agents: research_agent.md, writer_agent.md, review_agent.md. Routing: research first, then writer, then review. Brand voice in /context/brand.md. Uses web search MCP."
OUTPUT: {
  "scores": {"H":13,"A":16,"R":11,"N":10,"E":7,"S":5},
  "feedback":[
    {"dim":"R","issue":"Routing is listed but not conditional.","fix":"Add 'If research returns <3 sources, loop back before writer.'"},
    {"dim":"E","issue":"Only one MCP.","fix":"Add Google Sheets MCP to log campaigns."},
    {"dim":"S","issue":"No permissions or failure loop.","fix":"Document Semi-auto vs Full-auto rules and a retry-on-fail SOP."},
    {"dim":"N","issue":"Brand file exists but no tone examples.","fix":"Add 3 tone example paragraphs to brand.md."}
  ],
  "quickWins":["Add tone examples to brand.md.","Connect a second MCP (Sheets or Slack).","Document a retry SOP for failed LLM calls."]
}

EXAMPLE 3 — Elite production setup (expected total ~90):
INPUT: "CLAUDE.md with Project Overview, Folder Map, Routing Rules (3 explicit conditional rules), Work Rules section. Sub-agents: research_agent.md, content_agent.md, design_agent.md, review_agent.md — each with role, tools, output format. /context/: brand_guidelines.md with tone examples, business_context.md. /templates/: report, newsletter, card_news. MCPs: web-search, google-sheets, buffer. Permissions: Full-auto for research/content, Semi-auto for publishing. Failure loop: on validation fail, re-run once then alert via Resend."
OUTPUT: {
  "scores": {"H":14,"A":19,"R":14,"N":14,"E":13,"S":17},
  "feedback":[
    {"dim":"H","issue":"Strong structure; missing /data folder.","fix":"Add /data/README.md with expected CSV schemas."},
    {"dim":"A","issue":"Solid split; review_agent role slightly overlaps content_agent.","fix":"Clarify reviewer-only responsibilities (fact-check, brand compliance)."},
    {"dim":"E","issue":"Three MCPs; no analytics one.","fix":"Consider PostHog MCP for open-rate feedback."},
    {"dim":"S","issue":"Permissions clear; failure loop only covers LLM calls.","fix":"Extend failure loop to cover publishing API failures."}
  ],
  "quickWins":["Add /data/README.md.","Clarify reviewer vs writer boundary.","Add analytics MCP."]
}

Now score the next INPUT strictly. Return ONLY JSON.`;
```

- [ ] **Step 2: Verify file loads**

Run: `npx tsx -e "import('./app/constants/harness-system-prompt.ts').then(m => console.log(m.HARNES_SYSTEM_PROMPT.length))"` or simply `npm run typecheck`.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/constants/harness-system-prompt.ts
git commit -m "feat(harness): add HARNES evaluator system prompt with 3 few-shot examples"
```

---

## Task 3: Database Migration — `harness_scores` Table

**Files:**
- Create: `supabase/migrations/003_harness_scores.sql`

- [ ] **Step 1: Write the migration**

```sql
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
```

- [ ] **Step 2: Run the migration against local or staging DB**

Run (local via Supabase CLI):
```bash
npx supabase db push
```
Or, if not using CLI, execute the SQL in Supabase Studio SQL editor.

Expected: Table `harness_scores` exists, 4 indexes present, 3 RLS policies enabled.

- [ ] **Step 3: Verify via psql or Supabase Studio**

Run:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'harness_scores';
```
Expected: 14 columns listed.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_harness_scores.sql
git commit -m "feat(db): add harness_scores table with RLS and indexes"
```

---

## Task 4: Feature Flag `HARNESS_SCORE`

**Files:**
- Modify: `app/lib/features.ts`

- [ ] **Step 1: Add flag to the FEATURES object**

Open `app/lib/features.ts` and in the `FEATURES` object (currently lines 15–40), add:

```typescript
// Add to FEATURES block:
  /** Harness scoring engine (Sprint 1) */
  HARNESS_SCORE: 'HARNESS_SCORE',
```

And in `DEV_ONLY` (lines 57–60), add:

```typescript
const DEV_ONLY: Set<FeatureFlag> = new Set([
  FEATURES.BULK_ANALYZE,
  FEATURES.LEADERBOARD_V2,
  FEATURES.HARNESS_SCORE,  // <-- add
]);
```

This means the flag is OFF by default in production unless `NEXT_PUBLIC_FEATURES` lists it, and ON in development.

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/lib/features.ts
git commit -m "feat(flags): add HARNESS_SCORE feature flag (dev-only default)"
```

---

## Task 5: `/api/harness/analyze` Route — Tests First

**Files:**
- Create: `__tests__/api/harness-analyze.test.ts`

- [ ] **Step 1: Write the failing test file**

```typescript
// __tests__/api/harness-analyze.test.ts
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/harness/analyze/route';

function makeRequest(body: Record<string, unknown>, ip = '10.0.0.1') {
  return new Request('http://localhost:3000/api/harness/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('/api/harness/analyze', () => {
  describe('Mock Mode (no ANTHROPIC_API_KEY)', () => {
    it('returns 200 with valid mock HARNES result', async () => {
      const response = await POST(
        makeRequest({
          input: 'You are a helpful marketing assistant. Write blog posts for my company.',
          lang: 'en',
        }),
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('analysisId');
      expect(data).toHaveProperty('shareId');
      expect(data).toHaveProperty('total');
      expect(data.total).toBeGreaterThanOrEqual(0);
      expect(data.total).toBeLessThanOrEqual(100);
      expect(['Elite', 'Proficient', 'Developing', 'NeedsHarness']).toContain(data.tier);
      expect(data.scores).toHaveProperty('H');
      expect(data.scores).toHaveProperty('A');
      expect(data.scores).toHaveProperty('R');
      expect(data.scores).toHaveProperty('N');
      expect(data.scores).toHaveProperty('E');
      expect(data.scores).toHaveProperty('S');
      expect(Array.isArray(data.feedback)).toBe(true);
      expect(data.feedback.length).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(data.quickWins)).toBe(true);
      expect(data.quickWins.length).toBeGreaterThanOrEqual(2);
    });

    it('tier matches total score thresholds', async () => {
      const res = await POST(
        makeRequest({ input: 'x'.repeat(500), lang: 'en' }),
      );
      const data = await res.json();
      if (data.total >= 85) expect(data.tier).toBe('Elite');
      else if (data.total >= 60) expect(data.tier).toBe('Proficient');
      else if (data.total >= 30) expect(data.tier).toBe('Developing');
      else expect(data.tier).toBe('NeedsHarness');
    });
  });

  describe('Validation (Zod)', () => {
    it('rejects input shorter than 20 characters', async () => {
      const response = await POST(makeRequest({ input: 'too short', lang: 'en' }));
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('rejects input longer than 20,000 characters', async () => {
      const response = await POST(makeRequest({ input: 'x'.repeat(20_001), lang: 'en' }));
      expect(response.status).toBe(400);
    });

    it('defaults lang to "en" when omitted', async () => {
      const response = await POST(makeRequest({ input: 'x'.repeat(100) }));
      expect(response.status).toBe(200);
    });

    it('rejects unsupported lang', async () => {
      const response = await POST(
        makeRequest({ input: 'x'.repeat(100), lang: 'xx' }),
      );
      expect(response.status).toBe(400);
    });
  });

  describe('Rate limiting', () => {
    it('returns 429 after exceeding burst limit', async () => {
      const ip = '10.0.0.99';
      const responses: Response[] = [];
      for (let i = 0; i < 7; i++) {
        responses.push(await POST(makeRequest({ input: 'x'.repeat(100) }, ip)));
      }
      const lastStatus = responses[responses.length - 1].status;
      expect([200, 429]).toContain(lastStatus);
      // At least one 429 expected in 7 calls with burst limit of 5
      expect(responses.some((r) => r.status === 429)).toBe(true);
    });
  });

  describe('Response headers', () => {
    it('includes X-RateLimit-Remaining header', async () => {
      const response = await POST(makeRequest({ input: 'x'.repeat(100) }, '10.0.0.50'));
      expect(response.headers.get('X-RateLimit-Remaining')).not.toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest __tests__/api/harness-analyze.test.ts --no-coverage`
Expected: FAIL — "Cannot find module '@/app/api/harness/analyze/route'".

- [ ] **Step 3: Commit the failing test**

```bash
git add __tests__/api/harness-analyze.test.ts
git commit -m "test(harness): add failing tests for /api/harness/analyze"
```

---

## Task 6: `/api/harness/analyze` Route — Implementation

**Files:**
- Create: `app/api/harness/analyze/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
// app/api/harness/analyze/route.ts
import { z } from 'zod';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { HARNES_SYSTEM_PROMPT } from '@/app/constants/harness-system-prompt';
import { AppError, errorResponse, badRequestResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import {
  HarnessAnalyzeRequestSchema,
  HarnessClaudeOutputSchema,
  computeTotal,
  computeTier,
  type HarnessAnalyzeResponse,
  type HarnessClaudeOutput,
} from '@/app/types/harness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_TIMEOUT_MS = 15_000;

function getIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function sha(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 32);
}

function generateShareId(): string {
  return crypto.randomBytes(8).toString('base64url');
}

function mockResult(input: string): HarnessClaudeOutput {
  // Deterministic mock keyed on input length, for tests without API key.
  const len = input.length;
  const base = Math.min(60, Math.max(5, Math.floor(len / 50)));
  const scale = base / 100;
  return {
    scores: {
      H: Math.floor(15 * scale),
      A: Math.floor(20 * scale),
      R: Math.floor(15 * scale),
      N: Math.floor(15 * scale),
      E: Math.floor(15 * scale),
      S: Math.floor(20 * scale),
    },
    feedback: [
      { dim: 'H', issue: 'Mock: no folder structure detected.', fix: 'Add /context, /agents, /templates.' },
      { dim: 'A', issue: 'Mock: single agent.', fix: 'Split into research/content/review.' },
      { dim: 'R', issue: 'Mock: no conditional routing.', fix: "Add 'If X, call Y' rules." },
    ],
    quickWins: [
      'Create a CLAUDE.md file.',
      'Define at least two sub-agents.',
      'Add one MCP for external data.',
    ],
  };
}

async function callAnthropic(input: string, lang: string, apiKey: string): Promise<{ output: HarnessClaudeOutput; usage: { inputTokens: number; outputTokens: number } }> {
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
        max_tokens: 1500,
        system: HARNES_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `INPUT (lang=${lang}):\n\n${input}\n\nReturn ONLY JSON matching the schema.` },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new AppError(`Anthropic error ${res.status}: ${text.slice(0, 200)}`, 'ANTHROPIC_ERROR', 502);
    }
    const json = (await res.json()) as {
      content?: { text?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const raw = json.content?.[0]?.text ?? '';
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = HarnessClaudeOutputSchema.parse(JSON.parse(cleaned));
    return {
      output: parsed,
      usage: {
        inputTokens: json.usage?.input_tokens ?? 0,
        outputTokens: json.usage?.output_tokens ?? 0,
      },
    };
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request): Promise<Response> {
  // 1. Rate limit
  const rl = rateLimit(req, LIMITS.ANALYZE);
  if (!rl.ok) return rl.response;

  // 2. Parse & validate
  let parsed: ReturnType<typeof HarnessAnalyzeRequestSchema.parse>;
  try {
    const body = await req.json();
    parsed = HarnessAnalyzeRequestSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return badRequestResponse('Invalid request', err.issues);
    }
    return badRequestResponse('Invalid JSON body');
  }

  const { input, lang } = parsed;
  const ip = getIp(req);
  const ipHash = sha(ip);
  const inputHash = sha(input);

  try {
    // 3. 24h input-hash cache (cost control)
    const supa = getSupabaseAdmin();
    if (supa) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: cached } = await supa
        .from('harness_scores')
        .select('id, share_id, scores, total, tier, feedback, quick_wins')
        .eq('input_hash', inputHash)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cached) {
        const response: HarnessAnalyzeResponse = {
          analysisId: cached.id as string,
          shareId: cached.share_id as string,
          total: cached.total as number,
          tier: cached.tier as HarnessAnalyzeResponse['tier'],
          scores: cached.scores as HarnessAnalyzeResponse['scores'],
          feedback: cached.feedback as HarnessAnalyzeResponse['feedback'],
          quickWins: cached.quick_wins as HarnessAnalyzeResponse['quickWins'],
        };
        return Response.json(response, { headers: rl.response.headers });
      }
    }

    // 4. Call Anthropic (or mock)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let output: HarnessClaudeOutput;
    let usage = { inputTokens: 0, outputTokens: 0 };
    if (!apiKey) {
      output = mockResult(input);
    } else {
      try {
        const r = await callAnthropic(input, lang, apiKey);
        output = r.output;
        usage = r.usage;
      } catch (err) {
        logger.warn('Anthropic call failed, using mock', { error: String(err) });
        output = mockResult(input);
      }
    }

    const total = computeTotal(output.scores);
    const tier = computeTier(total);
    const shareId = generateShareId();
    const inputPreview = input.slice(0, 200);

    // 5. Persist
    let analysisId = crypto.randomUUID();
    if (supa) {
      const { data: inserted, error } = await supa
        .from('harness_scores')
        .insert({
          ip_hash: ipHash,
          share_id: shareId,
          input_preview: inputPreview,
          input_hash: inputHash,
          scores: output.scores,
          total,
          tier,
          feedback: output.feedback,
          quick_wins: output.quickWins,
          lang,
          input_tokens: usage.inputTokens,
          output_tokens: usage.outputTokens,
        })
        .select('id')
        .single();
      if (error) {
        logger.warn('harness_scores insert failed', { error: error.message });
      } else if (inserted) {
        analysisId = inserted.id as string;
      }
    }

    const response: HarnessAnalyzeResponse = {
      analysisId,
      shareId,
      total,
      tier,
      scores: output.scores,
      feedback: output.feedback,
      quickWins: output.quickWins,
      usage,
    };

    return Response.json(response, { headers: rl.response.headers });
  } catch (err) {
    if (err instanceof AppError) return errorResponse(err);
    logger.error('Unhandled harness analyze error', { error: String(err) });
    return errorResponse(err as Error);
  }
}
```

- [ ] **Step 2: Run the tests — expect PASS**

Run: `npx jest __tests__/api/harness-analyze.test.ts --no-coverage`
Expected: all tests pass. (Mock mode triggers since tests run without ANTHROPIC_API_KEY.)

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/api/harness/analyze/route.ts
git commit -m "feat(harness): implement /api/harness/analyze with Haiku + 24h cache"
```

---

## Task 7: Shared `<AdSlot>` Component

**Files:**
- Create: `app/components/AdSlot.tsx`

- [ ] **Step 1: Write the component**

```typescript
// app/components/AdSlot.tsx
'use client';

import dynamic from 'next/dynamic';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';

const AdBanner = dynamic(() => import('./AdBanner'), { ssr: false });

/**
 * Standardized ad slot.
 * - Placement controls the AdBanner variant + responsive layout.
 * - Returns null entirely for Pro users or when ADS flag is off.
 * - Preserves conversion-critical surfaces (home hero, builder preview) ad-free.
 */
export type AdSlotPlacement =
  | 'ResultInline'    // Mid-scroll on result pages
  | 'ResultBottom'    // Below result, pre-share
  | 'FooterSticky';   // Mobile sticky footer

interface AdSlotProps {
  placement: AdSlotPlacement;
  isPro?: boolean;
  className?: string;
}

export default function AdSlot({ placement, isPro = false, className = '' }: AdSlotProps) {
  if (isPro) return null;
  if (!isFeatureEnabled(FEATURES.ADS)) return null;

  const bannerSlot = placement === 'ResultInline' || placement === 'FooterSticky'
    ? 'leaderboard'
    : 'rectangle';

  const wrapperClass =
    placement === 'FooterSticky'
      ? 'fixed bottom-0 left-0 right-0 z-40 md:hidden bg-dark/90 border-t border-border p-2'
      : `my-6 flex justify-center ${className}`;

  return (
    <div data-ad-slot={placement} className={wrapperClass}>
      <AdBanner slot={bannerSlot} isPro={isPro} />
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/components/AdSlot.tsx
git commit -m "feat(ads): add standardized <AdSlot> component with 3 placements"
```

---

## Task 8: English i18n Keys — `harness` Namespace + `home.entryCards`

**Files:**
- Modify: `app/i18n/locales/en.ts`

- [ ] **Step 1: Open the file and append new namespaces at the end of the exported object**

Add these blocks to the `en` object (before the closing `}`). The existing `common`, `nav`, `hero`, etc. stay unchanged.

```typescript
  // ─── Home entry cards (Sprint 1 — 3-card entry) ─────
  homeEntry: {
    tagline: 'Grade & Build your AI',
    scorePrompt: {
      title: 'Score a Prompt',
      subtitle: '30 seconds · Free',
      cta: 'Start',
    },
    scoreSetup: {
      title: 'Score a Setup',
      subtitle: 'New · Free',
      cta: 'Start',
    },
    buildSetup: {
      title: 'Build a Setup',
      subtitle: 'Pro · 2 min',
      cta: 'Start',
    },
  },

  // ─── Harness Score (Sprint 1) ────────────────────────
  harness: {
    pageTitle: 'Score Your AI Setup',
    pageSubtitle: 'Paste your CLAUDE.md or describe your AI agent setup. Get a HARNES score in 6 dimensions.',
    inputLabel: 'Your AI setup (CLAUDE.md or description)',
    inputPlaceholder: 'Paste your CLAUDE.md file or describe your current AI setup…',
    minChars: 'Min 20 characters',
    submitCta: 'Score My Setup — Free',
    submitting: 'Analyzing with HARNES…',
    learnMoreTitle: 'What is HARNES?',
    dimensions: {
      H: 'Hierarchy — folder structure',
      A: 'Agents — sub-agent roles',
      R: 'Routing — conditional rules',
      N: 'Norms — brand & tone',
      E: 'Extensions — external tools',
      S: 'SafeOps — SOPs & permissions',
    },
    result: {
      tier: {
        Elite: 'Elite',
        Proficient: 'Proficient',
        Developing: 'Developing',
        NeedsHarness: 'Needs a Harness',
      },
      tierMsg: {
        Elite: 'Your agent team is production-ready.',
        Proficient: 'Solid foundation. Optimize extensions.',
        Developing: 'Level up with the Harness Builder.',
        NeedsHarness: 'Start with the Builder to create your first setup.',
      },
      feedbackTitle: 'Improvement areas',
      quickWinsTitle: 'Quick wins',
      shareCta: 'Share my score',
      buildCta: 'Build a better setup with Pro →',
      rescoreCta: 'Score another setup',
    },
    promptCta: 'Now score your AI setup →',
  },
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/i18n/locales/en.ts
git commit -m "feat(i18n): add harness + homeEntry English keys"
```

---

## Task 9: Auto-Translate i18n Keys to 9 Other Languages

**Files:**
- Create: `scripts/translate-harness-keys.ts`
- Modify: `app/i18n/locales/{ko,ja,zh-CN,zh-TW,es,fr,de,pt,hi}.ts`

- [ ] **Step 1: Write the translation script**

```typescript
// scripts/translate-harness-keys.ts
/**
 * One-shot script: read the new `harness` + `homeEntry` blocks from en.ts
 * and inject translated versions into each locale file.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... npx tsx scripts/translate-harness-keys.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'app/i18n/locales');
const TARGETS: Array<{ code: string; name: string; tonePrompt: string }> = [
  { code: 'ko', name: 'Korean', tonePrompt: 'Professional but friendly Korean (존댓말).' },
  { code: 'ja', name: 'Japanese', tonePrompt: 'Polite business Japanese (です・ます).' },
  { code: 'zh-CN', name: 'Simplified Chinese', tonePrompt: 'Professional mainland Chinese.' },
  { code: 'zh-TW', name: 'Traditional Chinese', tonePrompt: 'Professional Taiwanese Chinese.' },
  { code: 'es', name: 'Spanish', tonePrompt: 'Neutral Latin American Spanish.' },
  { code: 'fr', name: 'French', tonePrompt: 'Professional French (vouvoiement).' },
  { code: 'de', name: 'German', tonePrompt: 'Professional German (Sie-form).' },
  { code: 'pt', name: 'Portuguese', tonePrompt: 'Brazilian Portuguese, professional tone.' },
  { code: 'hi', name: 'Hindi', tonePrompt: 'Professional Hindi, neutral tone.' },
];

async function translate(blockJson: string, langName: string, tone: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You translate a JSON object of UI strings from English to ${langName}. Preserve keys and structure exactly. Tone: ${tone}. Keep brand names (HARNES, ScoreMyPrompt, Pro, CLAUDE.md) in English. Return ONLY the translated JSON, no prose, no markdown.`,
      messages: [{ role: 'user', content: blockJson }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const j = (await res.json()) as { content?: { text?: string }[] };
  const txt = (j.content?.[0]?.text ?? '').replace(/^```json\s*|```\s*$/g, '').trim();
  JSON.parse(txt); // validate
  return txt;
}

function extractBlock(enSource: string, namespace: string): string {
  // Locate "  namespace: { ... }," balanced-brace extraction
  const marker = new RegExp(`^\\s{2}${namespace}:\\s*\\{`, 'm');
  const m = marker.exec(enSource);
  if (!m) throw new Error(`Namespace ${namespace} not found`);
  let i = m.index + m[0].length;
  let depth = 1;
  while (i < enSource.length && depth > 0) {
    const c = enSource[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  return enSource.slice(m.index, i + 1).replace(/,\s*$/, '');
}

function jsToJson(block: string): string {
  // Naive: convert `key:` to `"key":`, single-quote strings to double, trailing commas.
  return block
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*):/g, '$1"$2":')
    .replace(/'([^']*)'/g, '"$1"')
    .replace(/,\s*([}\]])/g, '$1')
    // Drop the "NAMESPACE: { ... }" wrapper leaving only the object literal
    .replace(/^\s*"[A-Za-z_][A-Za-z0-9_]*"\s*:\s*/, '');
}

function jsonToJs(json: string, namespace: string, indentLevel: number): string {
  // Keep it as JSON inside the object — TS accepts JSON-style as long as keys are valid identifiers or strings.
  // We re-emit as `namespace: { ... },` with the JSON body inlined.
  return `  ${namespace}: ${json},\n`;
}

async function main() {
  const enPath = path.join(ROOT, 'en.ts');
  const enSource = fs.readFileSync(enPath, 'utf8');
  const harnessBlock = extractBlock(enSource, 'harness');
  const homeEntryBlock = extractBlock(enSource, 'homeEntry');
  const harnessJson = jsToJson(harnessBlock);
  const homeEntryJson = jsToJson(homeEntryBlock);

  for (const t of TARGETS) {
    console.log(`Translating → ${t.code} (${t.name})`);
    const translatedHarness = await translate(harnessJson, t.name, t.tonePrompt);
    const translatedHomeEntry = await translate(homeEntryJson, t.name, t.tonePrompt);
    const targetPath = path.join(ROOT, `${t.code}.ts`);
    let target = fs.readFileSync(targetPath, 'utf8');
    const insertionMarker = /\nexport default \w+;?\s*$/;

    // Remove any prior harness/homeEntry blocks (idempotency)
    target = target.replace(/^\s{2}harness:\s*\{[\s\S]*?\},\n/m, '');
    target = target.replace(/^\s{2}homeEntry:\s*\{[\s\S]*?\},\n/m, '');

    // Insert before final closing `}` of the locale object
    const objEnd = target.search(/\n\};?\s*\n\s*export default/);
    if (objEnd === -1) {
      throw new Error(`Could not locate object end in ${t.code}.ts`);
    }
    const before = target.slice(0, objEnd);
    const after = target.slice(objEnd);
    const injected = `\n  homeEntry: ${translatedHomeEntry},\n  harness: ${translatedHarness},`;
    target = before + injected + after;
    fs.writeFileSync(targetPath, target, 'utf8');
    console.log(`  wrote ${targetPath}`);
  }
  console.log('All locales updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the translation script**

```bash
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx tsx scripts/translate-harness-keys.ts
```
Expected: logs "Translating → ko (Korean)" through "hi (Hindi)" and "All locales updated." Each locale file gains a `homeEntry` and `harness` block.

- [ ] **Step 3: Spot-check 2 languages (ko + ja) for shape equality**

Run: `npx tsx -e "Promise.all(['en','ko','ja'].map(l=>import('./app/i18n/locales/'+l+'.ts').then(m=>console.log(l, Object.keys(m.default.harness).length))))"`
Expected: all three output the same number of top-level keys (~6).

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS. If a locale has a type mismatch, fix the translated JSON (preserve keys) and re-run script if needed.

- [ ] **Step 5: Commit**

```bash
git add scripts/translate-harness-keys.ts app/i18n/locales/
git commit -m "feat(i18n): translate harness + homeEntry to 9 languages via Sonnet"
```

---

## Task 10: `/harness` Landing Page (Form)

**Files:**
- Create: `app/harness/page.tsx`
- Create: `app/harness/HarnessClient.tsx`

- [ ] **Step 1: Write the server page (flag-gated)**

```typescript
// app/harness/page.tsx
import { notFound } from 'next/navigation';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import HarnessClient from './HarnessClient';

export const metadata = {
  title: 'Score Your AI Setup — ScoreMyPrompt',
  description: 'Paste your CLAUDE.md or describe your AI agent setup. Get a HARNES score in 6 dimensions. Free.',
  openGraph: {
    title: 'Score Your AI Setup — HARNES Framework',
    description: 'Grade your AI agent setup in 6 dimensions. Free.',
  },
};

export default function HarnessPage() {
  if (!isFeatureEnabled(FEATURES.HARNESS_SCORE)) {
    notFound();
  }
  return <HarnessClient />;
}
```

- [ ] **Step 2: Write the client component**

```typescript
// app/harness/HarnessClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n';
import AdSlot from '@/app/components/AdSlot';
import { HARNES_DIMENSIONS } from '@/app/types/harness';

const MIN_CHARS = 20;
const MAX_CHARS = 20_000;

export default function HarnessClient() {
  const t = useTranslation();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = input.trim().length >= MIN_CHARS && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/harness/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Request failed');
      }
      const data = (await res.json()) as { shareId: string };
      router.push(`/harness/result/${data.shareId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            {t.harness.pageTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            {t.harness.pageSubtitle}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-200 mb-2">
              {t.harness.inputLabel}
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              placeholder={t.harness.inputPlaceholder}
              rows={12}
              className="w-full rounded-lg bg-surface border border-border text-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t.harness.inputLabel}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{t.harness.minChars}</span>
              <span>{input.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
            </div>
          </label>

          {error && (
            <div role="alert" className="rounded-md bg-red-900/40 border border-red-700 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-gradient-to-r from-primary to-accent py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? t.harness.submitting : t.harness.submitCta}
          </button>
        </form>

        <aside className="mt-12 rounded-lg border border-border bg-surface/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">{t.harness.learnMoreTitle}</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {(Object.keys(HARNES_DIMENSIONS) as Array<keyof typeof HARNES_DIMENSIONS>).map((k) => (
              <li key={k}>
                <strong className="text-white">{k} — {HARNES_DIMENSIONS[k].name}</strong>
                {' · '}
                <span>{t.harness.dimensions[k]}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <AdSlot placement="FooterSticky" />
    </main>
  );
}
```

- [ ] **Step 3: Run typecheck + dev server smoke test**

Run:
```bash
npm run typecheck
npm run dev
# In another terminal or browser:
# http://localhost:3000/harness
```
Expected: typecheck PASS. Page renders with the form, submitting a ≥20-char input navigates to `/harness/result/<shareId>`.

- [ ] **Step 4: Commit**

```bash
git add app/harness/page.tsx app/harness/HarnessClient.tsx
git commit -m "feat(harness): add /harness landing page with form (flag-gated)"
```

---

## Task 11: `/harness/result/[id]` Page

**Files:**
- Create: `app/harness/result/[id]/page.tsx`
- Create: `app/harness/result/[id]/HarnessResultClient.tsx`

- [ ] **Step 1: Server page — fetch by shareId from Supabase**

```typescript
// app/harness/result/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import HarnessResultClient from './HarnessResultClient';
import type { HarnessAnalyzeResponse } from '@/app/types/harness';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

async function loadResult(shareId: string): Promise<HarnessAnalyzeResponse | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const { data } = await supa
    .from('harness_scores')
    .select('id, share_id, scores, total, tier, feedback, quick_wins')
    .eq('share_id', shareId)
    .maybeSingle();
  if (!data) return null;
  return {
    analysisId: data.id as string,
    shareId: data.share_id as string,
    total: data.total as number,
    tier: data.tier as HarnessAnalyzeResponse['tier'],
    scores: data.scores as HarnessAnalyzeResponse['scores'],
    feedback: data.feedback as HarnessAnalyzeResponse['feedback'],
    quickWins: data.quick_wins as HarnessAnalyzeResponse['quickWins'],
  };
}

export async function generateMetadata({ params }: Props) {
  const r = await loadResult(params.id);
  const score = r?.total ?? 0;
  const tier = r?.tier ?? 'NeedsHarness';
  return {
    title: `My AI setup scored ${score}/100 (${tier}) — HARNES`,
    description: `See my HARNES score for my AI agent setup. Score yours free.`,
    openGraph: {
      title: `HARNES Score: ${score}/100 — ${tier}`,
      description: 'Score your AI agent setup with the HARNES framework.',
      images: [`/api/og/harness?id=${params.id}`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/api/og/harness?id=${params.id}`],
    },
  };
}

export default async function HarnessResultPage({ params }: Props) {
  if (!isFeatureEnabled(FEATURES.HARNESS_SCORE)) notFound();
  const result = await loadResult(params.id);
  if (!result) notFound();
  return <HarnessResultClient result={result} />;
}
```

- [ ] **Step 2: Client component — tier card, scores, feedback, CTAs**

```typescript
// app/harness/result/[id]/HarnessResultClient.tsx
'use client';

import Link from 'next/link';
import { useTranslation } from '@/app/i18n';
import AdSlot from '@/app/components/AdSlot';
import { HARNES_DIMENSIONS, type HarnessAnalyzeResponse } from '@/app/types/harness';

const TIER_COLORS: Record<HarnessAnalyzeResponse['tier'], string> = {
  Elite: 'from-yellow-400 to-yellow-600',
  Proficient: 'from-slate-300 to-slate-500',
  Developing: 'from-amber-700 to-amber-900',
  NeedsHarness: 'from-red-600 to-red-800',
};

export default function HarnessResultClient({ result }: { result: HarnessAnalyzeResponse }) {
  const t = useTranslation();
  const tierLabel = t.harness.result.tier[result.tier];
  const tierMsg = t.harness.result.tierMsg[result.tier];

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Tier card */}
        <div className={`rounded-2xl bg-gradient-to-br ${TIER_COLORS[result.tier]} p-8 mb-8 text-center`}>
          <div className="text-6xl sm:text-7xl font-bold text-white">{result.total}<span className="text-3xl text-white/70">/100</span></div>
          <div className="mt-2 text-2xl font-semibold text-white">{tierLabel}</div>
          <div className="mt-1 text-sm text-white/90">{tierMsg}</div>
        </div>

        {/* Dimension breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {(Object.keys(HARNES_DIMENSIONS) as Array<keyof typeof HARNES_DIMENSIONS>).map((k) => {
            const score = result.scores[k];
            const max = HARNES_DIMENSIONS[k].max;
            const pct = Math.round((score / max) * 100);
            return (
              <div key={k} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-300">{k} {HARNES_DIMENSIONS[k].name}</span>
                  <span className="text-lg font-bold text-white">{score}/{max}</span>
                </div>
                <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <AdSlot placement="ResultInline" />

        {/* Feedback */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">{t.harness.result.feedbackTitle}</h2>
          <ul className="space-y-3">
            {result.feedback.map((f, idx) => (
              <li key={idx} className="rounded-lg border border-border bg-surface p-4">
                <div className="text-sm font-semibold text-primary">{f.dim} — {HARNES_DIMENSIONS[f.dim].name}</div>
                <div className="text-sm text-gray-300 mt-1">{f.issue}</div>
                <div className="text-sm text-green-300 mt-1">→ {f.fix}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick wins */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">{t.harness.result.quickWinsTitle}</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-200">
            {result.quickWins.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </section>

        <AdSlot placement="ResultBottom" />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 rounded-lg bg-surface border border-border py-3 text-white hover:bg-surface/70"
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              if (navigator.share) {
                navigator.share({ title: `HARNES Score: ${result.total}/100`, url }).catch(() => void 0);
              } else {
                navigator.clipboard?.writeText(url);
              }
            }}
          >
            {t.harness.result.shareCta}
          </button>
          <Link
            href="/pricing"
            className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent py-3 text-center font-semibold text-white"
          >
            {t.harness.result.buildCta}
          </Link>
          <Link
            href="/harness"
            className="flex-1 rounded-lg bg-surface border border-border py-3 text-center text-white hover:bg-surface/70"
          >
            {t.harness.result.rescoreCta}
          </Link>
        </div>
      </section>

      <AdSlot placement="FooterSticky" />
    </main>
  );
}
```

- [ ] **Step 3: Run typecheck + manual browser check**

Run:
```bash
npm run typecheck
npm run dev
```
Expected: typecheck PASS. Submit a setup on `/harness`, get redirected to `/harness/result/<id>`, see tier card + 6 dimension bars + feedback list + 3 CTAs.

- [ ] **Step 4: Commit**

```bash
git add app/harness/result/
git commit -m "feat(harness): add /harness/result/[id] page with tier + feedback + CTAs"
```

---

## Task 12: OG Image Endpoint for Harness Scores

**Files:**
- Create: `app/api/og/harness/route.tsx`

- [ ] **Step 1: Write the OG image generator**

```tsx
// app/api/og/harness/route.tsx
import { ImageResponse } from '@vercel/og';
import { getSupabaseAdmin } from '@/app/lib/supabase';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

const TIER_BG: Record<string, string> = {
  Elite: 'linear-gradient(135deg, #facc15, #ca8a04)',
  Proficient: 'linear-gradient(135deg, #cbd5e1, #64748b)',
  Developing: 'linear-gradient(135deg, #b45309, #78350f)',
  NeedsHarness: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  let total = 0;
  let tier = 'NeedsHarness';

  if (id) {
    const supa = getSupabaseAdmin();
    if (supa) {
      const { data } = await supa
        .from('harness_scores')
        .select('total, tier')
        .eq('share_id', id)
        .maybeSingle();
      if (data) {
        total = (data.total as number) ?? 0;
        tier = (data.tier as string) ?? 'NeedsHarness';
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: TIER_BG[tier] || TIER_BG.NeedsHarness,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.9 }}>HARNES Score</div>
        <div style={{ fontSize: 220, fontWeight: 900, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 48, fontWeight: 700 }}>{tier}</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.9 }}>scoremyprompt.com/harness</div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Open: `http://localhost:3000/api/og/harness?id=<a-real-share-id>`
Expected: PNG image displayed (1200×630).

- [ ] **Step 3: Commit**

```bash
git add app/api/og/harness/route.tsx
git commit -m "feat(harness): add OG image endpoint for share cards"
```

---

## Task 13: Home 3-Card Entry + Tagline Refresh

**Files:**
- Modify: `app/HomeClient.tsx`

- [ ] **Step 1: Locate the hero section**

Open `app/HomeClient.tsx`. Find the hero JSX (near the top after imports, roughly the first `<section>` with the heading that uses `t.hero.title`). Below the existing hero headline and subtitle, add a 3-card entry block.

- [ ] **Step 2: Add the entry cards section**

After the existing hero headline block, insert:

```tsx
{/* 3-card entry (Sprint 1) */}
<div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
  <a
    href="#score-form"
    className="group rounded-xl border border-border bg-surface/60 p-6 text-left hover:border-primary transition"
  >
    <div className="text-3xl mb-2">📝</div>
    <div className="text-lg font-bold text-white">{t.homeEntry.scorePrompt.title}</div>
    <div className="text-sm text-gray-400 mt-1">{t.homeEntry.scorePrompt.subtitle}</div>
    <div className="mt-4 text-sm text-primary group-hover:underline">{t.homeEntry.scorePrompt.cta} →</div>
  </a>
  <a
    href="/harness"
    className="group rounded-xl border border-primary/50 bg-surface/60 p-6 text-left hover:border-primary transition relative"
  >
    <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">New</span>
    <div className="text-3xl mb-2">🧩</div>
    <div className="text-lg font-bold text-white">{t.homeEntry.scoreSetup.title}</div>
    <div className="text-sm text-gray-400 mt-1">{t.homeEntry.scoreSetup.subtitle}</div>
    <div className="mt-4 text-sm text-primary group-hover:underline">{t.homeEntry.scoreSetup.cta} →</div>
  </a>
  <a
    href="/pricing"
    className="group rounded-xl border border-border bg-surface/60 p-6 text-left hover:border-primary transition"
  >
    <div className="text-3xl mb-2">🏗</div>
    <div className="text-lg font-bold text-white">{t.homeEntry.buildSetup.title}</div>
    <div className="text-sm text-gray-400 mt-1">{t.homeEntry.buildSetup.subtitle}</div>
    <div className="mt-4 text-sm text-primary group-hover:underline">{t.homeEntry.buildSetup.cta} →</div>
  </a>
</div>
```

- [ ] **Step 3: Update the tagline in the common namespace rendering if used**

If `HomeClient.tsx` renders `t.common.tagline` anywhere, it will now say "Grade & Build your AI" automatically via `homeEntry.tagline`. If the header uses `t.common.tagline` literal string, update the `common.tagline` value in `en.ts` from `'Grade Your AI Prompt in 30 Seconds'` to `'Grade & Build your AI'` and re-run the translation script for that single key — or simply edit each locale manually since it's one string.

Manual update in `app/i18n/locales/en.ts`:
```typescript
  common: {
    appName: 'ScoreMyPrompt',
    tagline: 'Grade & Build your AI',  // was: 'Grade Your AI Prompt in 30 Seconds'
  },
```
And in each of `ko,ja,zh-CN,zh-TW,es,fr,de,pt,hi`.ts locate the corresponding `common.tagline` and translate appropriately (or copy the English and accept a mixed tagline for Sprint 1 — acceptable, as the homeEntry version is the primary display).

- [ ] **Step 4: Add anchor id to existing prompt form**

Find the existing prompt form in `HomeClient.tsx` and add `id="score-form"` to its wrapping `<section>` or `<form>` element so the 3-card anchor link works.

- [ ] **Step 5: Typecheck + smoke test**

Run:
```bash
npm run typecheck
npm run dev
# Visit http://localhost:3000
```
Expected: home page shows 3 cards below the hero; clicking the middle card navigates to `/harness`; clicking the first card scrolls to the form; clicking the third goes to `/pricing`.

- [ ] **Step 6: Commit**

```bash
git add app/HomeClient.tsx app/i18n/locales/
git commit -m "feat(home): add 3-card entry (Score/Score-Setup/Build) + tagline refresh"
```

---

## Task 14: Prompt Result → Harness CTA Link

**Files:**
- Modify: `app/result/page.tsx` (or, if the result rendering is split into a client component imported by `page.tsx`, modify that client component)

- [ ] **Step 1: Read the current result page**

Run: `head -40 app/result/page.tsx && ls app/result/components/`
Determine whether `page.tsx` is a client component (`'use client'` at top) that can directly render the CTA, or if it imports a sub-component (likely under `app/result/components/`) that owns the post-score UI. Edit the file that contains the bottom of the score breakdown — just above share buttons or immediately before the footer.

- [ ] **Step 2: Import the translation hook (if not already present)**

If the target file doesn't already use `useTranslation`, add:
```typescript
import { useTranslation } from '@/app/i18n';
// Inside the component:
const t = useTranslation();
```

If the file is a server component that can't use hooks, either (a) lift the CTA into an existing client subcomponent, or (b) render a static English CTA and accept that language-specific copy for this single CTA is English-only until a follow-up — but prefer (a).

- [ ] **Step 3: Insert an inline CTA linking to `/harness`**

Add this block in the target client component, positioned after the score breakdown and before the share/footer row:

```tsx
{/* Cross-sell to Harness Score (Sprint 1) */}
<div className="mt-8 rounded-xl border border-primary/40 bg-primary/5 p-5 text-center">
  <div className="text-sm text-gray-300">
    {t.harness.promptCta}
  </div>
  <a
    href="/harness"
    className="inline-block mt-3 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white"
  >
    {t.harness.pageTitle}
  </a>
</div>
```

- [ ] **Step 4: Typecheck + smoke test**

Run:
```bash
npm run typecheck
npm run dev
# Submit a prompt on / and land on /result/... — confirm CTA card appears.
```
Expected: PASS. Card renders, link navigates to `/harness`.

- [ ] **Step 5: Commit**

```bash
git add app/result/
git commit -m "feat(result): cross-sell Harness Score from prompt result page"
```

---

## Task 15: Observability — PostHog Events + Sentry Tag

**Files:**
- Modify: `app/lib/analytics.ts` (existing file — typed wrapper functions `trackAnalysis`, `trackShare` already present)
- Modify: `app/harness/HarnessClient.tsx`
- Modify: `app/harness/result/[id]/HarnessResultClient.tsx`
- Modify: `app/api/harness/analyze/route.ts`

- [ ] **Step 1: Add three new wrapper functions to `analytics.ts`**

Open `app/lib/analytics.ts`. The file uses typed wrappers that call `window.posthog?.capture('<event_name>', { ... })`. Follow the same shape exactly. Append these at the end of the file (after `trackShare`):

```typescript
interface HarnessAnalyzedEvent {
  lang: string;
  total?: number;
  tier?: string;
}

export function trackHarnessAnalyzed({ lang, total, tier }: HarnessAnalyzedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { lang, total, tier, timestamp: new Date().toISOString() };
  window.posthog?.capture('harness_analyzed', event);
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('[Analytics] harness_analyzed', event);
  }
}

interface HarnessShareEvent {
  tier: string;
  total: number;
  method: string; // 'native' | 'clipboard'
}

export function trackHarnessShared({ tier, total, method }: HarnessShareEvent): void {
  if (typeof window === 'undefined') return;
  const event = { tier, total, method, timestamp: new Date().toISOString() };
  window.posthog?.capture('harness_shared', event);
  if (window.location.hostname === 'localhost') {
    console.log('[Analytics] harness_shared', event);
  }
}

interface HarnessUpsellEvent {
  tier: string;
  total: number;
  from: 'result_page' | 'home_card';
}

export function trackHarnessUpsellClicked({ tier, total, from }: HarnessUpsellEvent): void {
  if (typeof window === 'undefined') return;
  const event = { tier, total, from, timestamp: new Date().toISOString() };
  window.posthog?.capture('harness_upsell_clicked', event);
  if (window.location.hostname === 'localhost') {
    console.log('[Analytics] harness_upsell_clicked', event);
  }
}
```

- [ ] **Step 2: Fire `harness_analyzed` on submit success (client)**

In `app/harness/HarnessClient.tsx`:

```typescript
// At top of file (with existing imports):
import { trackHarnessAnalyzed } from '@/app/lib/analytics';

// Inside handleSubmit, after `const data = (await res.json()) as { shareId: string };`
// and BEFORE the router.push call, expand the response type and track:
const data = (await res.json()) as { shareId: string; total: number; tier: string };
trackHarnessAnalyzed({
  lang: typeof navigator !== 'undefined' ? navigator.language : 'en',
  total: data.total,
  tier: data.tier,
});
router.push(`/harness/result/${data.shareId}`);
```

- [ ] **Step 3: Fire `harness_shared` + `harness_upsell_clicked` on result page**

In `app/harness/result/[id]/HarnessResultClient.tsx`:

```typescript
// At top of file (with existing imports):
import { trackHarnessShared, trackHarnessUpsellClicked } from '@/app/lib/analytics';

// Update the share button onClick:
onClick={() => {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const method = typeof navigator !== 'undefined' && navigator.share ? 'native' : 'clipboard';
  trackHarnessShared({ tier: result.tier, total: result.total, method });
  if (navigator.share) {
    navigator.share({ title: `HARNES Score: ${result.total}/100`, url }).catch(() => void 0);
  } else {
    navigator.clipboard?.writeText(url);
  }
}}
```

And wrap the "Build a better setup with Pro →" Link:

```typescript
<Link
  href="/pricing"
  onClick={() => trackHarnessUpsellClicked({ tier: result.tier, total: result.total, from: 'result_page' })}
  className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent py-3 text-center font-semibold text-white"
>
  {t.harness.result.buildCta}
</Link>
```

- [ ] **Step 4: Sentry — tag harness failures server-side**

In `app/api/harness/analyze/route.ts`, inside the outer `catch (err)` block, before calling `errorResponse`, add a Sentry scope:

```typescript
// At top of file:
import * as Sentry from '@sentry/nextjs';

// In the outer catch:
Sentry.withScope((scope) => {
  scope.setTag('route', 'harness_analyze');
  scope.setTag('lang', parsed?.lang ?? 'unknown');
  Sentry.captureException(err);
});
```

(If `parsed` is not in scope because the error happened before parse, simply omit the `lang` tag — guard with `typeof parsed !== 'undefined'`.)

- [ ] **Step 5: Typecheck + manual verify**

Run:
```bash
npm run typecheck
npm run test -- harness-analyze
```
Expected: PASS. Manually submit `/harness`, inspect Network → PostHog `/capture` request fires with `harness_analyzed`.

- [ ] **Step 6: Commit**

```bash
git add app/lib/analytics.ts app/harness/ app/api/harness/
git commit -m "feat(harness): add PostHog events + Sentry tags for observability"
```

---

## Sprint 1 Gate — QA Checklist

Before merging the sprint branch, run:

- [ ] **Unit tests:** `npm run test`. All pass, including `harness-analyze.test.ts`.
- [ ] **Typecheck:** `npm run typecheck`. Clean.
- [ ] **Lint:** `npm run lint`. Clean.
- [ ] **Build:** `npm run build`. No errors.
- [ ] **Manual scoring check (mock mode):**
  - Submit a 20-character minimal setup → expect Developing or NeedsHarness tier.
  - Submit a 5000-character rich CLAUDE.md → expect Proficient or Elite tier.
  - Confirm all 6 dimensions render on result page.
- [ ] **Manual flag check:** set `NEXT_PUBLIC_FEATURES=` (empty) in `.env.local`, restart dev server, visit `/harness` → expect 404. Re-enable flag → expect 200.
- [ ] **i18n check:** switch language to `ko` via locale selector, reload `/harness` → all labels in Korean.
- [ ] **Mobile check:** resize to 375×812 → home 3 cards stack vertically, `/harness` textarea fits, FooterSticky ad visible (mock/placeholder if no AdSense in dev).
- [ ] **50-sample bias audit:** run the production API key against 50 diverse `CLAUDE.md` samples; record mean/median per dimension. Flag if any dimension has <5 or >95 percentile stuck at a single value (indicates prompt bias).

---

## Rollback Plan

Any step can be reverted independently via git. Full kill switch:

```bash
# In Vercel dashboard or .env.production:
NEXT_PUBLIC_FEATURES="ADS,DASHBOARD,TEMPLATES,NEWSLETTER,..." # omit HARNESS_SCORE
# Redeploy. /harness returns 404, home entry card to /harness 404s on click.
```

No DB rollback needed — `harness_scores` table is additive and unreachable when flag off.

---

**End of Sprint 1 Plan.** Sprint 2 (Harness Builder) and Sprint 3 (Pricing & Global) will be written as separate plan files once Sprint 1 ships.
