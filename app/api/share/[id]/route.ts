import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * GET /api/share/[id]
 * Fetch a shared analysis result by share_id (8-char slug).
 * Public endpoint — no auth required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: shareId } = await params;

  if (!shareId || shareId.length < 6) {
    return NextResponse.json({ error: 'Invalid share ID' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('analyses')
    .select('share_id, overall_score, grade, result_json, job_role, created_at')
    .eq('share_id', shareId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  // Increment share_count
  supabase
    .from('analyses')
    .update({ share_count: (data as Record<string, unknown>).share_count as number || 0 + 1 })
    .eq('share_id', shareId)
    .then(() => {});

  // Return the result
  return NextResponse.json({
    shareId: data.share_id,
    score: data.overall_score,
    grade: data.grade,
    jobRole: data.job_role,
    result: data.result_json,
    createdAt: data.created_at,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
