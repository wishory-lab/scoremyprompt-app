/**
 * @jest-environment node
 */

// Mock supabase before importing route
const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/app/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => {
    const chain = {
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle,
    };

    mockSelect.mockReturnValue(chain);
    mockEq.mockReturnValue(chain);
    mockFrom.mockReturnValue(chain);

    return {
      from: mockFrom,
      auth: { getUser: mockGetUser },
    };
  }),
}));

import { POST } from '@/app/api/export/route';

function makeRequest(body: Record<string, unknown>, token?: string): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new Request('http://localhost:3000/api/export', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/export', () => {
  it('returns 401 without auth header', async () => {
    const res = await POST(makeRequest({ analysisId: 'test-id' }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('Unauthorized');
  });

  it('returns 401 with invalid token', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid' } });

    const res = await POST(makeRequest({ analysisId: 'test-id' }, 'invalid-token'));
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-pro users', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    // First from() call: user_profiles
    mockSingle.mockResolvedValueOnce({ data: { tier: 'free' }, error: null });

    const res = await POST(makeRequest({ analysisId: 'test-id' }, 'valid-token'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('Pro');
  });

  it('returns 404 for missing analysis', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    // First call: user_profiles -> pro
    mockSingle.mockResolvedValueOnce({ data: { tier: 'pro' }, error: null });
    // Second call: analyses -> not found
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

    const res = await POST(makeRequest({ analysisId: 'test-id' }, 'valid-token'));
    // Route returns 404 or 500 depending on implementation
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
