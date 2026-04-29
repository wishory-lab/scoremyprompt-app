'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../i18n';
import { useToast } from '../../components/Toast';

interface RewriteSuggestionProps {
  suggestion: string | undefined;
  isPro: boolean;
  gradeLabel: string;
}

/** AI service links — click copies the rewritten prompt and opens the service */
const AI_SERVICES = [
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    color: '#10a37f',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    color: '#d97706',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M4.709 15.955l4.72-2.648.08-.23-.08-.128H9.2l-.08-.063h-.119l-.08-.064H8.76l-.063-.064h-.12l-.08-.064h-.058l-.08-.064-.064-.064h-.08l-.119-.119-.064-.064-.063-.058-.064-.064-.064-.058-.063-.064L7.81 12l-.064-.064-.058-.063-.12-.12-.063-.057-.064-.064-.063-.064-.064-.063-.063-.064-.064-.064-.058-.063-.064-.064-.063-.064-.064-.063-.058-.064-.064-.064-.063-.063-.064-.064-.058-.064-.064-.063-.063-.064-.064-.064-.058-.063-.064-.064-.063-.058-.064-.064-.058-.064-.064-.063-.063-.064-.064-.064-.058-.063-.064-.064L6.533 10l-.058-.064-.064-.064-.063-.063-.064-.064-.058-.064-.064-.063-.063-.064-.064-.064-.058-.063-.064-.064L5.9 9.334l-.064-.064-.058-.063-.064-.064-.063-.064-.064-.063-.058-.064-.064-.064-.063-.063-.064-.064-.058-.064-.064-.063-.063-.064-.064-.064-.058-.063-.064-.064-.063-.064L5.267 8.4l-.064-.063-.058-.064-.064-.064-.063-.063-.064-.064-.064-.064-.063-.063-.064-.064-.058-.064-.064-.063-.063-.064-.064-.064-.058-.063-.064-.064-.063-.064-.064-.063-.058-.064-.064-.064-.063-.063-.064-.064-.058-.064-.064-.063-.063-.064-.064-.064-.058-.063L4.019 7l2.694 4.667L4.709 15.955zM15.998 7l-4.71 2.617-.09.247.09.116.058.064h.12l.063.063h.128l.064.064h.08l.08.064h.058l.08.064.063.063h.08l.12.12.063.063.064.058.064.064.063.064.064.058.063.064.064.064.058.063.064.064.063.064.064.063.058.064.064.064.063.063.064.064.058.064.064.063.063.064.064.064.058.063.064.064.063.064.064.063.058.064.064.064.063.058.064.064.058.064.064.063.063.064.064.064.058.063.064.064.063.064.064.063.058.064L14 12l.058.064.064.063.063.064.064.064.058.063.064.064.063.064.064.063.058.064.064.064.063.058.064.064.058.064.064.063.063.064.064.064.058.063.064.064.063.064.064.063.058.064.064.064.063.058.064.064.058.064.064.063.063.064.064.064.058.063.064.064.063.064.064.063.058.064.064.064.063.063.064.064.058.064.064.063.063.064.064.064.058.063.064.064.063.064.064.063.058.064.064.064.063.058.064.064.058.064.064.063.063.064.064.064.058.063.064.064.063.064L19.29 17l-2.725-4.688L19.29 7h-3.292z" />
      </svg>
    ),
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: '#4285f4',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 0C5.3726 0 0 5.3726 0 12c0 6.6274 5.3726 12 12 12 6.6274 0 12-5.3726 12-12C24 5.3726 18.6274 0 12 0zm0 3.6c2.1 0 4.0502.7626 5.5498 2.025L12 12 6.4502 5.625C7.9498 4.3626 9.9 3.6 12 3.6zm-8.4 8.4c0-2.1.7626-4.0502 2.025-5.5498L12 12 5.625 17.5498C4.3626 16.0502 3.6 14.1 3.6 12zm8.4 8.4c-2.1 0-4.0502-.7626-5.5498-2.025L12 12l5.5498 6.375C16.0502 19.6374 14.1 20.4 12 20.4zm6.375-2.8502L12 12l6.375-5.5498C19.6374 7.9498 20.4 9.9 20.4 12c0 2.1-.7626 4.0502-2.025 5.5498z" />
      </svg>
    ),
  },
  {
    name: 'Copilot',
    url: 'https://copilot.microsoft.com',
    color: '#0078d4',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M23.922 12.397a3.29 3.29 0 00-1.586-2.373l-3.099-1.927a5.46 5.46 0 00-.441-3.49 5.384 5.384 0 00-2.865-2.675 5.296 5.296 0 00-3.89-.118A5.352 5.352 0 009.15 3.94a5.308 5.308 0 00-3.621.725 5.39 5.39 0 00-2.362 2.978 5.46 5.46 0 00.125 3.808A3.316 3.316 0 00.078 12.397a3.3 3.3 0 00.412 3.093 3.26 3.26 0 001.586 1.272l3.1 1.927a5.46 5.46 0 00.44 3.49 5.384 5.384 0 002.865 2.675 5.296 5.296 0 003.89.118 5.352 5.352 0 002.891-2.126 5.308 5.308 0 003.621-.725 5.39 5.39 0 002.362-2.978 5.46 5.46 0 00-.125-3.808 3.316 3.316 0 002.214-.946 3.3 3.3 0 00.588-3.992z" />
      </svg>
    ),
  },
];

export default function RewriteSuggestion({ suggestion, isPro, gradeLabel }: RewriteSuggestionProps) {
  const t = useTranslation();
  const { showToast } = useToast();
  const [showRewrite, setShowRewrite] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!suggestion) return;
    await navigator.clipboard.writeText(suggestion);
    setCopied(true);
    showToast('개선된 프롬프트가 복사되었습니다!', 'success');
    setTimeout(() => setCopied(false), 2000);
  }, [suggestion, showToast]);

  const handleCopyAndGo = useCallback(async (url: string, serviceName: string) => {
    if (!suggestion) return;
    await navigator.clipboard.writeText(suggestion);
    showToast(`프롬프트가 복사되었습니다. ${serviceName}에서 붙여넣기하세요!`, 'success');
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [suggestion, showToast]);

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
            <div className="animate-fade-in">
              {/* Rewritten prompt box */}
              <div className="p-4 bg-slate-800/50 border border-primary/20 rounded-lg">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {suggestion}
                </p>
              </div>

              {/* Copy button */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-all min-h-[44px]"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      복사됨!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      프롬프트 복사하기
                    </>
                  )}
                </button>
              </div>

              {/* AI Service Quick Links */}
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-gray-400 mb-3">
                  복사한 프롬프트를 바로 사용해 보세요
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AI_SERVICES.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => handleCopyAndGo(service.url, service.name)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-white/15 rounded-lg transition-all group min-h-[44px]"
                    >
                      <span
                        className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ color: service.color }}
                      >
                        {service.icon}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium truncate">
                        {service.name}
                      </span>
                      <svg className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  클릭하면 프롬프트가 자동 복사되고, 해당 AI 서비스가 새 탭에서 열립니다. Ctrl+V로 붙여넣기하세요.
                </p>
              </div>
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
