/**
 * Input sanitization utilities for XSS prevention.
 * Used as an additional defence layer alongside Zod validation.
 */

/** Strip HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Escape HTML special characters */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/** Remove null bytes and other control characters (except newlines & tabs) */
export function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize user-submitted text input.
 * Removes HTML, control characters, and trims whitespace.
 * Safe to use on prompt text, job role, and other user inputs.
 */
export function sanitizeInput(input: string): string {
  return stripControlChars(stripHtml(input)).trim();
}

/** Validate that a string doesn't contain potential script injection patterns */
export function containsScriptPattern(input: string): boolean {
  const patterns = [
    /javascript:/i,
    /on\w+\s*=/i,       // onclick=, onerror=, etc.
    /<script/i,
    /data:\s*text\/html/i,
    /vbscript:/i,
  ];
  return patterns.some((p) => p.test(input));
}
