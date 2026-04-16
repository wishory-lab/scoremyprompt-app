import { notFound } from 'next/navigation';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import BuilderClient from './BuilderClient';

export const metadata = {
  title: 'Build Your AI Setup — ScoreMyPrompt',
  description: 'Answer 5 questions and get a ready-to-run Claude Code harness as a ZIP. Free 1/month.',
};

export default function BuilderPage() {
  if (!isFeatureEnabled(FEATURES.BUILDER)) notFound();
  // Auth is enforced client-side (AuthProvider) + server-side (API route rejects unauth).
  return <BuilderClient />;
}
