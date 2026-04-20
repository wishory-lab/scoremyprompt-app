import { z } from 'zod';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';
import { unauthorizedResponse } from '@/app/lib/errors';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import type { Grade } from '@/app/types';

const HistoryQuerySchema = z.object({
  role: z.string().max(50).default('All'),
  grade: z.string().max(5).default('All'),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

interface HistoryDimensionScore {
  score: number;
  feedback: string;
}

interface HistoryAnalysis {
  id: string;
  date: string;
  promptPreview: string;
  score: number;
  grade: Grade;
  jobRole: string;
  dimensions: Record<string, HistoryDimensionScore>;
}

interface HistoryResponse {
  analyses: HistoryAnalysis[];
  total: number;
  hasMore: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

function getSortConfig(sort: SortOption): { column: string; ascending: boolean } {
  switch (sort) {
    case 'newest': return { column: 'created_at', ascending: false };
    case 'oldest': return { column: 'created_at', ascending: true };
    case 'highest': return { column: 'overall_score', ascending: false };
    case 'lowest': return { column: 'overall_score', ascending: true };
    default: return { column: 'created_at', ascending: false };
  }
}

function extractDimensions(resultJson: Record<string, unknown> | null): Record<string, HistoryDimensionScore> {
  if (!resultJson) return {};

  const dims = resultJson.dimensions as Record<string, { score?: number; feedback?: string }> | undefined;
  if (!dims) return {};

  const result: Record<string, HistoryDimensionScore> = {};
  const keyMap: Record<string, string> = {
    precision: 'precision',
    role: 'role',
    outputFormat: 'outputFormat',
    missionContext: 'missionContext',
    promptStructure: 'promptStructure',
    tailoring: 'tailoring',
  };

  for (const [key, mappedKey] of Object.entries(keyMap)) {
    const dim = dims[key];
    if (dim) {
      result[mappedKey] = {
        score: dim.score || 0,
        feedback: dim.feedback || '',
      };
    }
  }

  return result;
}

export async function GET(request: Request) {
  const rl = await rateLimit(request, LIMITS.READ);
  if (!rl.ok) return rl.response;

  try {
    // ─── Auth ───
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorizedResponse();
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json({ analyses: [], total: 0, hasMore: false }, { status: 200 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.substring(7));
    if (authError || !user) {
      return unauthorizedResponse();
    }

    const userId = user.id;

    // ─── Parse & validate query params ───
    const url = new URL(request.url);
    const queryParams = HistoryQuerySchema.parse({
      role: url.searchParams.get('role') ?? undefined,
      grade: url.searchParams.get('grade') ?? undefined,
      sort: url.searchParams.get('sort') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    });
    const { role, grade, sort, page, limit } = queryParams;

    const offset = (page - 1) * limit;
    const { column, ascending } = getSortConfig(sort);

    // ─── Count query ───
    let countQuery = supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (role !== 'All') countQuery = countQuery.eq('job_role', role);
    if (grade !== 'All') countQuery = countQuery.eq('grade', grade);

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.warn('History count query error', { error: countError.message });
    }

    const total = count || 0;

    // ─── Data query ───
    let dataQuery = supabase
      .from('analyses')
      .select('id, created_at, overall_score, grade, job_role, result_json')
      .eq('user_id', userId)
      .order(column, { ascending })
      .range(offset, offset + limit - 1);

    if (role !== 'All') dataQuery = dataQuery.eq('job_role', role);
    if (grade !== 'All') dataQuery = dataQuery.eq('grade', grade);

    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      logger.error('History data query error', { error: dataError.message });
      return Response.json({ analyses: [], total: 0, hasMore: false }, { status: 200 });
    }

    const analyses: HistoryAnalysis[] = (data || []).map((row) => ({
      id: row.id,
      date: new Date(row.created_at).toISOString().split('T')[0],
      promptPreview: `${row.job_role || 'General'} prompt — scored ${row.overall_score || 0}/100`,
      score: row.overall_score || 0,
      grade: (row.grade as Grade) || 'D',
      jobRole: row.job_role || 'Other',
      dimensions: extractDimensions(row.result_json as Record<string, unknown> | null),
    }));

    const hasMore = offset + limit < total;

    const response: HistoryResponse = { analyses, total, hasMore };
    return Response.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('History error', { error: String(error) });
    return Response.json({ analyses: [], total: 0, hasMore: false }, { status: 200 });
  }
}
