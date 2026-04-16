import { maskApiKeys, detectApiKeys } from '@/app/lib/api-key-mask';

describe('api-key-mask', () => {
  describe('detectApiKeys', () => {
    it('detects Anthropic keys', () => {
      expect(detectApiKeys('my key is sk-ant-api03-abc123xyz4567890abcdef')).toBe(true);
    });
    it('detects OpenAI keys', () => {
      expect(detectApiKeys('token: sk-proj-abcdef1234567890abcdefghi here')).toBe(true);
    });
    it('detects Supabase service role tokens (eyJ JWT)', () => {
      expect(detectApiKeys('jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc1234567.xyz1234567')).toBe(true);
    });
    it('detects GitHub tokens', () => {
      expect(detectApiKeys('github_pat_11ABCDE_somelongvalueheremore1234567890')).toBe(true);
    });
    it('returns false for plain text', () => {
      expect(detectApiKeys('this is a safe string with no secrets')).toBe(false);
    });
  });

  describe('maskApiKeys', () => {
    it('replaces Anthropic keys with placeholder', () => {
      const out = maskApiKeys('use sk-ant-api03-abc123xyz4567890abcdef for auth');
      expect(out).toContain('[REDACTED_KEY]');
      expect(out).not.toContain('abc123xyz4567890abcdef');
    });
    it('replaces multiple keys on one line', () => {
      const out = maskApiKeys('A: sk-proj-aaa1112222333344abcdefg B: sk-ant-api03-bbb222333444555666');
      expect(out.match(/\[REDACTED_KEY\]/g)?.length).toBe(2);
    });
    it('leaves placeholder strings untouched', () => {
      expect(maskApiKeys('ANTHROPIC_API_KEY=sk-your-key-here')).toBe('ANTHROPIC_API_KEY=sk-your-key-here');
    });
  });
});
