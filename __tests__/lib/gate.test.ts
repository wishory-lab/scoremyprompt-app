import { hashIP, getGuestUsageCount, checkGate } from '@/app/lib/gate';
import { TIER_LIMITS } from '@/app/constants';

// Mock Supabase client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockGte = jest.fn();
const mockLt = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();

function createMockSupabase() {
  const chain = {
    select: mockSelect.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    gte: mockGte.mockReturnThis(),
    lt: mockLt.mockReturnThis(),
    single: mockSingle,
  };

  mockSelect.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockGte.mockReturnValue(chain);
  mockLt.mockReturnValue(chain);

  mockFrom.mockReturnValue(chain);

  return { from: mockFrom } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── hashIP ───
describe('hashIP', () => {
  it('returns same hash for same IP', () => {
    const hash1 = hashIP('192.168.1.1');
    const hash2 = hashIP('192.168.1.1');
    expect(hash1).toBe(hash2);
    expect(hash1).toBeTruthy();
  });

  it('returns different hash for different IPs', () => {
    const hash1 = hashIP('192.168.1.1');
    const hash2 = hashIP('10.0.0.1');
    expect(hash1).not.toBe(hash2);
  });

  it('returns empty string for empty input', () => {
    expect(hashIP('')).toBe('');
  });

  it('returns a SHA-256 hex string (64 chars)', () => {
    const hash = hashIP('127.0.0.1');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

// ─── getGuestUsageCount ───
describe('getGuestUsageCount', () => {
  it('returns count from Supabase', async () => {
    const supabase = createMockSupabase();
    mockLt.mockResolvedValue({ count: 5, error: null });

    const result = await getGuestUsageCount(supabase, 'abc123');
    expect(result).toBe(5);
    expect(mockFrom).toHaveBeenCalledWith('analyses');
  });

  it('returns 0 on error', async () => {
    const supabase = createMockSupabase();
    mockLt.mockResolvedValue({ count: null, error: { message: 'DB error' } });

    const result = await getGuestUsageCount(supabase, 'abc123');
    expect(result).toBe(0);
  });

  it('returns 0 when supabase is null', async () => {
    const result = await getGuestUsageCount(null as any, 'abc123');
    expect(result).toBe(0);
  });

  it('returns 0 when ipHash is empty', async () => {
    const supabase = createMockSupabase();
    const result = await getGuestUsageCount(supabase, '');
    expect(result).toBe(0);
  });

  it('returns 0 when count is null', async () => {
    const supabase = createMockSupabase();
    mockLt.mockResolvedValue({ count: null, error: null });

    const result = await getGuestUsageCount(supabase, 'abc123');
    expect(result).toBe(0);
  });
});

// ─── checkGate ───
describe('checkGate', () => {
  it('returns allowed:false when supabase is null', async () => {
    const result = await checkGate(null, 'user1', 'free');
    expect(result.allowed).toBe(false);
    expect(result.message).toBe('Service unavailable');
  });

  it('returns high limit for premium tier', async () => {
    const supabase = createMockSupabase();
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { grace_period_end: null, analyses_today: 0 }, error: null }),
        }),
      }),
    });
    const result = await checkGate(supabase, 'user1', 'premium');
    expect(result.allowed).toBe(true);
  });

  it('guest: allows within limit (3/day)', async () => {
    const supabase = createMockSupabase();
    mockLt.mockResolvedValue({ count: 1, error: null });

    const result = await checkGate(supabase, null, 'guest', { ipHash: 'hash123' });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(TIER_LIMITS.guest - 1);
  });

  it('guest: blocks at limit', async () => {
    const supabase = createMockSupabase();
    mockLt.mockResolvedValue({ count: 3, error: null });

    const result = await checkGate(supabase, null, 'guest', { ipHash: 'hash123' });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('guest: blocks without ipHash', async () => {
    const supabase = createMockSupabase();
    const result = await checkGate(supabase, null, 'guest', {});
    expect(result.allowed).toBe(false);
    expect(result.message).toBe('Cannot determine guest identity');
  });

  it('free: allows within limit (10/day)', async () => {
    const supabase = createMockSupabase();
    mockSingle.mockResolvedValue({ data: { analyses_today: 5 }, error: null });

    const result = await checkGate(supabase, 'user1', 'free');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(TIER_LIMITS.free - 5);
  });

  it('free: blocks at limit', async () => {
    const supabase = createMockSupabase();
    mockSingle.mockResolvedValue({ data: { analyses_today: 10 }, error: null });

    const result = await checkGate(supabase, 'user1', 'free');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.message).toContain('Daily limit');
  });

  it('free: allows when profile fetch fails (defaults to 0 usage)', async () => {
    const supabase = createMockSupabase();
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const result = await checkGate(supabase, 'user1', 'free');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(TIER_LIMITS.free);
  });
});
