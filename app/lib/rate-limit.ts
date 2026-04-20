/**
 * Rate limiter with Upstash Redis for production (Vercel Serverless compatible)
 * and in-memory fallback for development.
 *
 * Usage:
 *   import { rateLimit, LIMITS } from '@/app/lib/rate-limit';
 *
 *   export async function POST(req: Request) {
 *     const rl = await rateLimit(req, LIMITS.ANALYZE);
 *     if (!rl.ok) return rl.response;
 *     // ... handle request
 *   }
 */

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Key prefix for namespacing */
  prefix?: string;
}

interface RateLimitResult {
  ok: boolean;
  response: Response;
  remaining: number;
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

// ─── Client key extraction ───

function getClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback: hash of user-agent + accept-language
  const ua = req.headers.get('user-agent') || '';
  const lang = req.headers.get('accept-language') || '';
  let hash = 0;
  const str = ua + lang;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return `fallback-${hash}`;
}

// ─── Redis-backed rate limiter ───

interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
}

let redisClient: RedisClient | null | undefined = undefined;

/**
 * Upstash Redis REST client — lightweight, no SDK dependency.
 * Uses the Upstash REST API directly via fetch.
 */
class UpstashRedisClient implements RedisClient {
  constructor(private url: string, private token: string) {}

  private async command(...args: (string | number)[]): Promise<unknown> {
    const res = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
    const data = await res.json();
    return data.result;
  }

  async incr(key: string): Promise<number> {
    return (await this.command('INCR', key)) as number;
  }

  async expire(key: string, seconds: number): Promise<number> {
    return (await this.command('EXPIRE', key, seconds)) as number;
  }

  async ttl(key: string): Promise<number> {
    return (await this.command('TTL', key)) as number;
  }
}

async function getRedisClient(): Promise<RedisClient | null> {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisClient = null;
    return null;
  }

  redisClient = new UpstashRedisClient(url, token);
  return redisClient;
}

async function rateLimitWithRedis(
  redis: RedisClient,
  key: string,
  config: RateLimitConfig
): Promise<{ count: number; resetSeconds: number }> {
  const count = await redis.incr(key);

  if (count === 1) {
    // First request in this window — set expiry
    await redis.expire(key, config.windowSeconds);
  }

  const ttl = await redis.ttl(key);
  const resetSeconds = ttl > 0 ? ttl : config.windowSeconds;

  return { count, resetSeconds };
}

// ─── In-memory fallback (dev / no Redis) ───

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt <= now) memoryStore.delete(key);
    }
  }, 60_000);
}

function rateLimitInMemory(
  key: string,
  config: RateLimitConfig
): { count: number; resetSeconds: number } {
  ensureCleanup();
  const now = Date.now();

  let entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowSeconds * 1000 };
    memoryStore.set(key, entry);
  }

  entry.count++;
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  return { count: entry.count, resetSeconds };
}

// ─── Main entry point ───

/**
 * Check rate limit for a request.
 * Uses Upstash Redis in production, falls back to in-memory in dev.
 */
export async function rateLimit(req: Request, config: RateLimitConfig): Promise<RateLimitResult> {
  const prefix = config.prefix || 'default';
  const clientKey = getClientKey(req);
  const key = `rl:${prefix}:${clientKey}`;

  let count: number;
  let resetSeconds: number;

  const redis = await getRedisClient();
  if (redis) {
    try {
      const result = await rateLimitWithRedis(redis, key, config);
      count = result.count;
      resetSeconds = result.resetSeconds;
    } catch {
      // Redis error — fall back to in-memory for this request
      const result = rateLimitInMemory(key, config);
      count = result.count;
      resetSeconds = result.resetSeconds;
    }
  } else {
    const result = rateLimitInMemory(key, config);
    count = result.count;
    resetSeconds = result.resetSeconds;
  }

  const remaining = Math.max(0, config.limit - count);
  const rateLimitHeaders: Record<string, string> = {
    'X-RateLimit-Limit': String(config.limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetSeconds),
  };

  if (count > config.limit) {
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

  return {
    ok: true,
    remaining,
    response: new Response(null, { status: 200, headers: rateLimitHeaders }),
  };
}
