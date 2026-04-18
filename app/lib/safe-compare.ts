import crypto from 'crypto';

/**
 * Constant-time string comparison to prevent timing attacks on secret tokens.
 * Returns true if both strings are non-empty and equal.
 */
export function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
