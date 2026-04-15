import JSZip from 'jszip';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';
import type { BuilderFileMap } from '@/app/types/builder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WATERMARK_README =
  '\n\n---\n\nCreated with ScoreMyPrompt — Upgrade to Pro for unlimited builds: https://scoremyprompt.com/pricing\n';

interface BuildRow {
  files: BuilderFileMap;
  isProBuild: boolean;
}

async function resolveUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const { data: { user }, error } = await supa.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

async function loadBuild(id: string, userId: string): Promise<BuildRow | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const { data } = await supa
    .from('builder_outputs')
    .select('files, is_pro_build, expires_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  if (new Date(data.expires_at as string) < new Date()) return null;
  return {
    files: data.files as BuilderFileMap,
    isProBuild: data.is_pro_build as boolean,
  };
}

export async function GET(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  const userId = await resolveUserId(req);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const build = await loadBuild(params.id, userId);
  if (!build) return new Response('Build not found or expired', { status: 410 });

  try {
    const zip = new JSZip();
    for (const [path, content] of Object.entries(build.files)) {
      // JSZip treats leading slash inconsistently — strip to make paths relative inside ZIP.
      const normalized = path.replace(/^\//, '');
      const body =
        normalized === 'README.md' && !build.isProBuild ? content + WATERMARK_README : content;
      zip.file(normalized, body);
    }
    const blob = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    return new Response(blob as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="harness-${params.id.slice(0, 8)}.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    logger.error('ZIP generation failed', { error: String(err), id: params.id });
    return new Response('Failed to generate ZIP', { status: 500 });
  }
}
