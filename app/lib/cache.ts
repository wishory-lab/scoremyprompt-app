/**
 * Cache utilities for API responses
 *
 * Usage:
 *   import { cacheHeaders } from '@/app/lib/cache';
 *   return Response.json(data, { headers: cacheHeaders.public(300) });
 */

export type CachePreset = Record<string, string>;

/** Generate cache control headers */
export const cacheHeaders = {
  /** Public cache — CDN and browser */
  public(maxAge: number, staleWhileRevalidate?: number): CachePreset {
    const swr = staleWhileRevalidate ?? maxAge * 2;
    return {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
      Vary: 'Accept-Encoding',
    };
  },

  /** Private cache — browser only (for auth'd endpoints) */
  private(maxAge: number): CachePreset {
    return {
      'Cache-Control': `private, max-age=${maxAge}`,
      Vary: 'Authorization, Accept-Encoding',
    };
  },

  /** No cache — real-time data */
  none(): CachePreset {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };
  },

  /** Immutable — content-addressable assets */
  immutable(maxAge = 31536000): CachePreset {
    return {
      'Cache-Control': `public, max-age=${maxAge}, immutable`,
    };
  },
} as const;

/** Common TTL presets in seconds */
export const TTL = {
  LEADERBOARD: 300,    // 5 min
  BADGE: 3600,         // 1 hour
  EMBED: 3600,         // 1 hour
  OG_IMAGE: 86400,     // 24 hours
  STATIC: 31536000,    // 1 year
} as const;
