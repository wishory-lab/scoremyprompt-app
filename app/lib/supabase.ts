import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Client-side Supabase (public, anon key)
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    logger.warn('Supabase not configured — running without database');
    return null;
  }

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}

// Server-side Supabase (service role key — never expose to client)
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    logger.warn('Supabase admin not configured');
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
