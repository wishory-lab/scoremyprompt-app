import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — ScoreMyPrompt',
  description:
    'Free prompt scoring with no signup. Upgrade to Pro for unlimited analysis, bulk scoring, team features, and priority support.',
  alternates: { canonical: 'https://scoremyprompt.com/pricing' },
  openGraph: {
    title: 'Pricing — ScoreMyPrompt',
    description: 'Free prompt scoring or Pro for unlimited analysis. No signup required to start.',
    url: 'https://scoremyprompt.com/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
