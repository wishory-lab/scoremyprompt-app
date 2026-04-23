import { z } from 'zod';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { PROMPT_SCORE_SYSTEM } from '@/app/constants/system-prompt';
import { JOB_ROLE_LABELS, ROLE_BENCHMARKS, TIER_LIMITS } from '@/app/constants';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { sanitizeInput, containsScriptPattern } from '@/app/lib/sanitize';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import { checkGate, consumeCredit, hashIP } from '@/app/lib/gate';
import type { AnalysisResult, Grade, Tier } from '@/app/types';

// ─── Request validation ───
const AnalyzeRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long').max(5000, 'Prompt must be under 5,000 characters'),
  jobRole: z.enum(['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other']),
  locale: z.string().optional(),
});

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
    const locale = parsed.data.locale || 'en';

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

    // ─── Burst Rate Limiting (Redis/memory-backed) ───
    const rl = await rateLimit(request, LIMITS.ANALYZE);
    if (!rl.ok) return rl.response;

    // ─── Credit-based Gate Check ───
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const supabaseForGate = getSupabaseAdmin();
    let userTier: Tier = 'guest';

    if (userId && supabaseForGate) {
      const { data: profile } = await supabaseForGate
        .from('user_profiles')
        .select('tier')
        .eq('id', userId)
        .single();
      userTier = (profile?.tier as Tier) || 'free';
      // Handle legacy 'pro' tier
      if (userTier === ('pro' as Tier)) userTier = 'premium';
    }

    const ipHash = hashIP(ip);
    const gateResult = await checkGate(supabaseForGate, userId || null, userTier, { ipHash });

    if (!gateResult.allowed) {
      return Response.json(
        {
          error: gateResult.message,
          code: gateResult.showAdPrompt ? 'AD_PROMPT' : 'DAILY_LIMIT',
          showAdPrompt: gateResult.showAdPrompt || false,
          remaining: 0,
          limit: gateResult.limit,
        },
        { status: 429 },
      );
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
          max_tokens: 2048,
          system: PROMPT_SCORE_SYSTEM + (locale !== 'en' ? `\n\nIMPORTANT: Write ALL feedback text, strengths, improvements, and rewriteSuggestion in ${locale === 'ko' ? 'Korean (한국어)' : locale}. Keep JSON keys and grade letters in English.` : ''),
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
        throw new AppError('서비스가 바쁩니다. 잠시 후 다시 시도해주세요.', 'API_RATE_LIMIT', 429);
      }
      if (errorStatus === 401 || (errorStatus === 400 && errorBody.includes('credit balance'))) {
        logger.error('API key invalid or credits depleted — falling back to mock');
        return Response.json(getMockResult(jobRole), { status: 200 });
      }
      throw new AppError(`Claude API returned ${errorStatus}`, 'API_ERROR', 502);
    }

    const message = await apiResponse.json();

    // Check for truncated response
    if (message.stop_reason === 'max_tokens') {
      logger.warn('Claude response truncated (max_tokens reached), falling back to mock');
      return Response.json(getMockResult(jobRole), { status: 200 });
    }

    // Parse the JSON response
    const responseText = message.content?.[0]?.text || '';
    let result: AnalysisResult;

    try {
      const jsonStr = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(jsonStr);
    } catch {
      logger.error('Failed to parse Claude response', {
        response: responseText.substring(0, 300),
        stopReason: message.stop_reason,
        usage: message.usage,
      });
      // Fallback to mock instead of hard error for better UX
      logger.warn('Falling back to mock result after parse failure');
      return Response.json(getMockResult(jobRole), { status: 200 });
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

    // ─── Consume credit after successful analysis ───
    if (userId && supabaseForGate) {
      await consumeCredit(supabaseForGate, userId, userTier);
    }

    return Response.json(enrichedResult, {
      status: 200,
      headers: {
        'X-Credits-Remaining': String(gateResult.remaining - 1),
        'X-Credits-Limit': String(gateResult.limit),
      },
    });
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
      precision: { score: 15, maxScore: 20, feedback: '목표는 명확하지만, 제약 조건과 성공 기준을 더 구체적으로 명시하면 좋겠습니다.' },
      role: { score: 8, maxScore: 15, feedback: 'AI에게 역할이 지정되지 않았습니다. 전문 페르소나나 역할을 추가해보세요.' },
      outputFormat: { score: 10, maxScore: 15, feedback: '형식에 대한 힌트는 있지만, 구체적인 구조 요구사항이 부족합니다.' },
      missionContext: { score: 16, maxScore: 20, feedback: '배경 컨텍스트와 목표가 잘 설정되어 있습니다. 제약 조건을 더 추가하면 좋겠습니다.' },
      promptStructure: { score: 12, maxScore: 15, feedback: '논리적 흐름으로 잘 구성되어 있습니다.' },
      tailoring: { score: 11, maxScore: 15, feedback: '도메인에 맞게 어느 정도 맞춤화되었지만, 더 구체적인 전문 용어를 활용하면 좋겠습니다.' },
    },
    strengths: [
      '명확한 주요 목표와 범위 설정',
      '충분한 배경 정보 제공',
      '논리적인 구조와 읽기 쉬운 흐름',
    ],
    improvements: [
      'AI에게 명시적 역할을 부여하세요 (예: "당신은 시니어 마케팅 전략가입니다...")',
      '출력 형식, 길이, 구조 요구사항을 구체적으로 지정하세요',
      '측정 가능한 성공 기준이나 품질 기준을 포함하세요',
    ],
    rewriteSuggestion:
      '당신은 10년 경력의 시니어 마케팅 전략가입니다. 중소기업(10~50명 규모)을 타겟으로 하는 SaaS 제품의 Q1 종합 캠페인 계획을 수립해주세요. 포함 내용: 요약, 타겟 분석, 3가지 채널 전략(KPI 포함), 예산 배분, 90일 타임라인. 헤더와 불릿 포인트로 구조화된 문서로 작성하세요.',
    jobRole,
    scoreLevel: '양호',
    benchmarks: { average: benchmarks.average, excellent: benchmarks.excellent, percentile: 68 },
    usage: { inputTokens: 0, outputTokens: 0 },
  };
}
