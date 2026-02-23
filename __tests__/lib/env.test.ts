// Reset module cache between tests so cached env values are cleared
beforeEach(() => {
  jest.resetModules();
});

describe('getEnvStatus', () => {
  it('returns true for supabase when both URL and anon key are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    const { getEnvStatus } = await import('@/app/lib/env');
    const status = getEnvStatus();

    expect(status.supabase).toBe(true);
    expect(status.supabaseAdmin).toBe(true);
    expect(status.anthropic).toBe(true);
    expect(status.stripe).toBe(true);
  });

  it('returns false when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const { getEnvStatus } = await import('@/app/lib/env');
    const status = getEnvStatus();

    expect(status.supabase).toBe(false);
    expect(status.supabaseAdmin).toBe(false);
    expect(status.anthropic).toBe(false);
    expect(status.stripe).toBe(false);
  });

  it('returns fallback baseUrl when NEXT_PUBLIC_BASE_URL is unset', async () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;

    const { getEnvStatus } = await import('@/app/lib/env');
    const status = getEnvStatus();

    expect(status.baseUrl).toBe('http://localhost:3000');
  });

  it('returns configured baseUrl when set', async () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://scoremyprompt.com';

    const { getEnvStatus } = await import('@/app/lib/env');
    const status = getEnvStatus();

    expect(status.baseUrl).toBe('https://scoremyprompt.com');
  });
});

describe('requireEnv', () => {
  it('returns value when env var exists', async () => {
    process.env.TEST_VAR = 'hello';

    const { requireEnv } = await import('@/app/lib/env');
    expect(requireEnv('TEST_VAR')).toBe('hello');

    delete process.env.TEST_VAR;
  });

  it('throws when env var is missing', async () => {
    delete process.env.MISSING_VAR;

    const { requireEnv } = await import('@/app/lib/env');
    expect(() => requireEnv('MISSING_VAR')).toThrow('Missing required environment variable: MISSING_VAR');
  });
});

describe('getServerEnv', () => {
  it('parses server environment with Zod schema', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';

    const { getServerEnv } = await import('@/app/lib/env');
    const env = getServerEnv();

    expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-test');
    expect(env.NODE_ENV).toBe('test'); // jest sets NODE_ENV=test
  });

  it('returns undefined for optional vars when not set', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { getServerEnv } = await import('@/app/lib/env');
    const env = getServerEnv();

    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });
});
