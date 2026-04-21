'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/app/i18n';
import { AD_WATCH_SECONDS } from '../constants';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
  authToken: string | null;
}

/**
 * Rewarded Ad Modal
 *
 * YouTube-style popup: shows ad content with a countdown timer.
 * User must wait AD_WATCH_SECONDS before the close button appears.
 * On close, calls /api/ad-reward to grant 1 analysis credit.
 */
export default function RewardedAdModal({
  isOpen,
  onClose,
  onRewardGranted,
  authToken,
}: RewardedAdModalProps) {
  const t = useTranslation();
  const [countdown, setCountdown] = useState(AD_WATCH_SECONDS);
  const [canClose, setCanClose] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown when modal opens
  useEffect(() => {
    if (!isOpen) {
      setCountdown(AD_WATCH_SECONDS);
      setCanClose(false);
      setError(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    setCountdown(AD_WATCH_SECONDS);
    setCanClose(false);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, AD_WATCH_SECONDS - elapsed);
      setCountdown(remaining);

      if (remaining <= 0) {
        setCanClose(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleClaimReward = useCallback(async () => {
    if (!authToken || isGranting) return;

    setIsGranting(true);
    setError(null);

    try {
      const watchDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      const res = await fetch('/api/ad-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          watchDuration,
          sessionToken: crypto.randomUUID(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        onRewardGranted();
        onClose();
      } else {
        setError(data.message || '크레딧 지급에 실패했습니다');
      }
    } catch {
      setError('네트워크 오류입니다. 다시 시도해 주세요.');
    } finally {
      setIsGranting(false);
    }
  }, [authToken, isGranting, onRewardGranted, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">{t.rewardedAd.watchTitle}</span>
          </div>
          {!canClose && (
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="inline-block w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              {countdown}s
            </span>
          )}
        </div>

        {/* Ad Content Area */}
        <div className="p-5">
          {/* Google AdSense slot placeholder — replace with actual ad unit */}
          <div className="relative w-full aspect-video rounded-lg bg-[#1a2332] border border-white/5 flex items-center justify-center overflow-hidden">
            {/* AdSense will render here */}
            <div
              id="smp-rewarded-ad-slot"
              className="w-full h-full flex items-center justify-center"
            >
              {/* Fallback if ad doesn't load */}
              <div className="text-center">
                <div className="text-3xl mb-2">&#x1F680;</div>
                <p className="text-white/40 text-sm">{t.rewardedAd.loadingAd}</p>
                <p className="text-white/20 text-xs mt-1">
                  {t.rewardedAd.supportMessage}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                style={{ width: `${((AD_WATCH_SECONDS - countdown) / AD_WATCH_SECONDS) * 100}%` }}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
          )}
        </div>

        {/* Footer with CTA */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          {canClose ? (
            <button
              onClick={handleClaimReward}
              disabled={isGranting}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
            >
              {isGranting ? t.rewardedAd.granting : t.rewardedAd.claimCredit}
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl text-center text-white/40 bg-white/5 border border-white/10">
              {t.rewardedAd.waitClaim.replace('{countdown}', String(countdown))}
            </div>
          )}

          <button
            onClick={onClose}
            className="text-xs text-white/30 hover:text-white/50 transition-colors text-center py-1"
          >
            {canClose ? t.rewardedAd.skipReward : t.rewardedAd.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
