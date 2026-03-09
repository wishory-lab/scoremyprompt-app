/**
 * @jest-environment node
 */

const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockRange = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/app/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => {
    const chain = {
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      range: mockRange,
    };

    mockSelect.mockReturnValue(chain);
    mockEq.mockReturnValue(chain);
    mockOrder.mockReturnValue(chain);
    mockRange.mockReturnValue(chain);
    mockFrom.mockReturnValue(chain);

    return {
      from: mockFrom,
      auth: { getUser: mockGetUser },
    };
  }),
}));

import { GET } from '@/app/api/history/route';

function makeRequest(params: Record<string, string> = {}, token?: string): Request {
  const url = new URL('http://localhost:3000/api/history');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new Request(url.toString(), { headers });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/history', () => {
  it('returns 401 without auth header', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid' } });

    const res = await GET(makeRequest({}, 'invalid-token'));
    expect(res.status).toBe(401);
  });

  it('returns empty results on no data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    // count query
    mockEq.mockResolvedValueOnce({ count: 0, error: null });
    // data query
    mockRange.mockResolvedValueOnce({ data: [], error: null });

    const res = await GET(makeRequest({}, 'valid-token'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.analyses).toEqual([]);
    expect(json.total).toBe(0);
    expect(json.hasMore).toBe(false);
  });

  it('accepts sort and pagination parameters', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

    // count query
    mockEq.mockResolvedValueOnce({ count: 25, error: null });
    // data query
    mockRange.mockResolvedValueOnce({
      data: [
        { id: '1', created_at: '2024-01-15T00:00:00Z', prompt_preview: 'Test prompt', overall_score: 75, grade: 'B', job_role: 'Marketing', result_json: null },
      ],
      error: null,
    });

    const res = await GET(makeRequest({ sort: 'highest', page: '1', limit: '10' }, 'valid-token'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(25);
    expect(json.hasMore).toBe(true);
    expect(json.analyses.length).toBe(1);
  });
});
