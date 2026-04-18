import { getSupabaseAdmin } from '@/app/lib/supabase';
import { cacheHeaders } from '@/app/lib/cache';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 *
 * Returns aggregated platform stats for admin monitoring.
 * Protected by ADMIN_SECRET env variable.
 *
 * Headers:
 *   Authorization: Bearer <ADMIN_SECRET>
 *
 * Response:
 *   { success, data: { analyses, users, revenue, performance } }
 */
export async function GET(request: Request) {
  const rl = rateLimit(request, LIMITS.ADMIN);
  if (!rl.ok) return rl.response;

  // Auth check
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return Response.json(
      { error: 'Admin endpoint not configured', code: 'NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  const { safeCompare } = await import('@/app/lib/safe-compare');
  if (!token || !safeCompare(token, adminSecret)) {
    return Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json(
      { error: 'Database unavailable', code: 'SERVICE_UNAVAILABLE' },
      { status: 503 }
    );
  }

  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Run queries in parallel
    const [
      totalAnalyses,
      todayAnalyses,
      weekAnalyses,
      totalUsers,
      activeUsersWeek,
      waitlistCount,
      avgScore,
      gradeDistribution,
    ] = await Promise.all([
      // Total analyses
      supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true }),

      // Today's analyses
      supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${todayStr}T00:00:00Z`),

      // This week's analyses
      supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo),

      // Total users
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),

      // Active users this week
      supabase
        .from('analyses')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', weekAgo)
        .not('user_id', 'is', null),

      // Waitlist count
      supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true }),

      // Average score (last 30 days)
      supabase
        .from('analyses')
        .select('overall_score')
        .gte('created_at', monthAgo)
        .not('overall_score', 'is', null)
        .limit(1000),

      // Grade distribution (last 30 days)
      supabase
        .from('analyses')
        .select('grade')
        .gte('created_at', monthAgo)
        .not('grade', 'is', null)
        .limit(5000),
    ]);

    // Calculate average score
    const scores = avgScore.data?.map((r) => r.overall_score).filter(Boolean) || [];
    const avgScoreValue = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;

    // Calculate grade distribution
    const grades: Record<string, number> = {};
    gradeDistribution.data?.forEach((r) => {
      if (r.grade) {
        grades[r.grade] = (grades[r.grade] || 0) + 1;
      }
    });

    const stats = {
      analyses: {
        total: totalAnalyses.count || 0,
        today: todayAnalyses.count || 0,
        thisWeek: weekAnalyses.count || 0,
        avgScore: avgScoreValue,
        gradeDistribution: grades,
      },
      users: {
        total: totalUsers.count || 0,
        activeThisWeek: activeUsersWeek.count || 0,
        waitlist: waitlistCount.count || 0,
      },
      system: {
        timestamp: now.toISOString(),
        uptime: process.uptime(),
        memoryUsage: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
      },
    };

    logger.info('Admin stats fetched', { analysesTotal: stats.analyses.total });

    return Response.json(
      { success: true, data: stats },
      { headers: cacheHeaders.none() }
    );
  } catch (err) {
    logger.error('Admin stats error', { error: String(err) });
    return Response.json(
      { error: 'Failed to fetch stats', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
