'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackCookieConsent } from '@/app/lib/analytics';

const CONSENT_KEY = 'smp_cookie_consent';
type ConsentChoice = 'accepted' | 'rejected' | 'essential-only';

interface ConsentState {
  choice: ConsentChoice;
  timestamp: string;
  version: 1;
}

function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    const state: ConsentState = { choice, timestamp: new Date().toISOString(), version: 1 };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));

    // Signal to analytics providers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: state }));

      // Enable/disable PostHog based on consent
      if (choice === 'accepted') {
        window.posthog?.opt_in_capturing?.();
      } else if (choice === 'rejected' || choice === 'essential-only') {
        window.posthog?.opt_out_capturing?.();
      }
    }
  } catch {
    // localStorage unavailable
  }
}

/**
 * Hook to check cookie consent status
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(getConsent());
  }, []);

  return {
    consent,
    hasConsented: consent !== null,
    isAnalyticsAllowed: consent?.choice === 'accepted',
  };
}

/**
 * GDPR/CCPA compliant cookie consent banner.
 * Shows once until user makes a choice, persisted in localStorage.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay showing to avoid layout shift on first paint
    const timer = setTimeout(() => {
      if (!getConsent()) setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = useCallback(() => {
    saveConsent('accepted');
    trackCookieConsent({ choice: 'all' });
    setVisible(false);
  }, []);

  const handleEssentialOnly = useCallback(() => {
    saveConsent('essential-only');
    trackCookieConsent({ choice: 'essential' });
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 sm:p-0"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-desc"
    >
      <div className="mx-auto max-w-2xl sm:mb-4 rounded-xl border border-white/10 bg-surface/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <p id="cookie-desc" className="text-sm text-gray-300 leading-relaxed">
          We use cookies and analytics to improve your experience and understand how the tool is used.
          Essential cookies are always active. You can choose to allow analytics or use essential cookies only.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-dark"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 text-gray-300 hover:text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-dark"
          >
            Essential Only
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          <a href="/privacy" className="underline hover:text-gray-300 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
