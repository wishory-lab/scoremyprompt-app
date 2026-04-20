/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function makeRequest(path: string, options?: { token?: string; cookies?: Record<string, string> }): NextRequest {
  const url = `http://localhost:3000${path}`;
  const headers: Record<string, string> = {};
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const req = new NextRequest(url, { headers });

  if (options?.cookies) {
    for (const [name, value] of Object.entries(options.cookies)) {
      req.cookies.set(name, value);
    }
  }

  return req;
}

describe('middleware', () => {
  describe('API routes', () => {
    it('adds X-Request-Id header to API responses', () => {
      const res = middleware(makeRequest('/api/analyze'));
      expect(res.headers.get('X-Request-Id')).toBeTruthy();
    });

    it('returns 401 for protected API routes without auth', () => {
      const routes = ['/api/analyze-bulk', '/api/export', '/api/stripe/checkout', '/api/stripe/portal'];

      for (const route of routes) {
        const res = middleware(makeRequest(route));
        expect(res.status).toBe(401);
      }
    });

    it('allows protected API routes with auth header', () => {
      const res = middleware(makeRequest('/api/analyze-bulk', { token: 'test-token' }));
      // Should not return 401 — passes through to actual route handler
      expect(res.status).not.toBe(401);
    });
  });

  describe('Protected pages', () => {
    it('redirects unauthenticated users from protected pages', () => {
      const protectedPages = ['/dashboard', '/history'];

      for (const page of protectedPages) {
        const res = middleware(makeRequest(page));
        expect(res.status).toBe(307); // redirect
        expect(res.headers.get('Location')).toContain('auth=required');
      }
    });

    it('allows authenticated users to access protected pages', () => {
      const res = middleware(makeRequest('/dashboard', {
        cookies: { 'sb-access-token': 'test' },
      }));
      // Should not redirect
      expect(res.status).not.toBe(307);
    });
  });

  describe('Public routes', () => {
    it('allows unauthenticated access to public routes', () => {
      const publicRoutes = ['/', '/pricing', '/api/analyze', '/api/health'];

      for (const route of publicRoutes) {
        const res = middleware(makeRequest(route));
        expect(res.status).not.toBe(401);
        expect(res.status).not.toBe(307);
      }
    });
  });

  describe('i18n locale extraction', () => {
    it('rewrites /ko/pricing to /pricing with locale cookie', () => {
      const res = middleware(makeRequest('/ko/pricing'));
      // NextResponse.rewrite returns a response with x-middleware-rewrite header
      expect(res.headers.get('Content-Language')).toBe('ko');
      const cookies = res.cookies.getAll();
      const localeCookie = cookies.find((c) => c.name === 'smp_locale');
      expect(localeCookie?.value).toBe('ko');
    });

    it('passes through /pricing without locale prefix', () => {
      const res = middleware(makeRequest('/pricing'));
      expect(res.headers.get('Content-Language')).toBeNull();
    });

    it('rewrites /ja/ to / with ja locale', () => {
      const res = middleware(makeRequest('/ja/'));
      expect(res.headers.get('Content-Language')).toBe('ja');
    });

    it('preserves query params on rewrite', () => {
      const res = middleware(makeRequest('/ko/pricing?reason=builder_quota'));
      expect(res.headers.get('Content-Language')).toBe('ko');
    });
  });
});
