/**
 * Runs 50 diverse CLAUDE.md samples through /api/harness/analyze and prints
 * mean/median per HARNES dimension. Flags any dimension whose p5 or p95 is
 * stuck at a single value — a signal of prompt bias.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 ANTHROPIC_API_KEY=sk-... npx tsx scripts/harness-bias-audit.ts
 *
 * The server must have a real ANTHROPIC_API_KEY configured, otherwise the
 * route returns the same mock response for every input and the audit is
 * meaningless.
 */

const DIMS = ['H', 'A', 'R', 'N', 'E', 'S'] as const;
type Dim = (typeof DIMS)[number];

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

interface ScoredSample {
  name: string;
  scores: Record<Dim, number>;
  total: number;
  tier: string;
}

const BARE_PROMPTS = [
  'You are a helpful assistant. Write marketing copy.',
  'Generate blog posts about AI.',
  'Summarize meeting notes. Make it short.',
  'Write a product description for a SaaS tool.',
  'Create an Instagram caption for a coffee shop.',
  'Draft an email to a client about delayed shipping.',
  'Write a LinkedIn post about a new product feature.',
  'Give me three ideas for content marketing.',
  'Edit my resume to make it stronger.',
  'Write a cold outreach email to a potential partner.',
];

const SAMPLES: { name: string; input: string }[] = [
  // 10 bare/minimal prompts (expected: low scores)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `bare-${i + 1}`,
    input: BARE_PROMPTS[i]!,
  })),

  // 20 moderate CLAUDE.md samples
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `moderate-${i + 1}`,
    input: `# Project ${i + 1} Harness

## Project Overview
Newsletter automation for topic ${i + 1}, weekly cadence.

## Folder Map
- /context: brand guidelines, business context
- /agents: research, content, review
- /templates: newsletter, report

## Routing Rules
1. If research returns fewer than 3 sources, loop before content_agent.
2. If content fails review, retry once then alert.

## Work Rules
- Always match brand voice from /context/brand_guidelines.md.
- Semi-auto mode for publishing.
- MCP: web_search connected.

## Sub-agents:
- research_agent.md: gathers sources via web_search.
- content_agent.md: writes drafts.
- review_agent.md: fact-check + brand-check.
`,
  })),

  // 20 rich/Elite-level CLAUDE.md samples
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `elite-${i + 1}`,
    input: `# Production Harness ${i + 1}

## Project Overview
Full-stack content automation with 4 sub-agents, 3 MCPs, documented SOPs, and a failure-retry loop.

## Folder Map
- /context: brand_guidelines.md (with 3 tone examples), business_context.md
- /agents: research_agent, content_agent, design_agent, review_agent — each with role, tools, output, success criteria
- /templates: newsletter, report, card_news, social_post
- /data: competitors.csv, audience.csv

## Routing Rules
1. If goal is research, call research_agent first; if < 5 sources, retry once before content_agent.
2. If draft exceeds brand tone thresholds in /context/brand_guidelines.md, return to content_agent for rewrite.
3. If review_agent flags factual error, loop to research_agent.

## Work Rules
- Full-auto for research + content; semi-auto for publishing.
- All outputs must reference source URLs.
- Failure retry: on LLM error, retry once then alert via Resend.

## Extensions (MCPs)
- web_search (Brave API)
- google_sheets (campaign tracking)
- buffer (scheduled publishing)
- posthog (open-rate feedback)

## SafeOps
- Permissions: bypass_approval for research/content, require_approval for publishing.
- Failure loop: on any step failure, retry once with exponential backoff, then escalate.
- SOP: every Monday 09:00 KST, run weekly_research pipeline.
`,
  })),
];

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx]!;
}

// Server rate limit is 5 requests / 60 seconds (LIMITS.ANALYZE).
// At 5 req/min the theoretical minimum interval is 12s. We use 13s for safety.
const REQUEST_INTERVAL_MS = 13_000;
const MAX_RETRIES_ON_429 = 3;

async function score(name: string, input: string): Promise<ScoredSample | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES_ON_429; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/api/harness/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, lang: 'en' }),
      });
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After') ?? '60');
        const waitMs = (retryAfter + 2) * 1000;
        console.warn(`[${name}] 429 — waiting ${waitMs / 1000}s before retry ${attempt + 1}/${MAX_RETRIES_ON_429}`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      if (!res.ok) {
        console.error(`[${name}] HTTP ${res.status}`);
        return null;
      }
      const data = (await res.json()) as { scores: Record<Dim, number>; total: number; tier: string };
      return { name, scores: data.scores, total: data.total, tier: data.tier };
    } catch (err) {
      console.error(`[${name}] error`, err);
      return null;
    }
  }
  console.error(`[${name}] gave up after ${MAX_RETRIES_ON_429} 429 retries`);
  return null;
}

async function main() {
  const results: ScoredSample[] = [];
  console.log(`Scoring ${SAMPLES.length} samples with ${REQUEST_INTERVAL_MS / 1000}s interval — estimated total: ${((SAMPLES.length * REQUEST_INTERVAL_MS) / 60_000).toFixed(0)} minutes.`);
  for (let i = 0; i < SAMPLES.length; i++) {
    const s = SAMPLES[i]!;
    console.log(`[${i + 1}/${SAMPLES.length}] scoring ${s.name}...`);
    const r = await score(s.name, s.input);
    if (r) results.push(r);
    // Wait before the next request to respect the 5 req/60s rate limit.
    if (i < SAMPLES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, REQUEST_INTERVAL_MS));
    }
  }

  console.log(`\n=== Harness Bias Audit (${results.length}/${SAMPLES.length} succeeded) ===\n`);

  for (const dim of DIMS) {
    const values = results.map((r) => r.scores[dim]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const med = median(values);
    const p5 = percentile(values, 5);
    const p95 = percentile(values, 95);
    const warn = p5 === p95 ? '  ⚠️  BIAS: p5 == p95 — dimension stuck' : '';
    console.log(`${dim}: mean=${mean.toFixed(1)}  median=${med}  p5=${p5}  p95=${p95}${warn}`);
  }

  const totals = results.map((r) => r.total);
  const totalMean = totals.reduce((a, b) => a + b, 0) / totals.length;
  const totalMed = median(totals);
  console.log(`\nTotal: mean=${totalMean.toFixed(1)}  median=${totalMed}`);

  const tierCounts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.tier] = (acc[r.tier] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Tier distribution:`, tierCounts);

  // Write CSV for Sheets import.
  const rows = ['name,tier,total,H,A,R,N,E,S'];
  for (const r of results) {
    rows.push(
      `${r.name},${r.tier},${r.total},${r.scores.H},${r.scores.A},${r.scores.R},${r.scores.N},${r.scores.E},${r.scores.S}`,
    );
  }
  const fs = await import('node:fs');
  fs.writeFileSync('harness-bias-audit.csv', rows.join('\n'), 'utf8');
  console.log(`\nWrote harness-bias-audit.csv (${results.length} rows)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
