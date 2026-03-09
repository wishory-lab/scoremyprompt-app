himport { z } from 'zod';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { PROMPT_SCORE_SYSTEM } from '@/app/constants/system-prompt';
import { JOB_ROLE_LABELS, ROLE_BENCHMARKS } from '@/app/constants';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { sanitizeInput, containsScriptPattern } from '@/app/lib/sanitize';
import type { AnalysisResult, Grade } from '@/app/types';

// ─── Request validation ───
const AnalyzeRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 charhacters long').max(5000, 'Prompt must be under 5,000 characters'),
  jobRole: z.enum(['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other']),
});

// ─── Rate limiting ───
// In-memory fallback for dev (not shared across Vercel instances)
const rateLimitMap = new Map<string, { windowStart: number; count: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const DAILY_LIMIT = 20; // Supabase-based daily limit per IP

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number; // Unix timestamp (seconds) when window/day resets
}

function checkMemoryRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, limit: RATE_LIMIT_MAX, resetAt: Math.ceil((now + RATE_LIMIT_WINDOW) / 1000) };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const resetAt = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW) / 1000);
    return { allowed: false, remaining: 0, limit: RATE_LIMIT_MAX, resetAt };
  }

  entry.count++;
  const resetAt = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW) / 1000);
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, limit: RATE_LIMIT_MAX, resetAt };
}

async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return checkMemoryRateLimit(ip);

  try {
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', `${today}T00:00:00Z`);

    if (error) {
      logger.warn('Rate limit query error, falling back to memory', { error: error.message });
      return checkMemoryRateLimit(ip);
    }

    const used = count || 0;
    // Reset at midnight UTC
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const resetAt = Math.ceil(tomorrow.getTime() / 1000);

    return { allowed: used < DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used), limit: DAILY_LIMIT, resetAt };
  } catch {
    return checkMemoryRateLimit(ip);
  }
}

/** Attach rate-limit info headers to a Response */
function withRateLimitHeaders(response: Response, rl: RateLimitResult): Response {
  response.headers.set('X-RateLimit-Limit', String(rl.limit));
  response.headers.set('X-RateLimit-Remaining', String(rl.remaining));
  response.headers.set('X-RateLimit-Reset', String(rl.resetAt));
  return response;
}

// ─── Generate short share ID ───
function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

// ─── Hash IP for storage ───
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// ─── Save analysis to Supabase (non-blocking) ───
async function saveToDatabase(params: {
  prompt: string;
  jobRole: string;
  result: AnalysisResult;
  ip: string;
  usage: { inputTokens: number; outputTokens: number };
  userId?: string;
}): Promise<{ id: string; shareId: string } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const shareId = generateShareId();

  const promptPreview = params.prompt.substring(0, 80) + (params.prompt.length > 80 ? '...' : '');

  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        prompt_preview: promptPreview,
        job_role: params.jobRole,
        overall_score: params.result.overallScore,
        grade: params.result.grade,
        dim_precision: params.result.dimensions?.precision?.score || 0,
        dim_role: params.result.dimensions?.role?.score || 0,
        dim_output_format: params.result.dimensions?.outputFormat?.score || 0,
        dim_mission_context: params.result.dimensions?.missionContext?.score || 0,
        dim_prompt_structure: params.result.dimensions?.promptStructure?.score || 0,
        dim_tailoring: params.result.dimensions?.tailoring?.score || 0,
        result_json: params.result,
        rewrite_suggestion: params.result.rewriteSuggestion || null,
        ip_hash: hashIp(params.ip),
        share_id: shareId,
        input_tokens: params.usage.inputTokens,
        output_tokens: params.usage.outputTokens,
        ...(params.userId && { user_id: params.userId }),
      })
      .select('id, share_id')
      .single();

    if (error) {
      logger.error('DB save error', { error: error.message });
      return null;
    }

    return { id: data.id, shareId: data.share_id };
  } catch (err) {
    logger.error('DB save failed', { error: String(err) });
    return null;
  }
}

