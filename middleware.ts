import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PAGES = ['/dashboard', '/history', '/compare', '/pro'];

// API routes that require Authorization header
const PROTECTED_API_ROUTES = ['/api/analyze-bulk', '/api/export'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Add X-Request-Id to all API requests
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Request-Id', crypto.randomUUID());
  }

  // Check protected pages — use cookie-based session detection
  if (PROTECTED_PAGES.some((route) => pathname.startsWith(route))) {
    // Supabase stores the session in cookies with this pattern
    const hasSession =
      request.cookies.has('sb-access-token') ||
      request.cookies.has('sb-refresh-token') ||
      // Supabase v2 PKCE cookies use a project-ref based name
      Array.from(request.cookies.getAll()).some(
        (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
      );

    if (!hasSession) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('auth', 'required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check protected API routes for Authorization header
  if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicon files)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
