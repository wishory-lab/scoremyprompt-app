import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import HarnessResultClient from './HarnessResultClient';
import type { HarnessAnalyzeResponse } from '@/app/types/harness';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

async function loadResult(shareId: string): Promise<HarnessAnalyzeResponse | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;
  const { data } = await supa
    .from('harness_scores')
    .select('id, share_id, scores, total, tier, feedback, quick_wins')
    .eq('share_id', shareId)
    .maybeSingle();
  if (!data) return null;
  return {
    analysisId: data.id as string,
    shareId: data.share_id as string,
    total: data.total as number,
    tier: data.tier as HarnessAnalyzeResponse['tier'],
    scores: data.scores as HarnessAnalyzeResponse['scores'],
    feedback: data.feedback as HarnessAnalyzeResponse['feedback'],
    quickWins: data.quick_wins as HarnessAnalyzeResponse['quickWins'],
  };
}

export async function generateMetadata({ params }: Props) {
  const r = await loadResult(params.id);
  const score = r?.total ?? 0;
  const tier = r?.tier ?? 'NeedsHarness';
  return {
    title: `My AI setup scored ${score}/100 (${tier}) — HARNES`,
    description: `See my HARNES score for my AI agent setup. Score yours free.`,
    openGraph: {
      title: `HARNES Score: ${score}/100 — ${tier}`,
      description: 'Score your AI agent setup with the HARNES framework.',
      images: [`/api/og/harness?id=${params.id}`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/api/og/harness?id=${params.id}`],
    },
  };
}

export default async function HarnessResultPage({ params }: Props) {
  if (!isFeatureEnabled(FEATURES.HARNESS_SCORE)) notFound();
  const result = await loadResult(params.id);
  if (!result) notFound();
  return <HarnessResultClient result={result} />;
}
