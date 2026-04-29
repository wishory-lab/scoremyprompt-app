/**
 * AQ Share URL / OG builder
 * 환경변수 우선순위: NEXT_PUBLIC_AQ_URL > NEXT_PUBLIC_BASE_URL/aq > VERCEL_URL/aq
 */

/** AQ origin (e.g. https://aq.ai.kr) — trailing slash stripped */
export function getAqOrigin(): string {
  // 1. 명시적 AQ 도메인
  if (process.env.NEXT_PUBLIC_AQ_URL) {
    return process.env.NEXT_PUBLIC_AQ_URL.replace(/\/+$/, '');
  }
  // 2. SMP base URL + /aq
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '')}/aq`;
  }
  // 3. Vercel preview
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/aq`;
  }
  // 4. Dev fallback
  return 'http://localhost:3000/aq';
}

/** Build share URL for AQ result */
export function buildAqShareUrl(params: {
  score: number;
  grade: string;
  percentile?: number;
}): string {
  const origin = getAqOrigin();
  const qs = new URLSearchParams({
    s: String(params.score),
    g: params.grade,
    ...(params.percentile != null && { p: String(params.percentile) }),
  });
  return `${origin}/share?${qs.toString()}`;
}

/** Build OG image URL for AQ result */
export function buildAqOgImageUrl(params: {
  score: number;
  grade: string;
}): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '')
    || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
  return `${base}/api/aq/og?score=${params.score}&grade=${params.grade}`;
}
