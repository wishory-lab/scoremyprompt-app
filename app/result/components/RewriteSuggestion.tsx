'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../i18n';

interface RewriteSuggestionProps {
  suggestion: string | undefined;
  isPro: boolean;
  gradeLabel: string;
}

export default function RewriteSuggestion({ suggestion, isPro, gradeLabel }: RewriteSuggestionProps) {
  const t = useTranslation();
  const [showRewrite, setShowRewrite] = useState(false);

  if (!suggestion) return null;

  return (
    <div className="card mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">{t.result.aiRewriteSuggestion}</h2>
          {!isPro && (
            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">PRO</span>
          )}
        </div>
        {isPro && (
          <button
            onClick={() => setShowRewrite(!showRewrite)}
            className="text-sm text-primary hover:text-accent transition-colors min-h-[44px]"
            aria-expanded={showRewrite}
            aria-label="Toggle AI rewrite suggestion"
          >
            {showRewrite ? t.result.hideRewrite : t.result.showRewrite}
          </button>
        )}
      </div>
      {isPro ? (
        <>
          {showRewrite && (
            <div className="p-4 bg-slate-800/50 border border-primary/20 rounded-lg animate-fade-in">
              <p className="text-gray-300 text-sm leading-relaxed italic">
                &ldquo;{suggestion}&rdquo;
              </p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(suggestion || '');
                }}
                className="mt-3 text-xs text-primary hover:text-accent transition-colors min-h-[44px]"
              >
                {t.result.copyToClipboard}
              </button>
            </div>
          )}
          {!showRewrite && (
            <p className="text-sm text-gray-400">
              {t.result.rewriteHint}
            </p>
          )}
        </>
      ) : (
        <div className="relative">
          <div className="p-4 bg-slate-800/50 border border-border rounded-lg">
            <p className="text-gray-500 text-sm leading-relaxed italic blur-sm select-none" aria-hidden="true">
              &ldquo;{suggestion.substring(0, 80)}...&rdquo;
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 rounded-lg">
            <Link
              href="/pricing"
              className="btn-primary text-sm font-semibold flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {t.result.unlockWithPro}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
