import { createServerClient } from '@supabase/ssr';
import { logger } from '@/app/lib/logger';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Open Redirect prevention — only allow relative paths or known origins
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_BASE_URL,
  'http://localhost:3000',
].filter(Boolean) as string[];

function getSafeRedirect(raw: string | null): string {
  if (!raw) return '/';
  // Allow relative paths (must start with / and not //)
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  // Allow known origins
  if (ALLOWED_ORIGINS.some((origin) => raw.startsWith(origin))) return raw;
  return '/';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const redirectTo = getSafeRedirect(searchParams.get('redirectTo'));

  if (error) {
    logger.error('OAuth error', { error, errorDescription: errorDescription || undefined });
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, origin));
  }

  if (!code) {
    logger.warn('No authorization code provided to callback');
    return NextResponse.redirect(new URL('/?error=no_code', origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Supabase not configured');
    return NextResponse.redirect(new URL('/?error=config_error', origin));
  }

  try {
    const cookieStore = cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      logger.error('Failed to exchange code for session', { error: sessionError.message });
      return NextResponse.redirect(new URL('/?error=session_error', origin));
    }

    return NextResponse.redirect(new URL(redirectTo, origin));
  } catch (err) {
    logger.error('Callback handler error', { error: String(err) });
    return NextResponse.redirect(new URL('/?error=callback_error', origin));
  }
}
