import { notFound } from 'next/navigation';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import BuilderResultClient from './BuilderResultClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
  searchParams: { score?: string; tier?: string };
}

export default function BuilderResultPage({ params, searchParams }: Props) {
  if (!isFeatureEnabled(FEATURES.BUILDER)) notFound();
  const scoreNum = searchParams.score ? parseInt(searchParams.score, 10) : undefined;
  const selfScore =
    scoreNum !== undefined && !isNaN(scoreNum) && searchParams.tier
      ? { total: scoreNum, tier: searchParams.tier }
      : undefined;
  // Auth + fetch happen client-side so we can pass the Bearer token.
  return <BuilderResultClient id={params.id} selfScore={selfScore} />;
}
