// app/api/harness/analyze/route.ts
import { z } from 'zod';
import crypto from 'crypto';
import * as Sentry from '@sentry/nextjs';
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
    let analysisId: string = crypto.randomUUID();
    if (!supa) {
      logger.warn('Supabase not configured — share link will not resolve', { shareId });
    }
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
    Sentry.withScope((scope) => {
      scope.setTag('route', 'harness_analyze');
      if (typeof parsed !== 'undefined') scope.setTag('lang', parsed.lang);
      Sentry.captureException(err);
    });
    if (err instanceof AppError) return errorResponse(err);
    logger.error('Unhandled harness analyze error', { error: String(err) });
    return errorResponse(err as Error);
  }
}
