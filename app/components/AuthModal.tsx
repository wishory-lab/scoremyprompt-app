'use client';

import { useState } from 'react';
import { signInWithMagicLink, signInWithGoogle } from '@/app/lib/auth';
import { useAuth } from './AuthProvider';
import { useTranslation } from '@/app/i18n';
import Modal from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const { supabase } = useAuth();
  const t = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t.validation.emailEmpty);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.validation.emailInvalid);
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithMagicLink(supabase, email);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError(t.errors.generic);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle(supabase);
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(t.errors.generic);
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.auth.signInTitle}
      titleId="auth-modal-title"
    >
      {!success ? (
        <>
          <div className="mb-8">
            <h2 id="auth-modal-title" className="text-2xl font-bold text-white mb-2">
              {t.auth.signInTitle}
            </h2>
            {message && (
              <p className="text-gray-400 text-sm">{message}</p>
            )}
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4 mb-6">
            <div>
              <label htmlFor="auth-email" className="sr-only">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="your@email.com"
                className="input-field"
                disabled={loading}
                autoComplete="email"
                aria-describedby={error ? 'auth-email-error' : undefined}
              />
            </div>

            {error && (
              <p id="auth-email-error" className="text-sm text-red-400" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.auth.sending}
                </>
              ) : (
                t.auth.sendMagicLink
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-gray-400">{t.auth.or}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t.auth.continueWithGoogle}
          </button>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-gray-400 text-center">
              {t.auth.magicLinkHint}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.auth.checkEmailTitle}</h3>
          <p className="text-gray-400 text-sm">
            {t.auth.checkEmailDesc}
          </p>
          <button
            onClick={() => { setSuccess(false); onClose(); }}
            className="mt-6 text-primary hover:text-accent transition-colors text-sm font-medium"
          >
            {t.auth.close}
          </button>
        </div>
      )}
    </Modal>
  );
}
