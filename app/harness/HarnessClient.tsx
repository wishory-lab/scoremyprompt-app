'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n';
import AdSlot from '@/app/components/AdSlot';
import { HARNES_DIMENSIONS } from '@/app/types/harness';
import { trackHarnessAnalyzed } from '@/app/lib/analytics';

const MIN_CHARS = 20;
const MAX_CHARS = 20_000;

export default function HarnessClient() {
  const t = useTranslation();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = input.trim().length >= MIN_CHARS && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/harness/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || 'Request failed');
      }
      const data = (await res.json()) as { shareId: string; total: number; tier: string };
      trackHarnessAnalyzed({
        lang: typeof navigator !== 'undefined' ? navigator.language : 'en',
        total: data.total,
        tier: data.tier,
      });
      router.push(`/harness/result/${data.shareId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            {t.harness.pageTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            {t.harness.pageSubtitle}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-200 mb-2">
              {t.harness.inputLabel}
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              placeholder={t.harness.inputPlaceholder}
              rows={12}
              className="w-full rounded-lg bg-surface border border-border text-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t.harness.inputLabel}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{t.harness.minChars}</span>
              <span>{input.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
            </div>
          </label>

          {error && (
            <div role="alert" className="rounded-md bg-red-900/40 border border-red-700 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-gradient-to-r from-primary to-accent py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? t.harness.submitting : t.harness.submitCta}
          </button>
        </form>

        <aside className="mt-12 rounded-lg border border-border bg-surface/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">{t.harness.learnMoreTitle}</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {(Object.keys(HARNES_DIMENSIONS) as Array<keyof typeof HARNES_DIMENSIONS>).map((k) => (
              <li key={k}>
                <strong className="text-white">{k} — {HARNES_DIMENSIONS[k].name}</strong>
                {' · '}
                <span>{t.harness.dimensions[k]}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <AdSlot placement="FooterSticky" />
    </main>
  );
}
