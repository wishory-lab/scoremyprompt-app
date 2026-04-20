import type { Metadata } from 'next';
import LeaderboardContent from './LeaderboardContent';

export const metadata: Metadata = {
  title: 'Prompt Leaderboard — ScoreMyPrompt',
  description:
    'See who writes the best AI prompts. Compare your PROMPT Score with top prompt engineers across Marketing, Design, Product, Finance, and more.',
  alternates: { canonical: 'https://scoremyprompt.com/leaderboard' },
  openGraph: {
    title: 'Prompt Leaderboard — ScoreMyPrompt',
    description: 'See who writes the best AI prompts. Compare your score with top prompt engineers.',
    url: 'https://scoremyprompt.com/leaderboard',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
