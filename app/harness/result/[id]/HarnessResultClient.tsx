'use client';

import Link from 'next/link';
import { useTranslation } from '@/app/i18n';
import AdSlot from '@/app/components/AdSlot';
import { HARNES_DIMENSIONS, type HarnessAnalyzeResponse } from '@/app/types/harness';

const TIER_COLORS: Record<HarnessAnalyzeResponse['tier'], string> = {
  Elite: 'from-yellow-400 to-yellow-600',
  Proficient: 'from-slate-300 to-slate-500',
  Developing: 'from-amber-700 to-amber-900',
  NeedsHarness: 'from-red-600 to-red-800',
};

export default function HarnessResultClient({ result }: { result: HarnessAnalyzeResponse }) {
  const t = useTranslation();
  const tierLabel = t.harness.result.tier[result.tier];
  const tierMsg = t.harness.result.tierMsg[result.tier];

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Tier card */}
        <div className={`rounded-2xl bg-gradient-to-br ${TIER_COLORS[result.tier]} p-8 mb-8 text-center`}>
          <div className="text-6xl sm:text-7xl font-bold text-white">
            {result.total}
            <span className="text-3xl text-white/70">/100</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">{tierLabel}</div>
          <div className="mt-1 text-sm text-white/90">{tierMsg}</div>
        </div>

        {/* Dimension breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {(Object.keys(HARNES_DIMENSIONS) as Array<keyof typeof HARNES_DIMENSIONS>).map((k) => {
            const score = result.scores[k];
            const max = HARNES_DIMENSIONS[k].max;
            const pct = Math.round((score / max) * 100);
            return (
              <div key={k} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-300">{k} {HARNES_DIMENSIONS[k].name}</span>
                  <span className="text-lg font-bold text-white">{score}/{max}</span>
                </div>
                <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <AdSlot placement="ResultInline" />

        {/* Feedback */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">{t.harness.result.feedbackTitle}</h2>
          <ul className="space-y-3">
            {result.feedback.map((f, idx) => (
              <li key={idx} className="rounded-lg border border-border bg-surface p-4">
                <div className="text-sm font-semibold text-primary">{f.dim} — {HARNES_DIMENSIONS[f.dim].name}</div>
                <div className="text-sm text-gray-300 mt-1">{f.issue}</div>
                <div className="text-sm text-green-300 mt-1">→ {f.fix}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick wins */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">{t.harness.result.quickWinsTitle}</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-200">
            {result.quickWins.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </section>

        <AdSlot placement="ResultBottom" />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 rounded-lg bg-surface border border-border py-3 text-white hover:bg-surface/70"
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              if (navigator.share) {
                navigator.share({ title: `HARNES Score: ${result.total}/100`, url }).catch(() => void 0);
              } else {
                navigator.clipboard?.writeText(url);
              }
            }}
          >
            {t.harness.result.shareCta}
          </button>
          <Link
            href="/pricing"
            className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent py-3 text-center font-semibold text-white"
          >
            {t.harness.result.buildCta}
          </Link>
          <Link
            href="/harness"
            className="flex-1 rounded-lg bg-surface border border-border py-3 text-center text-white hover:bg-surface/70"
          >
            {t.harness.result.rescoreCta}
          </Link>
        </div>
      </section>

      <AdSlot placement="FooterSticky" />
    </main>
  );
}
