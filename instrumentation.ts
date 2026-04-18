import * as Sentry from '@sentry/nextjs';

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  // Enable Sentry in production AND staging/preview so pre-prod bugs are visible.
  // Only skip in local development (NODE_ENV === 'development') to avoid noise.
  if (dsn && process.env.NODE_ENV !== 'development') {
    Sentry.init({
      dsn,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      // D-Day monitoring: capture all errors, sample 10% of transactions
      beforeSend(event) {
        // Tag API route errors for alert filtering in Sentry dashboard
        if (event.request?.url?.includes('/api/analyze')) {
          event.tags = { ...event.tags, api_route: 'analyze', critical: 'true' };
        }
        if (event.request?.url?.includes('/api/')) {
          event.tags = { ...event.tags, api_route: 'general' };
        }
        return event;
      },
      // Ignore known non-critical errors
      ignoreErrors: [
        'AbortError',
        'ResizeObserver loop',
        'Non-Error promise rejection',
      ],
    });
  }
}
