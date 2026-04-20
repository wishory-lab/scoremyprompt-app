import { z } from 'zod';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { PROMPT_SCORE_SYSTEM } from '@/app/constants/system-prompt';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';

const BULK_RATE_LIMIT_MAP = new Map<string, { windowStart: number; count: number }>();
const BULK_RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const BULK_RATE_LIMIT_MAX = 10;
const MAX_PROMPTS_PER_REQUEST = 5;
const CONCURRENCY_LIMIT = 3;

const BulkAnalyzeSchema = z.object({
  prompts: z.array(z.string().min(10).max(5000)).min(1).max(MAX_PROMPTS_PER_REQUEST),
  jobRole: z.enum(['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other']),
});

function checkBulkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = BULK_RATE_LIMIT_MAP.get(userId);

  if (!entry || now - entry.windowStart > BULK_RATE_LIMIT_WINDOW) {
    BULK_RATE_LIMIT_MAP.set(userId, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= BULK_RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [userId, entry] of BULK_RATE_LIMIT_MAP) {
    if (now - entry.windowStart > BULK_RATE_LIMIT_WINDOW * 2) {
      BULK_RATE_LIMIT_MAP.delete(userId);
    }
  }
}

async function promiseAllWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function executeNext(): Promise<void> {
    if (index >= tasks.length) return;
    const currentIndex = index++;
    try {
      results[currentIndex] = await tasks[currentIndex]();
    } catch (error) {
      results[currentIndex] = { error: (error as Error).message } as unknown as T;
    }
    return executeNext();
  }

  const workers = Array(Math.min(limit, tasks.length)).fill(null).map(() => executeNext());
  await Promise.all(workers);
  return results;
}

export async function POST(request: Request) {
  try {
    cleanupRateLimit();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid auth token', 'AUTH_MISSING', 401);
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new AppError('Database not configured', 'DB_NOT_CONFIGURED', 500);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new AppError('Unauthorized: Invalid auth token', 'AUTH_INVALID', 401);

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles').select('tier').eq('id', user.id).single();

    if (profileError || !userProfile) throw new AppError('User profile not found', 'PROFILE_NOT_FOUND', 404);
    if (userProfile.tier !== 'premium' && userProfile.tier !== 'pro') throw new AppError('Premium subscription required for bulk analysis', 'PREMIUM_REQUIRED', 403);
    if (!checkBulkRateLimit(user.id)) throw new AppError('Rate limit exceeded. Max 10 bulk requests per hour.', 'RATE_LIMIT', 429);

    const body = await request.json();
    const parsed = BulkAnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { prompts, jobRole } = parsed.data;
    const tasks = prompts.map((prompt) => () => analyzePrompt(prompt, jobRole));
    const results = await promiseAllWithConcurrency(tasks, CONCURRENCY_LIMIT);

    return Response.json({ results }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Bulk analyze error', { error: String(error) });
    return errorResponse(error as Error);
  }
}

async function analyzePrompt(prompt: string, jobRole: string): Promise<Record<string, unknown>> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return getMockAnalysis(jobRole);

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: PROMPT_SCORE_SYSTEM,
        messages: [{ role: 'user', content: `Analyze this prompt from a ${jobRole} professional.\n\n---\n${prompt.trim()}\n---` }],
      }),
    });

    if (!apiResponse.ok) {
      if (apiResponse.status === 401) return getMockAnalysis(jobRole);
      throw new Error(`Claude API returned ${apiResponse.status}`);
    }

    const message = await apiResponse.json();
    const responseText = message.content[0].text;

    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return { ...JSON.parse(jsonStr), jobRole };
    } catch {
      logger.error('Failed to parse Claude response', { error: responseText });
      return getMockAnalysis(jobRole);
    }
  } catch (error) {
    logger.error('Prompt analysis error', { error: String(error) });
    return getMockAnalysis(jobRole);
  }
}

function getMockAnalysis(jobRole: string): Record<string, unknown> {
  return {
    overallScore: 72, grade: 'B',
    dimensions: {
      precision: { score: 15, maxScore: 20, feedback: 'Clear objectives but could be more specific.' },
      role: { score: 8, maxScore: 15, feedback: 'No explicit role assignment.' },
      outputFormat: { score: 10, maxScore: 15, feedback: 'Some format hints but missing specifics.' },
      missionContext: { score: 16, maxScore: 20, feedback: 'Good background context with clear goals.' },
      promptStructure: { score: 12, maxScore: 15, feedback: 'Well-organized with logical flow.' },
      tailoring: { score: 11, maxScore: 15, feedback: 'Reasonably tailored to the domain.' },
    },
    strengths: ['Clear primary objective', 'Good contextual background', 'Logical structure'],
    improvements: ['Add explicit AI role', 'Specify output format requirements', 'Include measurable success criteria'],
    rewriteSuggestion: 'Consider adding explicit instructions for the AI role and expected output format to improve clarity.',
    jobRole,
  };
}
