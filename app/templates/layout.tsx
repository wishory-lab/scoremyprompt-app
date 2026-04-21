import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';

export const metadata: Metadata = {
  title: 'Prompt Templates — High-Scoring AI Prompt Examples | ScoreMyPrompt',
  description:
    'Browse 21 expert-crafted AI prompt templates scoring 80+ across Marketing, Design, Product, Finance, Engineering, and Freelance. Copy, customize, and score your own.',
  keywords: [
    'AI prompt templates',
    'ChatGPT prompt examples',
    'prompt engineering templates',
    'high scoring prompts',
    'AI prompt library',
    'prompt templates for marketing',
    'prompt templates for engineering',
  ],
  alternates: { canonical: `${baseUrl}/templates` },
  openGraph: {
    title: 'Prompt Templates — High-Scoring AI Prompt Examples',
    description:
      'Browse 21 expert-crafted prompt templates scoring 80+. Copy, customize, and score your own.',
    url: `${baseUrl}/templates`,
    siteName: 'ScoreMyPrompt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Templates — ScoreMyPrompt',
    description: '21 expert-crafted prompt templates scoring 80+.',
    creator: '@scoremyprompt',
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
