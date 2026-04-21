'use client';

import { useEffect, useState, useCallback } from 'react';

const AUTO_REFRESH_SECONDS = 30;

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          window.location.href = '/';
          return;
        }
      }
    } catch {
      // Still in maintenance
    } finally {
      setChecking(false);
      setCountdown(AUTO_REFRESH_SECONDS);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkHealth();
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [checkHealth]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Animated gear icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400 animate-spin"
              style={{ animationDuration: '3s' }}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            곧 돌아오겠습니다
          </h1>
          <p className="text-gray-400 text-base mb-8 leading-relaxed">
            ScoreMyPrompt가 더 나은 경험을 위해 정기 점검 중입니다.
            곧 다시 이용하실 수 있습니다.
          </p>

          {/* Status card */}
          <div className="bg-dark-card border border-border rounded-xl p-5 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm text-amber-400 font-medium">
                점검 진행 중
              </span>
            </div>
            <p className="text-gray-400 text-xs">
              자동 확인까지{' '}
              <span className="text-white font-mono font-semibold">{countdown}초</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={checkHealth}
              disabled={checking}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {checking ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  확인 중…
                </span>
              ) : (
                '지금 확인'
              )}
            </button>
            <a
              href="https://x.com/scoremyprompt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              업데이트 팔로우
            </a>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-6 text-center text-xs text-gray-500">
        ScoreMyPrompt &middot; 기다려 주셔서 감사합니다
      </footer>
    </div>
  );
}
