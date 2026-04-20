import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';
import { cacheHeaders, TTL } from '@/app/lib/cache';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
import type { LeaderboardEntry } from '@/app/types';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  display_name: 'Sarah K.',   score: 92, grade: 'S', job_role: 'Marketing',   prompt_preview: 'Create a conversion-optimized landing page for SaaS product...' },
  { rank: 2,  display_name: 'Raj P.',     score: 89, grade: 'A', job_role: 'Design',      prompt_preview: 'Design a mobile-first UI system with accessibility standards...' },
  { rank: 3,  display_name: 'Emma L.',    score: 87, grade: 'A', job_role: 'Product',     prompt_preview: 'Define product roadmap and prioritization framework for...' },
  { rank: 4,  display_name: 'Marcus T.',  score: 85, grade: 'A', job_role: 'Finance',     prompt_preview: 'Analyze quarterly revenue trends and forecast next year...' },
  { rank: 5,  display_name: 'Jessica R.', score: 83, grade: 'A', job_role: 'Marketing',   prompt_preview: 'Write email campaign for product launch targeting B2B...' },
  { rank: 6,  display_name: 'Alex M.',    score: 81, grade: 'A', job_role: 'Freelance',   prompt_preview: 'Create social media content calendar for Q1 with...' },
  { rank: 7,  display_name: 'Lisa S.',    score: 79, grade: 'B', job_role: 'Design',      prompt_preview: 'Design system documentation for component library...' },
  { rank: 8,  display_name: 'David O.',   score: 77, grade: 'B', job_role: 'Product',     prompt_preview: 'Define OKR framework for product team to measure...' },
  { rank: 9,  display_name: 'Nina K.',    score: 75, grade: 'B', job_role: 'Finance',     prompt_preview: 'Prepare detailed financial analysis of acquisition target...' },
  { rank: 10, display_name: 'Chris P.',   score: 73, grade: 'B', job_role: 'Marketing',   prompt_preview: 'Create comprehensive content marketing strategy for...' },
  { rank: 11, display_name: 'Omar M.',    score: 71, grade: 'B', job_role: 'Engineering', prompt_preview: 'Document REST API best practices for team onboarding...' },
  { rank: 12, display_name: 'Sophie V.',  score: 69, grade: 'B', job_role: 'Design',      prompt_preview: 'Create design tokens specification document for...' },
  { rank: 13, display_name: 'James W.',   score: 67, grade: 'B', job_role: 'Marketing',   prompt_preview: 'Develop product positioning statement for enterprise...' },
  { rank: 14, display_name: 'Yuki T.',    score: 65, grade: 'C', job_role: 'Product',     prompt_preview: 'Create user research plan for new feature discovery...' },
  { rank: 15, display_name: 'Lucas F.',   score: 63, grade: 'C', job_role: 'Freelance',   prompt_preview: 'Write blog post on best practices for remote work...' },
  { rank: 16, display_name: 'Priya S.',   score: 61, grade: 'C', job_role: 'Finance',     prompt_preview: 'Analyze competitor pricing strategies and benchmarks...' },
  { rank: 17, display_name: 'Chen W.',    score: 59, grade: 'C', job_role: 'Engineering', prompt_preview: 'Create git workflow guide for distributed team...' },
  { rank: 18, display_name: 'Isabella R.',score: 57, grade: 'C', job_role: 'Design',      prompt_preview: 'Build accessibility checklist for design reviews...' },
  { rank: 19, display_name: 'Arjun K.',   score: 55, grade: 'C', job_role: 'Product',     prompt_preview: 'Write product specification for mobile app redesign...' },
  { rank: 20, display_name: 'Mia L.',     score: 53, grade: 'C', job_role: 'Marketing',   prompt_preview: 'Create quarterly marketing plan with KPIs and timeline...' },
];

const ROLE_TITLES: Record<string, string[]> = {
  Marketing: ['Strategist', 'Creator', 'Growth Pro', 'Marketer'],
  Design: ['Designer', 'Creative', 'Pixel Pro', 'Artisan'],
  Product: ['PM', 'Builder', 'Innovator', 'Planner'],
  Finance: ['Analyst', 'Advisor', 'Numbers Pro', 'Strategist'],
  Freelance: ['Freelancer', 'Solo Pro', 'Independent', 'Specialist'],
  Engineering: ['Engineer', 'Developer', 'Coder', 'Architect'],
};

function generateDisplayName(jobRole: string, rank: number): string {
  const titles = ROLE_TITLES[jobRole] || ['Expert', 'Pro', 'Specialist', 'Ace'];
  const title = titles[(rank - 1) % titles.length];
  return `${jobRole} ${title} #${rank}`;
}

const VALID_ROLES = new Set(['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other']);

export async function GET(request: Request) {
  const rl = await rateLimit(request, LIMITS.READ);
  if (!rl.ok) return rl.response;

  try {
    const url = new URL(request.url);
    const rawRole = url.searchParams.get('role');
    const roleFilter = rawRole && VALID_ROLES.has(rawRole) ? rawRole : null;

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      logger.warn('Supabase not configured — using mock leaderboard data');
      const data = roleFilter
        ? MOCK_LEADERBOARD.filter((entry) => entry.job_role === roleFilter)
        : MOCK_LEADERBOARD;
      return Response.json({ entries: data.slice(0, 20) }, { status: 200 });
    }

    // Query leaderboard view + join user_profiles for real display names
    let query = supabase
      .from('leaderboard_weekly')
      .select('rank, overall_score, grade, job_role, prompt_preview, user_id')
      .order('rank', { ascending: true })
      .limit(20);

    if (roleFilter) {
      query = query.eq('job_role', roleFilter);
    }

    const { data, error } = await query;

    if (error) {
      logger.warn('Leaderboard query error', { error: error.message });
      const mockData = roleFilter
        ? MOCK_LEADERBOARD.filter((entry) => entry.job_role === roleFilter)
        : MOCK_LEADERBOARD;
      return Response.json({ entries: mockData.slice(0, 20) }, { status: 200 });
    }

    // Batch-fetch display names from user_profiles for entries that have user_id
    const userIds = (data || []).map((row) => row.user_id).filter(Boolean);
    let profileMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profiles) {
        profileMap = Object.fromEntries(
          profiles
            .filter((p) => p.display_name)
            .map((p) => [p.id, p.display_name])
        );
      }
    }

    // Map view columns to the LeaderboardEntry shape expected by the frontend
    const entries: LeaderboardEntry[] = (data || []).map((row) => ({
      rank: row.rank,
      display_name: (row.user_id && profileMap[row.user_id]) || generateDisplayName(row.job_role, row.rank),
      score: row.overall_score,
      grade: row.grade,
      job_role: row.job_role,
      prompt_preview: row.prompt_preview || '',
    }));

    return Response.json({ entries }, {
      status: 200,
      headers: cacheHeaders.public(TTL.LEADERBOARD),
    });
  } catch (error) {
    logger.error('Leaderb