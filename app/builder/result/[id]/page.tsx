import { notFound } from 'next/navigation';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import BuilderResultClient from './BuilderResultClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default function BuilderResultPage({ params }: Props) {
  if (!isFeatureEnabled(FEATURES.BUILDER)) notFound();
  // Auth + fetch happen client-side so we can pass the Bearer token.
  return <BuilderResultClient id={params.id} />;
}
