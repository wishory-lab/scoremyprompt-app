'use client';

import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/app/hooks/useNetworkStatus';

/**
 * Persistent banner shown when user is offline.
 * Auto-dismisses when back online with a success toast via parent.
 */
export default function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else {
      setShowBanner(false);
      if (wasOffline) {
        setShowReconnected(true);
        setWasOffline(false);
        // Auto-hide reconnection message after 3s
        const timer = setTimeout(() => setShowReconnected(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, wasOffline]);

  if (!showBanner && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        showBanner
          ? 'bg-red-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}
      role="alert"
      aria-live="assertive"
    >
      {showBanner ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M8.464 15.536a5 5 0 010-7.072" />
          </svg>
          오프라인 상태입니다. 일부 기능이 작동하지 않을 수 있습니다.
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 13l4 4L19 7" />
          </svg>
          다시 연결되었습니다!
        </span>
      )}
    </div>
  );
}
