'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n';

interface UpgradeBannerProps {
  used: number;
  limit: number;
  tier?: string;
  showAdPrompt?: boolean;
  onDismiss?: () => void;
  onWatchAd?: () => void;
}

export default function UpgradeBanner({
  used,
  limit,
  tier = 'free',
  showAdPrompt = false,
  onDismiss,
  onWatchAd,
}: UpgradeBannerProps) {
  const t = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  // Show when used >= limit - 1
  const shouldShow = used >= limit - 1;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!shouldShow || !isVisible) {
    return null;
  }

  const progressPercent = (used / limit) * 100;
  const isExhausted = used >= limit;

  return (
    <div className="card bg-gradient-to-r from-primary/5 via-surface to-accent/5 border-primary/60 relative overflow-hidden mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {isExhausted
                ? t.upgrade.usedAll
                : t.upgrade.usedSome.replace('{used}', String(used)).replace('{limit}', String(limit))}
            </h3>

            <p className="text-gray-400 text-sm mb-4">
              {tier === 'guest'
                ? t.upgrade.signUpBonus
                : showAdPrompt
                  ? t.upgrade.watchAdGuest
                  : t.upgrade.upgradeHint}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-700/40 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {tier === 'guest' ? (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                >
                  {t.upgrade.signUpFree}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  {showAdPrompt && onWatchAd && (
                    <button
                      onClick={onWatchAd}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/15 transition-colors duration-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.upgrade.watchAd}
                    </button>
                  )}
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200 text-sm"
                  >
                    {t.upgrade.upgradePremium}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-2 rounded-lg"
            aria-label="Dismiss upgrade banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
