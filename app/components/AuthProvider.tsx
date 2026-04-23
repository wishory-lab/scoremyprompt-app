'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/app/lib/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Tier } from '@/app/types';
import { trackSignupCompleted } from '@/app/lib/analytics';
import { TRIAL_DURATION_MS } from '@/app/constants';

interface TrialState {
  active: boolean;
  used: boolean;
  expiresAt: number | null; // timestamp ms
}

interface AuthContextValue {
  user: User | null;
  tier: Tier;
  /** Effective tier considering active trial */
  effectiveTier: Tier;
  supabase: SupabaseClient | null;
  loading: boolean;
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  authMessage: string;
  setAuthMessage: (msg: string) => void;
  signOut: () => Promise<void>;
  trial: TrialState;
  activateTrial: () => Promise<boolean>;
}

const DEFAULT_TRIAL: TrialState = { active: false, used: false, expiresAt: null };

const AuthContext = createContext<AuthContextValue>({
  user: null,
  tier: 'guest',
  effectiveTier: 'guest',
  supabase: null,
  loading: true,
  showAuth: false,
  setShowAuth: () => {},
  authMessage: '',
  setAuthMessage: () => {},
  signOut: async () => {},
  trial: DEFAULT_TRIAL,
  activateTrial: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => getSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>('guest');
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [trial, setTrial] = useState<TrialState>(DEFAULT_TRIAL);
  const hasTrackedSignup = useRef(false);

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
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchTier(session.user.id);
          // Track signup completion for new sign-ins (magic link or OAuth)
          if (event === 'SIGNED_IN' && !hasTrackedSignup.current) {
            hasTrackedSignup.current = true;
            const method = session.user.app_metadata?.provider || 'email';
            trackSignupCompleted({ method });
          }
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
        .select('tier, trial_activated_at, trial_used')
        .eq('id', userId)
        .single();

      const userTier = error || !data ? 'guest' : data.tier || 'free';
      setTier(userTier as Tier);

      // Update trial state
      if (data?.trial_activated_at) {
        const activatedMs = new Date(data.trial_activated_at).getTime();
        const expiresAt = activatedMs + TRIAL_DURATION_MS;
        const isActive = Date.now() < expiresAt;
        setTrial({ active: isActive, used: !!data.trial_used, expiresAt });

        // Auto-expire trial after timeout
        if (isActive) {
          const remaining = expiresAt - Date.now();
          const timer = setTimeout(() => {
            setTrial(prev => ({ ...prev, active: false }));
          }, remaining);
          return () => clearTimeout(timer);
        }
      } else {
        setTrial({ active: false, used: !!data?.trial_used, expiresAt: null });
      }
    } catch (err) {
      console.error('Failed to fetch user tier:', err);
      setTier('guest');
    }
    setLoading(false);
  }

  async function activateTrial(): Promise<boolean> {
    if (!supabase || !user) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const res = await fetch('/api/trial/activate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) return false;

      const data = await res.json();
      const expiresAt = new Date(data.expires_at).getTime();
      setTrial({ active: true, used: true, expiresAt });

      // Auto-expire
      const remaining = expiresAt - Date.now();
      setTimeout(() => {
        setTrial(prev => ({ ...prev, active: false }));
      }, remaining);

      return true;
    } catch {
      return false;
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setTier('guest');
    setTrial(DEFAULT_TRIAL);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tier,
        effectiveTier: trial.active && tier === 'free' ? 'premium' : tier,
        supabase,
        loading,
        showAuth,
        setShowAuth,
        authMessage,
        setAuthMessage,
        signOut: handleSignOut,
        trial,
        activateTrial,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
