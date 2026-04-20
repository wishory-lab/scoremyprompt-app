'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { useAuth } from './AuthProvider';
import { useTranslation } from '@/app/i18n';
import { trackSignupInitiated, trackExitIntentShown, trackExitIntentCTA } from '../lib/analytics';

const STORAGE_KEY = 'smp_exit_intent_shown';
const DELAY_MS = 5000; // Don't trigger within first 5s

/**
 * Exit-Intent Modal — detects when the user is about to leave (desktop: mouse exits viewport top,
 * mobile: back button / visibility change after engagement) and shows a CTA.
 * Only appears once per session for non-authenticated guests.
 */
export default function ExitIntentModal() {
  const { user, setShowAuth, setAuthMessage } = useAuth();
  const t = useTranslation();
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  // Arm the trigger after a delay so it doesn't fire immediately
  useEffect(() => {
    if (user) return; // logged-in users don't need this
    const timer = setTimeout(() => setReady(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [user]);

  const handleExit = useCallback(() => {
    if (!ready) return;
    if (user) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch { /* SSR / private browsing */ }
    setShow(true);
    trackExitIntentShown();
  }, [ready, user]);

  // Desktop: mouse leaves viewport from the top
  useEffect(() => {
    if (!ready || user) return;
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) handleExit();
    };
    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, [ready, user, handleExit]);

  // Mobile: page visibility change (user switching tabs / pressing back)
  useEffect(() => {
    if (!ready || user) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleExit();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [ready, user, handleExit]);

  const handleCTA = () => {
    setShow(false);
    setAuthMessage(t.auth.signInFeatures);
    setShowAuth(true);
    trackSignupInitiated({ source: 'exit_intent' });
    trackExitIntentCTA();
  };

  const handleDismiss = () => setShow(false);

  if (!show) return null;

  return (
    <Modal isOpen={show} onClose={handleDismiss} title={t.exitIntent.title}>
      <div className="text-center px-2 py-4">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-3xl">&#9889;</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          {t.exitIntent.title}
        </h2>
        <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
          {t.exitIntent.subtitle}
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-8">
          <div>
            <p className="text-xl font-bold text-primary">5,000+</p>
            <p className="text-xs text-gray-500">{t.exitIntent.promptsScored}</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-accent">30s</p>
            <p className="text-xs text-gray-500">{t.exitIntent.averageTime}</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-success">Free</p>
            <p className="text-xs text-gray-500">{t.exitIntent.noCardNeeded}</p>
          </div>
        </div>

        {/* CTA buttons */}
        <button
          onClick={handleCTA}
          className="btn-primary w-full text-base font-semibold mb-3"
        >
          {t.form.scoreFree}
        </button>
        <button
          onClick={handleDismiss}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          {t.exitIntent.noThanks}
        </button>
      </div>
    </Modal>
  );
}
