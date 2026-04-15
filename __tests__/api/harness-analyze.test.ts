// __tests__/api/harness-analyze.test.ts
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/harness/analyze/route';

function makeRequest(body: Record<string, unknown>, ip = '10.0.0.1') {
  return new Request('http://localhost:3000/api/harness/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('/api/harness/analyze', () => {
  describe('Mock Mode (no ANTHROPIC_API_KEY)', () => {
    it('returns 200 with valid mock HARNES result', async () => {
      const response = await POST(
        makeRequest({
          input: 'You are a helpful marketing assistant. Write blog posts for my company.',
          lang: 'en',
        }),
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('analysisId');
      expect(data).toHaveProperty('shareId');
      expect(data).toHaveProperty('total');
      expect(data.total).toBeGreaterThanOrEqual(0);
      expect(data.total).toBeLessThanOrEqual(100);
      expect(['Elite', 'Proficient', 'Developing', 'NeedsHarness']).toContain(data.tier);
      expect(data.scores).toHaveProperty('H');
      expect(data.scores).toHaveProperty('A');
      expect(data.scores).toHaveProperty('R');
      expect(data.scores).toHaveProperty('N');
      expect(data.scores).toHaveProperty('E');
      expect(data.scores).toHaveProperty('S');
      expect(Array.isArray(data.feedback)).toBe(true);
      expect(data.feedback.length).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(data.quickWins)).toBe(true);
      expect(data.quickWins.length).toBeGreaterThanOrEqual(2);
    });

    it('tier matches total score thresholds', async () => {
      const res = await POST(
        makeRequest({ input: 'x'.repeat(500), lang: 'en' }),
      );
      const data = await res.json();
      if (data.total >= 85) expect(data.tier).toBe('Elite');
      else if (data.total >= 60) expect(data.tier).toBe('Proficient');
      else if (data.total >= 30) expect(data.tier).toBe('Developing');
      else expect(data.tier).toBe('NeedsHarness');
    });
  });

  describe('Validation (Zod)', () => {
    it('rejects input shorter than 20 characters', async () => {
      const response = await POST(makeRequest({ input: 'too short', lang: 'en' }));
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('rejects input longer than 20,000 characters', async () => {
      const response = await POST(makeRequest({ input: 'x'.repeat(20_001), lang: 'en' }));
      expect(response.status).toBe(400);
    });

    it('defaults lang to "en" when omitted', async () => {
      const response = await POST(makeRequest({ input: 'x'.repeat(100) }));
      expect(response.status).toBe(200);
    });

    it('rejects unsupported lang', async () => {
      const response = await POST(
        makeRequest({ input: 'x'.repeat(100), lang: 'xx' }),
      );
      expect(response.status).toBe(400);
    });
  });

  describe('Rate limiting', () => {
    it('returns 429 after exceeding burst limit', async () => {
      const ip = '10.0.0.99';
      const responses: Response[] = [];
      for (let i = 0; i < 7; i++) {
        responses.push(await POST(makeRequest({ input: 'x'.repeat(100) }, ip)));
      }
      const lastStatus = responses[responses.length - 1].status;
      expect([200, 429]).toContain(lastStatus);
      // At least one 429 expected in 7 calls with burst limit of 5
      expect(responses.some((r) => r.status === 429)).toBe(true);
    });
  });

  describe('Response headers', () => {
    it('includes X-RateLimit-Remaining header', async () => {
      const response = await POST(makeRequest({ input: 'x'.repeat(100) }, '10.0.0.50'));
      expect(response.headers.get('X-RateLimit-Remaining')).not.toBeNull();
    });
  });
});
