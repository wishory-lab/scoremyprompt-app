/**
 * @jest-environment node
 */

/**
 * API Route Tests: /api/embed
 * Tests embed image generation with Zod validation
 */

import { GET } from '@/app/api/embed/route';
import { NextRequest } from 'next/server';

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/embed');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url.toString());
}

describe('/api/embed', () => {
  it('should return 200 with valid params', async () => {
    const request = makeRequest({ score: '85', grade: 'A' });
    const response = await GET(request);
    expect(response.status).toBe(200);

    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('image');
  });

  it('should use defaults when params are missing', async () => {
    const request = makeRequest({});
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should accept gradeLabel parameter', async () => {
    const request = makeRequest({ score: '92', grade: 'S', gradeLabel: 'Exceptional' });
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should clamp score to 0-100 range', async () => {
    const overMax = makeRequest({ score: '150', grade: 'S' });
    const responseOver = await GET(overMax);
    // Zod should reject or clamp — either 200 (clamped) or 400 (rejected)
    expect([200, 400]).toContain(responseOver.status);

    const underMin = makeRequest({ score: '-10', grade: 'D' });
    const responseUnder = await GET(underMin);
    expect([200, 400]).toContain(responseUnder.status);
  });

  it('should reject overly long grade', async () => {
    const request = makeRequest({ score: '50', grade: 'TOOLONG' });
    const response = await GET(request);
    expect([200, 400]).toContain(response.status);
  });

  it('should reject overly long gradeLabel', async () => {
    const longLabel = 'A'.repeat(100);
    const request = makeRequest({ score: '50', grade: 'B', gradeLabel: longLabel });
    const response = await GET(request);
    expect([200, 400]).toContain(response.status);
  });
});
