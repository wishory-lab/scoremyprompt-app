import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Prompts — ScoreMyPrompt',
  description:
    'Compare two AI prompts side by side. See which prompt scores higher and understand the differences in precision, structure, and more.',
  alternates: { canonical: 'https://scoremyprompt.com/compare' },
  openGraph: {
    title: 'Compare Prompts — ScoreMyPrompt',
    description: 'Side-by-side AI prompt comparison. Find out which prompt is better and why.',
    url: 'https://scoremyprompt.com/compare',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
