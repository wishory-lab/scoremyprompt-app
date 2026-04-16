/**
 * @jest-environment node
 */

import { POST } from '@/app/api/builder/generate/route';

function makeRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request('http://localhost:3000/api/builder/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '10.1.0.1',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  role: 'Marketer',
  goals: ['weekly_research'],
  tone: 'Friendly',
  tools: ['web_search'],
  automation: 'semi_auto',
  lang: 'en',
};

describe('/api/builder/generate', () => {
  describe('auth', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(401);
    });
  });

  describe('validation (authenticated mock)', () => {
    it('returns 400 when role is missing', async () => {
      const { role: _role, ...bad } = validBody;
      const res = await POST(makeRequest(bad, { 'x-mock-user-id': 'user-val-1' }));
      expect(res.status).toBe(400);
      expect((await res.json()).code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when goals array is empty', async () => {
      const res = await POST(
        makeRequest({ ...validBody, goals: [] }, { 'x-mock-user-id': 'user-val-2' }),
      );
      expect(res.status).toBe(400);
    });
  });

  describe('mock mode success', () => {
    it('returns 200 with id, files, quota, expiresAt', async () => {
      const res = await POST(makeRequest(validBody, { 'x-mock-user-id': 'user-ok-1' }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('files');
      expect(data).toHaveProperty('quota');
      expect(data).toHaveProperty('expiresAt');
      expect(data.files['CLAUDE.md']).toBeDefined();
      expect(typeof data.files['CLAUDE.md']).toBe('string');
    });

    it('file map passes structural validation', async () => {
      const res = await POST(makeRequest(validBody, { 'x-mock-user-id': 'user-ok-2' }));
      const data = await res.json();
      expect(data.files['CLAUDE.md']).toMatch(/Routing Rules/);
      const agentCount = Object.keys(data.files).filter((k: string) => k.startsWith('/agents/')).length;
      expect(agentCount).toBeGreaterThanOrEqual(2);
    });
  });
});
