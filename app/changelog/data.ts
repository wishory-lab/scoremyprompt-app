export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: 'feature' | 'improvement' | 'fix' | 'infrastructure';
  items: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.8.0',
    date: '2026-03-09',
    title: 'DevOps & Quality',
    type: 'infrastructure',
    items: [
      'GitHub Actions CI/CD pipeline for automated testing and deployment',
      'PWA manifest and robots.txt for better discoverability',
      'OpenAPI 3.1 specification for all API endpoints',
      'Cookie consent banner for GDPR/CCPA compliance',
      'Network status detection with offline banner',
      'Keyboard shortcuts for power users',
    ],
  },
  {
    version: '1.7.0',
    date: '2026-03-08',
    title: 'Accessibility & Performance',
    type: 'improvement',
    items: [
      'WCAG 2.1 AA accessibility fixes across all pages',
      'Custom 404 page with navigation',
      'Centralized cache headers for API responses',
      'Bundle size optimization with dynamic imports',
      'Database performance indexes',
      'Feature flag system for controlled rollouts',
      'SEO structured data enhancements',
    ],
  },
  {
    version: '1.6.0',
    date: '2026-03-07',
    title: 'Internationalization & Testing',
    type: 'feature',
    items: [
      'Korean language support (i18n)',
      'Language switcher in footer',
      'Comprehensive API test suite',
      'E2E test infrastructure with Playwright',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-03-06',
    title: 'Infrastructure & Monitoring',
    type: 'infrastructure',
    items: [
      'Sentry error tracking integration',
      'Structured JSON logging',
      'Environment variable validation',
      'Security headers and CSRF protection',
      'Maintenance mode support',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-03-05',
    title: 'Growth Features',
    type: 'feature',
    items: [
      'SVG badge generator for sharing scores',
      'Embeddable result cards',
      'Newsletter subscription',
      'Exit-intent modal for re-engagement',
      'Onboarding tour for new users',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-03-04',
    title: 'Pro & Social Features',
    type: 'feature',
    items: [
      'Bulk prompt analysis (Pro tier)',
      'Prompt compare mode',
      'Community leaderboard with filters',
      'Challenger mode for competitive grading',
      'Stripe billing integration',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-03-03',
    title: 'Dashboard & History',
    type: 'feature',
    items: [
      'User dashboard with score trends',
      'Analysis history with search',
      'Prompt templates library',
      'Guide articles for prompt engineering',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-03-02',
    title: 'Social Sharing & Polish',
    type: 'improvement',
    items: [
      'Social sharing with OG images',
      'Shareable result pages',
      'PDF/CSV export',
      'Mobile-optimized result view',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-01',
    title: 'Launch',
    type: 'feature',
    items: [
      'PROMPT Score grading across 6 dimensions',
      'Instant AI-powered analysis with Claude Haiku',
      'Score visualization and grade system',
      'Quick fix suggestions',
      'Rewrite suggestions',
      'Magic link authentication',
    ],
  },
];
