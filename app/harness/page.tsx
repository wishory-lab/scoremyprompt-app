import { notFound } from 'next/navigation';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import HarnessClient from './HarnessClient';

export const metadata = {
  title: 'Score Your AI Setup — ScoreMyPrompt',
  description: 'Paste your CLAUDE.md or describe your AI agent setup. Get a HARNES score in 6 dimensions. Free.',
  openGraph: {
    title: 'Score Your AI Setup — HARNES Framework',
    description: 'Grade your AI agent setup in 6 dimensions. Free.',
  },
};

export default function HarnessPage() {
  if (!isFeatureEnabled(FEATURES.HARNESS_SCORE)) {
    notFound();
  }
  return <HarnessClient />;
}
