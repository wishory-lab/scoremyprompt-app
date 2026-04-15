'use client';

import { useEffect, useState } from 'react';
import { useCookieConsent } from './CookieConsent';

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type AdSlot = 'leaderboard' | 'rectangle';

interface AdBannerProps {
  slot?: AdSlot;
  className?: string;
  isPro?: boolean;
}

export default function AdBanner({ slot = 'leaderboard', className = '', isPro = false }: AdBannerProps) {
  const [isClient, setIsClient] = useState(false);
  const { isAnalyticsAllowed, hasConsented } = useCookieConsent();

  const adSlots = {
    leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD || '',
    rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE || '',
  };

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const hasValidSlot = !!adSlots[slot];
  // Require explicit "Accept all" consent before loading AdSense (GDPR).
  const shouldShow = isClient && adsenseId && !isPro && hasValidSlot && isAnalyticsAllowed;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [shouldShow]);

  if (!isClient || !adsenseId || isPro) {
    return null;
  }

  // Show a neutral placeholder instead of AdSense while consent is pending or declined.
  if (!isAnalyticsAllowed) {
    const placeholderMsg = hasConsented
      ? 'Ads disabled — accept all cookies to support free tier.'
      : 'Ads will load after cookie consent.';
    return (
      <div
        className={`flex items-center justify-center min-h-[90px] rounded-lg border border-border bg-surface/30 text-xs text-gray-500 ${className}`}
      >
        {placeholderMsg}
      </div>
    );
  }

  if (!hasValidSlot) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center"
          style={{
            width: slot === 'rectangle' ? '336px' : '100%',
            height: slot === 'rectangle' ? '280px' : '90px',
          }}
        >
          <p className="text-xs text-gray-500">Ad Slot: {slot}</p>
          <p className="text-xs text-gray-600 mt-1">(Missing NEXT_PUBLIC_ADSENSE_ID)</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: slot === 'rectangle' ? '280px' : '90px',
        }}
        data-ad-client={adsenseId}
        data-ad-slot={adSlots[slot]}
        data-ad-format={slot === 'rectangle' ? 'auto' : 'horizontal'}
        data-full-width-responsive="true"
      />

      {/* "Remove ads" link */}
      <a
        href="/pricing"
        className="mt-3 text-xs text-gray-500 hover:text-gray-400 transition-colors"
      >
        Remove ads → Go Pro
      </a>
    </div>
  );
}
