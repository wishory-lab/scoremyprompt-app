'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { useAuth } from './AuthProvider';
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
    setAuthMessage('Create a free account to save your scores and track progress.');
    setShowAuth(true);
    trackSignupInitiated({ source: 'exit_intent' });
    trackExitIntentCTA();
  };

  const handleDismiss = () => setShow(false);

  if (!show) return null;

  return (
    <Modal isOpen={show} onClose={handleDismiss} title="Exit Intent">
      <div className="text-center px-2 py-4">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-3xl">&#9889;</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Wait — don&apos;t leave yet!
        </h2>
        <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
          You haven&apos;t scored a prompt yet. It takes 30 seconds and it&apos;s completely free. See how your AI skills compare with other professionals.
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-8">
          <div>
            <p className="text-xl font-bold text-primary">5,000+</p>
            <p className="text-xs text-gray-500">Prompts scored</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-accent">30s</p>
            <p className="text-xs text-gray-500">Average time</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-xl font-bold text-success">Free</p>
            <p className="text-xs text-gray-500">No card needed</p>
          </div>
        </div>

        {/* CTA buttons */}
        <button
          onClick={handleCTA}
          className="btn-primary w-full text-base font-semibold mb-3"
        >
          Score My Prompt — Free
        </button>
        <button
          onClick={handleDismiss}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          No thanks, I&apos;ll pass
        </button>
      </div>
    </Modal>
  );
}
