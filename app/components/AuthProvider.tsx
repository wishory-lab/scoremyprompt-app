'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/app/lib/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Tier } from '@/app/types';

interface AuthContextValue {
  user: User | null;
  tier: Tier;
  supabase: SupabaseClient | null;
  loading: boolean;
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  authMessage: string;
  setAuthMessage: (msg: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  tier: 'guest',
  supabase: null,
  loading: true,
  showAuth: false,
  setShowAuth: () => {},
  authMessage: '',
  setAuthMessage: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => getSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>('guest');
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTier(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to get auth session:', err);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchTier(session.user.id);
        } else {
          setTier('guest');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function fetchTier(userId: string) {
    if (!supabase) {
      console.error('Supabase client not available, falling back to guest tier');
      setTier('guest');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', userId)
        .single();

      setTier(error || !data ? 'guest' : data.tier || 'free');
    } catch (err) {
      console.error('Failed to fetch user tier:', err);
      setTier('guest');
    }
    setLoading(false);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setTier('guest');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        supabase,
        loading,
        showAuth,
        setShowAuth,
        authMessage,
        setAuthMessage,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
