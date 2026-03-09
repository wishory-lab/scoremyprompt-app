import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt Challenge — ScoreMyPrompt',
  description:
    'Test your prompt engineering skills with timed challenges. Can you beat the target score? Compete and improve your AI prompts.',
  alternates: { canonical: 'https://scoremyprompt.com/challenge' },
  openGraph: {
    title: 'Prompt Challenge — ScoreMyPrompt',
    description: 'Timed prompt engineering challenges. Beat the target score and prove your skills.',
    url: 'https://scoremyprompt.com/challenge',
  },
};

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
