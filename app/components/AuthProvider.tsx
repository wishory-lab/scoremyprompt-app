'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '@/app/lib/supabase';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Tier } from '@/app/types';
import { trackSignupCompleted } from '@/app/lib/analytics';
import { TRIAL_DURATION_MS } from '@/app/constants';

interface TrialState {
  active: boolean;
  used: boolean;
  expiresAt: number | null;
}

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
  trial?: TrialState;
  activateTrial?: () => Promise<boolean>;
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
  const [trial, setTrial] = useState<TrialState>({ active: false, used: false, expiresAt: null });
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

      if (error || !data) {
        setTier('guest');
      } else {
        // Calculate effective tier (trial gives temporary pro access)
        const baseTier: Tier = data.tier || 'free';
        let trialActivatedAt = data.trial_activated_at ? new Date(data.trial_activated_at).getTime() : null;
        let trialUsed = data.trial_used ?? false;

        // Auto-activate 30-day trial for new signups (first login, trial not yet used)
        if (!trialActivatedAt && !trialUsed && baseTier === 'free') {
          try {
            const now = new Date();
            const { error: updateErr } = await supabase
              .from('user_profiles')
              .update({ trial_activated_at: now.toISOString(), trial_used: true })
              .eq('id', userId);
            if (!updateErr) {
              trialActivatedAt = now.getTime();
              trialUsed = true;
            }
          } catch { /* silently continue */ }
        }

        const trialExpiresAt = trialActivatedAt ? trialActivatedAt + TRIAL_DURATION_MS : null;
        const trialActive = trialExpiresAt ? Date.now() < trialExpiresAt : false;

        setTrial({
          active: trialActive,
          used: trialUsed,
          expiresAt: trialExpiresAt,
        });

        // During active trial, treat user as 'pro' tier
        if (trialActive && baseTier === 'free') {
          setTier('pro');
        } else {
          setTier(baseTier);
        }
      }
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
    setTrial({ active: false, used: false, expiresAt: null });
  }

  const activateTrial = useCallback(async (): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      const res = await fetch('/api/trial/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) return false;

      const result = await res.json();
      const expiresAt = new Date(result.expires_at).getTime();

      setTrial({ active: true, used: true, expiresAt });
      setTier('pro'); // Upgrade to pro during trial

      return true;
    } catch (err) {
      console.error('Failed to activate trial:', err);
      return false;
    }
  }, [supabase, user]);

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
