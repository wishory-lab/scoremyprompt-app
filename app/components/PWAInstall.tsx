'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackPWAInstallPrompted, trackPWAInstalled } from '../lib/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SW_STORAGE_KEY = 'smp_pwa_dismissed';

/**
 * PWAInstall — Registers the service worker, shows an install prompt banner,
 * and notifies users when a new SW version is ready.
 */
export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  // Register service worker + detect updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for waiting SW on load (e.g. user returns to tab)
      if (registration.waiting) {
        setWaitingSW(registration.waiting);
        setShowUpdate(true);
      }

      // Detect new SW installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version ready — show update banner
            setWaitingSW(newWorker);
            setShowUpdate(true);
          }
        });
      });
    }).catch(() => {
      // SW registration failed — non-critical
    });

    // Reload when new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SW_STORAGE_KEY)) return;
    } catch { /* empty */ }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay so it doesn't block first paint
      setTimeout(() => {
        setShowBanner(true);
        trackPWAInstallPrompted();
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      trackPWAInstalled();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try { sessionStorage.setItem(SW_STORAGE_KEY, '1'); } catch { /* empty */ }
  };

  const handleUpdate = useCallback(() => {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdate(false);
  }, [waitingSW]);

  // Update banner — takes priority
  if (showUpdate) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slide-up">
        <div className="bg-surface border border-primary/30 rounded-lg p-4 shadow-lg flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-primary flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">업데이트 가능</p>
            <p className="text-xs text-gray-400 mt-0.5">ScoreMyPrompt 새 버전이 준비되었습니다</p>
            <button
              onClick={handleUpdate}
              className="text-xs font-semibold px-3 py-1.5 mt-3 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
            >
              지금 업데이트
            </button>
          </div>
          <button
            onClick={() => setShowUpdate(false)}
            className="text-gray-500 hover:text-gray-300 flex-shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-surface border border-border rounded-lg p-4 shadow-lg flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">ScoreMyPrompt 설치</p>
          <p className="text-xs text-gray-400 mt-0.5">홈 화면에 추가하여 빠르게 접근하세요</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="text-xs font-semibold px-3 py-1.5 bg-primary text-white rounded-md hover:opacity-90 transition-opacity"
            >
              설치
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2"
            >
              나중에
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-300 flex-shrink-0" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
}
