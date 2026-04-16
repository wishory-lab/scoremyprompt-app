import { z } from 'zod';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { claimShareBonus, quotaToResponse } from '@/app/lib/builder-quota';
import { BuilderClaimShareRequestSchema } from '@/app/types/builder';
import { badRequestResponse, unauthorizedResponse, errorResponse } from '@/app/lib/errors';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  const rl = rateLimit(req, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return unauthorizedResponse();
    const token = authHeader.substring(7);

    const supa = getSupabaseAdmin();
    if (!supa) return unauthorizedResponse();
    const { data: { user }, error } = await supa.auth.getUser(token);
    if (error || !user) return unauthorizedResponse();

    let body;
    try {
      body = BuilderClaimShareRequestSchema.parse(await req.json());
    } catch (err) {
      if (err instanceof z.ZodError) return badRequestResponse('Invalid request', err.issues);
      return badRequestResponse('Invalid JSON body');
    }

    const updated = await claimShareBonus(user.id, body.buildId);
    if (!updated) {
      return Response.json({ error: 'Cannot claim share bonus', code: 'NOT_ELIGIBLE' }, { status: 400 });
    }
    return Response.json(quotaToResponse(updated));
  } catch (err) {
    return errorResponse(err as Error);
  }
}
