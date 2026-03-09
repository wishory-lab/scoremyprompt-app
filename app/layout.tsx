import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './components/ClientProviders';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ScoreMyPrompt — Grade Your AI Prompt in 30 Seconds',
  description: 'Get your PROMPT Score and see how you compare with professionals in your field. Free, no signup required.',
  keywords: 'AI prompt grader, score my prompt, prompt engineering, prompt analysis, PROMPT score, ChatGPT prompt, Claude prompt, AI writing, prompt optimization, free prompt tool',
  authors: [{ name: 'ScoreMyPrompt' }],
  alternates: {
    canonical: 'https://scoremyprompt.com',
    languages: {
      en: 'https://scoremyprompt.com',
      ko: 'https://scoremyprompt.com?lang=ko',
      ja: 'https://scoremyprompt.com?lang=ja',
      'zh-CN': 'https://scoremyprompt.com?lang=zh-CN',
      'zh-TW': 'https://scoremyprompt.com?lang=zh-TW',
      es: 'https://scoremyprompt.com?lang=es',
      fr: 'https://scoremyprompt.com?lang=fr',
      de: 'https://scoremyprompt.com?lang=de',
      pt: 'https://scoremyprompt.com?lang=pt',
      hi: 'https://scoremyprompt.com?lang=hi',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'ScoreMyPrompt — Grade Your AI Prompt in 30 Seconds',
    description: 'Get your PROMPT Score and see how you compare with professionals in your field.',
    url: 'https://scoremyprompt.com',
    siteName: 'ScoreMyPrompt',
    type: 'website',
    images: [
      {
        url: 'https://scoremyprompt.com/api/og?score=92&grade=S&gradeLabel=Exceptional&jobRole=Marketing&percentile=98&p=95&r=90&o=88&m=93&s=91&t=94',
        width: 1200,
        height: 630,
        alt: 'ScoreMyPrompt - AI Prompt Grading Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreMyPrompt — Grade Your AI Prompt in 30 Seconds',
    description: 'Get your PROMPT Score and see how you compare with professionals in your field.',
    creator: '@scoremyprompt',
    images: ['https://scoremyprompt.com/api/og?score=92&grade=S&gradeLabel=Exceptional&jobRole=Marketing&percentile=98&p=95&r=90&o=88&m=93&s=91&t=94'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'ScoreMyPrompt',
                  url: 'https://scoremyprompt.com',
                  logo: 'https://scoremyprompt.com/favicon.svg',
                  sameAs: [
                    'https://x.com/scoremyprompt',
                    'https://linkedin.com/company/scoremyprompt',
                    'https://youtube.com/@scoremyprompt',
                    'https://bsky.app/profile/scoremyprompt.com',
                  ],
                },
                {
                  '@type': 'WebApplication',
                  name: 'ScoreMyPrompt',
                  url: 'https://scoremyprompt.com',
                  description: 'Free AI prompt grading tool. Get your PROMPT Score across 6 dimensions and compare with professionals.',
                  applicationCategory: 'ProductivityApplication',
                  operatingSystem: 'Web',
                  offers: [
                    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
                    { '@type': 'Offer', price: '9.99', priceCurrency: 'USD', name: 'Pro', billingIncrement: 'P1M' },
                  ],
                  // aggregateRating: Real user review data will be added post-launch
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://scoremyprompt.com' },
                    { '@type': 'ListItem', position: 2, name: 'Templates', item: 'https://scoremyprompt.com/templates' },
                    { '@type': 'ListItem', position: 3, name: 'Guides', item: 'https://scoremyprompt.com/guides' },
                    { '@type': 'ListItem', position: 4, name: 'Pricing', item: 'https://scoremyprompt.com/pricing' },
                  ],
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'What is ScoreMyPrompt?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'ScoreMyPrompt is a free AI prompt grading tool that scores your prompts on 6 dimensions (Precision, Role, Output Format, Mission Context, Structure, Tailoring) and provides actionable improvement tips.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How does the PROMPT scoring framework work?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Each letter of PROMPT measures a key aspect: P for Precision, R for Role, O for Output format, M for Mission context, S for Structure, and T for Tailoring.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Is ScoreMyPrompt free?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. Free prompt scoring with no signup required. A Pro plan is available for bulk analysis and advanced insights.',
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-dark text-white antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
