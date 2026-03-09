/**
 * Tests for /api/admin/stats
 */

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnValue({ count: 100, data: [], error: null }),
};

jest.mock('@/app/lib/supabase', () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

jest.mock('@/app/lib/cache', () => ({
  cacheHeaders: { none: () => ({ 'Cache-Control': 'no-cache' }) },
}));

jest.mock('@/app/lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

import { GET } from '@/app/api/admin/stats/route';

describe('/api/admin/stats', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_SECRET: 'test-secret-123' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 503 when ADMIN_SECRET not configured', async () => {
    delete process.env.ADMIN_SECRET;
    const req = new Request('http://localhost:3000/api/admin/stats');
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it('returns 401 without auth header', async () => {
    const req = new Request('http://localhost:3000/api/admin/stats');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong token', async () => {
    const req = new Request('http://localhost:3000/api/admin/stats', {
      headers: { Authorization: 'Bearer wrong-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid auth', async () => {
    // Setup mock responses for all parallel queries
    mockSupabase.limit.mockReturnValue({ count: 50, data: [], error: null });

    const req = new Request('http://localhost:3000/api/admin/stats', {
      headers: { Authorization: 'Bearer test-secret-123' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.analyses).toBeDefined();
    expect(body.data.users).toBeDefined();
    expect(body.data.system).toBeDefined();
    expect(body.data.system.timestamp).toBeTruthy();
  });
});
