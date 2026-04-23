'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './Toast';

/** Formats remaining time as "Xh Ym" or "Xm Ys" */
function formatRemaining(ms: number): string {
  if (ms <= 0) return '만료됨';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  if (minutes > 0) return `${minutes}분 ${seconds}초`;
  return `${seconds}초`;
}

/**
 * TrialBanner — shows either:
 * 1. Activation prompt (for free users who haven't tried yet)
 * 2. Active countdown (during 24h trial)
 * 3. Post-trial upgrade CTA (after trial expired)
 */
export default function TrialBanner() {
  const { user, tier, trial, activateTrial, setShowAuth } = useAuth();
  const { showToast } = useToast();
  const [activating, setActivating] = useState(false);
  const [remaining, setRemaining] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!trial.active || !trial.expiresAt) return;

    const tick = () => {
      const ms = trial.expiresAt! - Date.now();
      setRemaining(formatRemaining(ms));
    };
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [trial.active, trial.expiresAt]);

  const handleActivate = useCallback(async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setActivating(true);
    const success = await activateTrial();
    setActivating(false);

    if (success) {
      showToast('Pro 맛보기가 활성화되었습니다! 24시간 동안 무제한으로 이용하세요.', 'success');
    } else {
      showToast('트라이얼 활성화에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  }, [user, activateTrial, showToast, setShowAuth]);

  // Premium users: don't show
  if (tier === 'premium') return null;

  // Active trial: show countdown
  if (trial.active) {
    return (
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Pro 맛보기 이용 중</p>
              <p className="text-xs text-indigo-300">
                남은 시간: <span className="font-mono font-bold">{remaining}</span>
              </p>
            </div>
          </div>
          <a
            href="/pricing"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
          >
            프리미엄으로 계속 이용하기 →
          </a>
        </div>
      </div>
    );
  }

  // Trial used & expired: show upgrade CTA
  if (trial.used) {
    return (
      <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Pro 맛보기가 종료되었습니다</p>
            <p className="text-xs text-gray-400">
              프리미엄으로 업그레이드하여 무제한 분석, AI 리라이트 등을 계속 이용하세요.
            </p>
          </div>
          <a
            href="/pricing"
            className="btn-primary text-sm whitespace-nowrap px-4 py-2"
          >
            프리미엄 업그레이드
          </a>
        </div>
      </div>
    );
  }

  // Not tried yet: show activation button
  if (!user) {
    // Guest: need to sign in first
    return (
      <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Pro 기능을 무료로 체험해 보세요</p>
            <p className="text-xs text-gray-400">
              무료 가입 후 24시간 동안 Pro의 모든 기능을 이용할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="btn-primary text-sm whitespace-nowrap px-4 py-2"
          >
            무료 가입하고 체험하기
          </button>
        </div>
      </div>
    );
  }

  // Free user who hasn't tried
  return (
    <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Pro 맛보기 — 24시간 무료 체험</h3>
          <p className="text-sm text-gray-400 max-w-md">
            무제한 분석, AI 리라이트 제안, 광고 없는 깔끔한 경험을 24시간 동안 무료로 체험하세요. 1회 한정!
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> 무제한 분석</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> AI 리라이트</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> 광고 없음</span>
          <span className="flex items-center gap-1"><span className="text-green-400">✓</span> 히스토리 저장</span>
        </div>
        <button
          onClick={handleActivate}
          disabled={activating}
          className="btn-primary text-sm px-6 py-2.5 min-h-[44px]"
        >
          {activating ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              활성화 중...
            </span>
          ) : (
            '지금 바로 Pro 체험하기'
          )}
        </button>
        <p className="text-[10px] text-gray-500">신용카드 불필요 · 자동 결제 없음 · 24시간 후 자동 종료</p>
      </div>
    </div>
  );
}
