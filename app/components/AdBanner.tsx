'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n';

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
  const t = useTranslation();
  const [isClient, setIsClient] = useState(false);

  const adSlots = {
    leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD || '',
    rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE || '',
  };

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const hasValidSlot = !!adSlots[slot];
  const shouldShow = isClient && adsenseId && !isPro && hasValidSlot;

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
        {t.ad.removeAds}
      </a>
    </div>
  );
}
