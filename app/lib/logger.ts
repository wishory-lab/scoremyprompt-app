/**
 * Universal logger that works in both Server and Client components.
 *
 * - Server-side: attempts to read X-Request-Id from headers and forward
 *   errors to Sentry (lazy-loaded to avoid importing next/headers at module
 *   level, which breaks client bundles).
 * - Client-side: plain structured console logging.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  requestId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const isServer = typeof window === 'undefined';

/**
 * Try to read the X-Request-Id header set by middleware.
 * Only works server-side; returns undefined on the client.
 */
async function getRequestId(): Promise<string | undefined> {
  if (!isServer) return undefined;
  try {
    // Dynamic import so next/headers is never bundled into client chunks
    const { headers } = await import('next/headers');
    const headerStore = headers();
    return headerStore.get('x-request-id') || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Forward error to Sentry (server-side only, lazy-loaded).
 */
async function captureToSentry(message: string, context?: Record<string, unknown>, requestId?: string) {
  if (!isServer) return;
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(message, {
      level: 'error',
      extra: { ...context, requestId },
    });
  } catch {
    // Sentry not initialized — silent fallback
  }
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  // Fire-and-forget async work (requestId + Sentry)
  const work = async () => {
    const requestId = await getRequestId();

    const entry: LogEntry = {
      level,
      message,
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    };

    const output = JSON.stringify(entry);

    if (level === 'error') {
      console.error(output);
      await captureToSentry(message, context, requestId);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  };

  work().catch(() => {
    // Fallback: plain console log if anything goes wrong
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[${level.toUpperCase()}] ${message}`,
      context || ''
    );
  });
}

export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx),
};
