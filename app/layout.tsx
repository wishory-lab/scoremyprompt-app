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
  title: 'ScoreMyPrompt — AI 프롬프트를 30초 만에 채점하세요',
  description: 'PROMPT 점수를 받고 같은 분야 전문가들과 비교해 보세요. 무료, 가입 불필요. 6가지 차원으로 AI 프롬프트 품질을 분석합니다.',
  keywords: 'AI 프롬프트 채점, 프롬프트 점수, 프롬프트 엔지니어링, 프롬프트 분석, PROMPT score, ChatGPT 프롬프트, Claude 프롬프트, AI 글쓰기, 프롬프트 최적화, 무료 프롬프트 도구, ScoreMyPrompt',
  authors: [{ name: 'ScoreMyPrompt' }],
  alternates: {
    canonical: 'https://scoremyprompt.app',
    languages: {
      ko: 'https://scoremyprompt.app',
      en: 'https://scoremyprompt.app?lang=en',
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
    title: 'ScoreMyPrompt — AI 프롬프트를 30초 만에 채점하세요',
    description: 'PROMPT 점수를 받고 같은 분야 전문가들과 비교해 보세요. 6가지 차원 분석, 무료.',
    url: 'https://scoremyprompt.app',
    siteName: 'ScoreMyPrompt',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: 'https://scoremyprompt.app/api/og?score=92&grade=S&gradeLabel=Exceptional&jobRole=Marketing&percentile=98&p=95&r=90&o=88&m=93&s=91&t=94',
        width: 1200,
        height: 630,
        alt: 'ScoreMyPrompt - AI 프롬프트 채점 도구',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreMyPrompt — AI 프롬프트를 30초 만에 채점하세요',
    description: 'PROMPT 점수를 받고 같은 분야 전문가들과 비교해 보세요. 6가지 차원 분석, 무료.',
    creator: '@scoremyprompt',
    images: ['https://scoremyprompt.app/api/og?score=92&grade=S&gradeLabel=Exceptional&jobRole=Marketing&percentile=98&p=95&r=90&o=88&m=93&s=91&t=94'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
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
                  url: 'https://scoremyprompt.app',
                  logo: 'https://scoremyprompt.app/favicon.svg',
                  sameAs: [
                    'https://x.com/scoremyprompt',
                  ],
                },
                {
                  '@type': 'WebApplication',
                  name: 'ScoreMyPrompt',
                  url: 'https://scoremyprompt.app',
                  description: '무료 AI 프롬프트 채점 도구. 6가지 차원으로 PROMPT 점수를 받고 전문가들과 비교하세요.',
                  applicationCategory: 'ProductivityApplication',
                  operatingSystem: 'Web',
                  inLanguage: 'ko',
                  offers: [
                    { '@type': 'Offer', price: '0', priceCurrency: 'KRW', name: '무료' },
                    { '@type': 'Offer', price: '4990', priceCurrency: 'KRW', name: '프리미엄', billingIncrement: 'P1M' },
                  ],
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: '홈', item: 'https://scoremyprompt.app' },
                    { '@type': 'ListItem', position: 2, name: '템플릿', item: 'https://scoremyprompt.app/templates' },
                    { '@type': 'ListItem', position: 3, name: '가이드', item: 'https://scoremyprompt.app/guides' },
                    { '@type': 'ListItem', position: 4, name: '요금제', item: 'https://scoremyprompt.app/pricing' },
                  ],
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'ScoreMyPrompt가 무엇인가요?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'ScoreMyPrompt는 무료 AI 프롬프트 채점 도구입니다. 정확성, 역할, 출력 형식, 미션 컨텍스트, 구조, 맞춤화 등 6가지 차원으로 프롬프트를 분석하고 실행 가능한 개선 팁을 제공합니다.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'PROMPT 채점 프레임워크는 어떻게 작동하나요?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'PROMPT의 각 글자는 핵심 요소를 측정합니다. P는 정확성, R은 역할, O는 출력 형식, M은 미션 컨텍스트, P는 구조, T는 맞춤화를 의미합니다.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'ScoreMyPrompt는 무료인가요?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: '네, 가입 없이 무료로 프롬프트를 채점할 수 있습니다. 대량 분석과 고급 인사이트를 위한 프리미엄 플랜도 제공합니다.',
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
          본문으로 건너뛰기
        </a>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
