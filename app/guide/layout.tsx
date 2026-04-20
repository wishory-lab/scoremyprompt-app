import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Use — ScoreMyPrompt',
  description: 'Learn how to use ScoreMyPrompt to grade, improve, and master your AI prompts. Step-by-step guide for beginners.',
  alternates: { canonical: 'https://scoremyprompt.com/guide' },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
