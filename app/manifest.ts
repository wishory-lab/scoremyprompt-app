import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ScoreMyPrompt - AI 프롬프트 채점 도구',
    short_name: 'ScoreMyPrompt',
    description: '6가지 차원으로 AI 프롬프트를 채점하세요. 즉시 피드백을 받고 개선하세요.',
    lang: 'ko',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1a',
    theme_color: '#3b82f6',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['productivity', 'utilities', 'education'],
    orientation: 'portrait-primary',
    prefer_related_applications: false,
  };
}
