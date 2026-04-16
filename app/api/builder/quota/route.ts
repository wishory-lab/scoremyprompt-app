import { getSupabaseAdmin } from '@/app/lib/supabase';
import { getQuota, quotaToResponse } from '@/app/lib/builder-quota';
import { unauthorizedResponse, errorResponse } from '@/app/lib/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
    const token = authHeader.substring(7);

    const supa = getSupabaseAdmin();
    if (!supa) return unauthorizedResponse();
    const { data: { user }, error } = await supa.auth.getUser(token);
    if (error || !user) return unauthorizedResponse();

    const { data: profile } = await supa
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .maybeSingle();
    const tier: 'free' | 'pro' = profile?.tier === 'pro' ? 'pro' : 'free';

    const state = await getQuota(user.id, tier);
    return Response.json(quotaToResponse(state));
  } catch (err) {
    return errorResponse(err as Error);
  }
}
