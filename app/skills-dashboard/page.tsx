import type { Metadata } from 'next';
import { Suspense } from 'react';
import SkillsDashboardClient from './SkillsDashboardClient';

export const metadata: Metadata = {
  title: 'Skills Dashboard — ScoreMyPrompt Advanced Tools',
  description: 'Advanced prompt evaluation, multi-model comparison, template library, and security analysis. Upgrade your prompt engineering skills.',
};

export default function SkillsDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Skills Dashboard...</div>}>
      <SkillsDashboardClient />
    </Suspense>
  );
}
