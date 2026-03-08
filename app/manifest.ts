import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ScoreMyPrompt - AI Prompt Grading Tool',
    short_name: 'ScoreMyPrompt',
    description: 'Score your AI prompts on 6 dimensions. Get instant feedback and improve.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1a',
    theme_color: '#3b82f6',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    categories: ['productivity', 'utilities', 'education'],
    orientation: 'portrait-primary',
    prefer_related_applications: false,
  };
}
