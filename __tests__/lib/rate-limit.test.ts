import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

function makeRequest(ip = '1.2.3.4'): Request {
  return new Request('http://localhost:3000/api/test', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('Rate Limiter', () => {
  it('allows requests under limit', async () => {
    const config = { limit: 3, windowSeconds: 60, prefix: 'test-allow' };
    const req = makeRequest('10.0.0.1');

    const r1 = await rateLimit(req, config);
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = await rateLimit(req, config);
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await rateLimit(req, config);
    expect(r3.ok).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests over limit', async () => {
    const config = { limit: 2, windowSeconds: 60, prefix: 'test-block' };
    const req = makeRequest('10.0.0.2');

    await rateLimit(req, config); // 1
    await rateLimit(req, config); // 2

    const r3 = await rateLimit(req, config); // 3 — should be blocked
    expect(r3.ok).toBe(false);
    expect(r3.response.status).toBe(429);
  });

  it('returns correct headers', async () => {
    const config = { limit: 5, windowSeconds: 60, prefix: 'test-headers' };
    const req = makeRequest('10.0.0.3');

    const result = await rateLimit(req, config);
    expect(result.response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(result.response.headers.get('X-RateLimit-Remaining')).toBe('4');
    expect(result.response.headers.get('X-RateLimit-Reset')).toBeTruthy();
  });

  it('blocked response includes retryAfter', async () => {
    const config = { limit: 1, windowSeconds: 60, prefix: 'test-retry' };
    const req = makeRequest('10.0.0.4');

    await rateLimit(req, config); // use up
    const blocked = await rateLimit(req, config);
    expect(blocked.ok).toBe(false);

    const body = await blocked.response.json();
    expect(body.code).toBe('RATE_LIMITED');
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(blocked.response.headers.get('Retry-After')).toBeTruthy();
  });

  it('isolates different IPs', async () => {
    const config = { limit: 1, windowSeconds: 60, prefix: 'test-isolate' };

    const r1 = await rateLimit(makeRequest('10.0.0.5'), config);
    expect(r1.ok).toBe(true);

    const r2 = await rateLimit(makeRequest('10.0.0.6'), config);
    expect(r2.ok).toBe(true);
  });

  it('isolates different prefixes', async () => {
    const req = makeRequest('10.0.0.7');

    const r1 = await rateLimit(req, { limit: 1, windowSeconds: 60, prefix: 'prefix-a' });
    expect(r1.ok).toBe(true);

    const r2 = await rateLimit(req, { limit: 1, windowSeconds: 60, prefix: 'prefix-b' });
    expect(r2.ok).toBe(true);
  });

  it('has sensible pre-configured limits', () => {
    expect(LIMITS.ANALYZE.limit).toBe(5);
    expect(LIMITS.ANALYZE_BULK.limit).toBe(3);
    expect(LIMITS.READ.limit).toBe(60);
    expect(LIMITS.AUTH.windowSeconds).toBe(300);
  });
});
