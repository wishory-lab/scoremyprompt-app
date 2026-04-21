'use client';

import { useEffect, useState, useCallback } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        setIsOnline(true);
        // Short delay so user sees the "back online" state before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      }
    } catch {
      // Still offline
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [checkConnection]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          {isOnline ? (
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
              className="text-green-400"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
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
              className="text-primary"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          )}
        </div>

        {isOnline ? (
          <>
            <h1 className="text-2xl font-bold text-green-400 mb-3">
              다시 연결되었습니다!
            </h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              연결이 복구되었습니다. 돌아가는 중&hellip;
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">
              오프라인 상태입니다
            </h1>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              ScoreMyPrompt는 프롬프트 분석을 위해 인터넷 연결이 필요합니다.
              온라인으로 돌아오면 자동으로 다시 연결됩니다.
            </p>

            {/* Tips card */}
            <div className="bg-dark-card border border-border rounded-xl p-5 mb-8 text-left">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-3">
                기다리는 동안
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="shrink-0 text-primary">•</span>
                  Wi-Fi 또는 모바일 데이터 연결을 확인하세요
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-primary">•</span>
                  라우터에 가까이 이동해 보세요
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 text-primary">•</span>
                  문제가 지속되면 네트워크를 재시작해 보세요
                </li>
              </ul>
            </div>

            <button
              onClick={checkConnection}
              disabled={checking}
              className="btn-primary font-semibold disabled:opacity-60"
            >
              {checking ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  확인 중…
                </span>
              ) : (
                '다시 시도'
              )}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
