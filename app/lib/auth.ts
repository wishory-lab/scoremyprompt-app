import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Tier, UserProfile } from '../types';

export async function getUser(supabase: SupabaseClient | null): Promise<User | null> {
  if (!supabase) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}

export async function signInWithMagicLink(
  supabase: SupabaseClient | null,
  email: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_APP_URL || '',
      },
    });
    return { error: error ? error.message : null };
  } catch (err: unknown) {
    console.error('Magic link sign-in error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to send magic link' };
  }
}

export async function signInWithGoogle(
  supabase: SupabaseClient | null
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_APP_URL || '',
      },
    });
    return { error: error ? error.message : null };
  } catch (err: unknown) {
    console.error('Google sign-in error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to sign in with Google' };
  }
}

export async function signOut(
  supabase: SupabaseClient | null
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: unknown) {
    console.error('Sign-out error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to sign out' };
  }
}

export async function getUserTier(supabase: SupabaseClient | null): Promise<Tier> {
  if (!supabase) return 'guest';

  try {
    const user = await getUser(supabase);
    if (!user) return 'guest';

    const { data, error } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.warn('Could not fetch user tier:', error);
      return 'free';
    }

    return (data.tier as Tier) || 'free';
  } catch (err) {
    console.error('Error fetching user tier:', err);
    return 'guest';
  }
}

export async function getUserProfile(supabase: SupabaseClient | null): Promise<UserProfile | null> {
  if (!supabase) return null;

  try {
    const user = await getUser(supabase);
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.warn('Could not fetch user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function updateDailyCount(
  supabase: SupabaseClient | null,
  userId: string
): Promise<{ error: string | null; analyses_today: number }> {
  if (!supabase || !userId) {
    return { error: 'Invalid parameters', analyses_today: 0 };
  }

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('analyses_today, last_analysis_date')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.warn('Could not fetch profile for update:', fetchError);
      return { error: 'Profile not found', analyses_today: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile.last_analysis_date
      ? new Date(profile.last_analysis_date).toISOString().split('T')[0]
      : null;

    const isNewDay = lastDate !== today;
    const newCount = isNewDay ? 1 : (profile.analyses_today || 0) + 1;

    const { data, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        analyses_today: newCount,
        last_analysis_date: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('analyses_today')
      .single();

    if (updateError || !data) {
      console.error('Failed to update daily count:', updateError);
      return { error: updateError?.message || 'Update failed', analyses_today: 0 };
    }

    return { error: null, analyses_today: data.analyses_today };
  } catch (err: unknown) {
    console.error('Error updating daily count:', err);
    return { error: err instanceof Error ? err.message : 'Failed to update count', analyses_today: 0 };
  }
}
