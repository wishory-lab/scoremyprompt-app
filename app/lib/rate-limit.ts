/**
 * Generic in-memory rate limiter for API routes.
 *
 * Usage in any route:
 *   import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
 *
 *   export async function POST(req: Request) {
 *     const rl = rateLimit(req, LIMITS.ANALYZE);
 *     if (!rl.ok) return rl.response;
 *     // ... handle request
 *   }
 */

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Key prefix for namespacing (default: 'default') */
  prefix?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  ok: boolean;
  response: Response;
  remaining: number;
}

// In-memory store (per-instance, suitable for single-instance or edge runtime)
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60s
let cleanupInterval: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, 60_000);
}

/** Pre-configured limits for different endpoints */
export const LIMITS = {
  /** Core analysis: strict */
  ANALYZE: { limit: 5, windowSeconds: 60, prefix: 'analyze' } as RateLimitConfig,
  /** Bulk analysis: very strict */
  ANALYZE_BULK: { limit: 3, windowSeconds: 60, prefix: 'analyze-bulk' } as RateLimitConfig,
  /** Export: moderate */
  EXPORT: { limit: 20, windowSeconds: 60, prefix: 'export' } as RateLimitConfig,
  /** Read endpoints: generous */
  READ: { limit: 60, windowSeconds: 60, prefix: 'read' } as RateLimitConfig,
  /** Auth actions: strict */
  AUTH: { limit: 5, windowSeconds: 300, prefix: 'auth' } as RateLimitConfig,
  /** Newsletter/waitlist: moderate */
  SUBMIT: { limit: 3, windowSeconds: 300, prefix: 'submit' } as RateLimitConfig,
  /** Admin: moderate */
  ADMIN: { limit: 30, windowSeconds: 60, prefix: 'admin' } as RateLimitConfig,
} as const;

/**
 * Extract a stable identifier from the request for rate limiting.
 * Uses X-Forwarded-For, then falls back to a hash of headers.
 */
function getClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback: hash of user-agent + accept-language for some uniqueness
  const ua = req.headers.get('user-agent') || '';
  const lang = req.headers.get('accept-language') || '';
  let hash = 0;
  const str = ua + lang;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return `fallback-${hash}`;
}

/**
 * Check rate limit for a request.
 * Returns { ok: true } if allowed, or { ok: false, response: 429 Response } if blocked.
 */
export function rateLimit(req: Request, config: RateLimitConfig): RateLimitResult {
  ensureCleanup();

  const prefix = config.prefix || 'default';
  const clientKey = getClientKey(req);
  const key = `${prefix}:${clientKey}`;
  const now = Date.now();

  let entry = store.get(key);

  // Create or reset expired entry
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowSeconds * 1000 };
    store.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, config.limit - entry.count);
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  const rateLimitHeaders: Record<string, string> = {
    'X-RateLimit-Limit': String(config.limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetSeconds),
  };

  if (entry.count > config.limit) {
    return {
      ok: false,
      remaining: 0,
      response: Response.json(
        {
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
          retryAfter: resetSeconds,
        },
        { status: 429, headers: { ...rateLimitHeaders, 'Retry-After': String(resetSeconds) } }
      ),
    };
  }

  // Return a pass-through response that routes can ignore
  return {
    ok: true,
    remaining,
    response: new Response(null, { status: 200, headers: rateLimitHeaders }),
  };
}
