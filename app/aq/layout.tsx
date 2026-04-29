import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AQ — AI 역량 지수 | AI Quotient',
  description:
    'IQ·EQ처럼, AI를 다루는 능력을 수치화합니다. 프롬프트 엔지니어링, 도구 활용, AI 윤리, 개념 이해 — 4대 영역 종합 평가로 나만의 AQ를 측정하세요.',
  keywords: [
    'AQ',
    'AI Quotient',
    'AI 역량',
    'AI 리터러시',
    'AI 역량 테스트',
    'AI 인재',
    'AI 자격',
    '프롬프트 엔지니어링',
  ],
  openGraph: {
    title: 'AQ — AI 역량 지수 측정',
    description:
      '프롬프트·도구·윤리·개념 4대 영역 종합 평가. 나의 AI 활용 능력은 몇 점?',
    url: 'https://aq.ai.kr',
    siteName: 'AQ by ScoreMyPrompt',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: 'https://scoremyprompt.app/api/aq/og?score=150&grade=A',
        width: 1200,
        height: 630,
        alt: 'AQ — AI Quotient',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AQ — AI 역량 지수',
    description: '나의 AI 활용 능력을 4대 영역으로 측정하세요.',
  },
  alternates: {
    canonical: 'https://aq.ai.kr',
  },
};

export default function AQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
