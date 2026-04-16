import { ImageResponse } from '@vercel/og';
import { getSupabaseAdmin } from '@/app/lib/supabase';

export const runtime = 'nodejs';
const imageSize = { width: 1200, height: 630 };

const TIER_BG: Record<string, string> = {
  Elite: 'linear-gradient(135deg, #facc15, #ca8a04)',
  Proficient: 'linear-gradient(135deg, #cbd5e1, #64748b)',
  Developing: 'linear-gradient(135deg, #b45309, #78350f)',
  NeedsHarness: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  let total = 0;
  let tier = 'NeedsHarness';

  if (id) {
    const supa = getSupabaseAdmin();
    if (supa) {
      const { data } = await supa
        .from('harness_scores')
        .select('total, tier')
        .eq('share_id', id)
        .maybeSingle();
      if (data) {
        total = (data.total as number) ?? 0;
        tier = (data.tier as string) ?? 'NeedsHarness';
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: TIER_BG[tier] || TIER_BG.NeedsHarness,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 32, opacity: 0.9 }}>HARNES Score</div>
        <div style={{ fontSize: 220, fontWeight: 900, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 48, fontWeight: 700 }}>{tier}</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.9 }}>scoremyprompt.com/harness</div>
      </div>
    ),
    { ...imageSize },
  );
}
