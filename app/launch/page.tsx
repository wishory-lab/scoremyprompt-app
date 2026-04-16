import LaunchClient from './LaunchClient';

export const metadata = {
  title: 'Score & Build Your AI — ScoreMyPrompt (Launching on Product Hunt)',
  description: 'Free tools to grade your prompts and build Claude Code agent harnesses in 2 minutes. Now live.',
  openGraph: {
    title: 'Score & Build Your AI — ScoreMyPrompt',
    description: 'Free tools to grade your prompts and build Claude Code agent harnesses.',
  },
};

export default function LaunchPage() {
  return <LaunchClient />;
}