function getScoreLevel(grade: Grade): string {
  const levels: Record<Grade, string> = { S: 'Masterful', A: 'Excellent', B: 'Great', C: 'Fair', D: 'Needs Work' };
  return levels[grade] || 'Great';
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();

    // ─── Zod Validation ───
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      throw new AppError(firstError.message, 'VALIDATION_ERROR', 400);
    }

    const prompt = sanitizeInput(parsed.data.prompt);
    const jobRole = parsed.data.jobRole;

    // ─── Script injection check ───
    if (containsScriptPattern(prompt)) {
      throw new AppError('Input contains disallowed patterns.', 'VALIDATION_ERROR', 400);
    }

    // ─── Extract authenticated user (optional) ───
    let userId: string | undefined;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.substring(7));
        if (user) userId = user.id;
      }
    }

    // ─── Rate Limiting ───
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const errResp = Response.json(
        { error: 'Too many requests. Please wait a moment and try again.', code: 'RATE_LIMIT', retryAfter: rateLimit.resetAt - Math.ceil(Date.now() / 1000) },
        { status: 429 },
      );
      return withRateLimitHeaders(errResp, rateLimit);
    }

    // ─── Claude API Call ───
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      logger.warn('ANTHROPIC_API_KEY not set — using mock response');
      return Response.json(getMockResult(jobRole), { status: 200 });
    }

    const roleLabel = JOB_ROLE_LABELS[jobRole] || 'General';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let apiResponse: Response;
    try {
      apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: PROMPT_SCORE_SYSTEM,
          messages: [
            {
              role: 'user',
              content: `Analyze this prompt from a ${roleLabel} professional. Apply the ${jobRole} weight adjustments.\n\n---\n${prompt.trim()}\n---`,
            },
          ],
        }),
      });
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logger.warn('Claude API timeout — falling back to mock');
        return Response.json(getMockResult(jobRole), { status: 200 });
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }

    if (!apiResponse.ok) {
      const errorStatus = apiResponse.status;
      const errorBody = await apiResponse.text();
      logger.error('Claude API error', { status: errorStatus, body: errorBody.substring(0, 500) });
      if (errorStatus === 429) {
        throw new AppError('Service is busy. Please try again in a moment.', 'API_RATE_LIMIT', 429);
      }
      if (errorStatus === 401 || (errorStatus === 400 && errorBody.includes('credit balance'))) {
        logger.error('API key invalid or credits depleted — falling back to mock');
        return Response.json(getMockResult(jobRole), { status: 200 });
      }
      throw new AppError(`Claude API returned ${errorStatus}`, 'API_ERROR', 502);
    }

    const message = await apiResponse.json();

    // Parse the JSON response
    const responseText = message.content[0].text;
    let result: AnalysisResult;

    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(jsonStr);
    } catch {
      logger.error('Failed to parse Claude response', { response: responseText.substring(0, 200) });
      throw new AppError('Failed to parse analysis result. Please try again.', 'PARSE_ERROR', 500);
    }

    // ─── Enrich with metadata ───
    const benchmarks = ROLE_BENCHMARKS[jobRole] || ROLE_BENCHMARKS.Other;
    const percentile = Math.min(99, Math.max(1, Math.round((result.overallScore / benchmarks.excellent) * 80)));

    const usage = {
      inputTokens: message.usage?.input_tokens || 0,
      outputTokens: message.usage?.output_tokens || 0,
    };

    const dbRecord = await saveToDatabase({ prompt: prompt.trim(), jobRole, result, ip, usage, userId });

    const enrichedResult = {
      ...result,
      jobRole,
      scoreLevel: getScoreLevel(result.grade),
      benchmarks: { average: benchmarks.average, excellent: benchmarks.excellent, percentile },
      usage,
      ...(dbRecord && { analysisId: dbRecord.id, shareId: dbRecord.shareId }),
    };

    const durationMs = Date.now() - startTime;
    logger.info('Analysis completed', {
      durationMs,
      jobRole,
      score: result.overallScore,
      grade: result.grade,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    return withRateLimitHeaders(Response.json(enrichedResult, { status: 200 }), rateLimit);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    if (error instanceof AppError) {
      logger.warn('Analysis failed', { durationMs, errorCode: error.code, status: error.status });
      return errorResponse(error);
    }
    logger.error('Analysis error', { error: String(error), durationMs });
    return errorResponse(error as Error);
  }
}

// ─── Mock result for development ───
function getMockResult(jobRole: string) {
  const benchmarks = ROLE_BENCHMARKS[jobRole] || ROLE_BENCHMARKS.Other;
  return {
    overallScore: 72,
    grade: 'B',
    dimensions: {
      precision: { score: 15, maxScore: 20, feedback: 'Clear objectives but could be more specific about constraints and success criteria.' },
      role: { score: 8, maxScore: 15, feedback: 'No explicit role assignment. Consider specifying the AI persona or expertise level.' },
      outputFormat: { score: 10, maxScore: 15, feedback: 'Some format hints present but missing specific structure requirements.' },
      missionContext: { score: 16, maxScore: 20, feedback: 'Good background context with clear goals. Could add more constraints.' },
      promptStructure: { score: 12, maxScore: 15, feedback: 'Well-organized with logical flow between sections.' },
      tailoring: { score: 11, maxScore: 15, feedback: 'Reasonably tailored to the domain but could use more specific terminology.' },
    },
    strengths: [
      'Clear primary objective with defined scope',
      'Good contextual background information',
      'Logical structure and readable flow',
    ],
    improvements: [
      'Add an explicit AI role or persona (e.g., "You are a senior marketing strategist...")',
      'Specify exact output format, length, and structure requirements',
      'Include measurable success criteria or acceptance standards',
    ],
    rewriteSuggestion:
      'You are an experienced marketing strategist. Create a comprehensive Q1 campaign plan for our SaaS product targeting SMBs (10-50 employees). Include: executive summary, target audience analysis, 3 channel strategies with KPIs, budget allocation, and a 90-day timeline. Format as a structured document with headers and bullet points.',
    jobRole,
    scoreLevel: 'Great',
    benchmarks: { average: benchmarks.average, excellent: benchmarks.excellent, percentile: 68 },
    usage: { inputTokens: 0, outputTokens: 0 },
  };
}
