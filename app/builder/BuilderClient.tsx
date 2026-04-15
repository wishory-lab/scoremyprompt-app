'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { useTranslation, useLocale } from '@/app/i18n';
import StepRole from './steps/StepRole';
import StepGoals from './steps/StepGoals';
import StepBrand from './steps/StepBrand';
import StepTools from './steps/StepTools';
import StepAutomation from './steps/StepAutomation';
import type { BuilderAnswers } from '@/app/types/builder';
import { trackBuilderStarted, trackBuilderCompleted } from '@/app/lib/analytics';

const TOTAL = 5;

export default function BuilderClient() {
  const router = useRouter();
  const t = useTranslation();
  const { locale } = useLocale();
  const { user, tier, supabase, setShowAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<BuilderAnswers>({
    role: 'Marketer',
    goals: [],
    tone: 'Professional',
    tools: [],
    automation: 'semi_auto',
    lang: locale,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveTier: 'free' | 'pro' = tier === 'pro' ? 'pro' : 'free';

  useEffect(() => {
    trackBuilderStarted({ tier: effectiveTier });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Require sign-in up-front; open modal if not authenticated.
  useEffect(() => {
    if (!user) setShowAuth(true);
  }, [user, setShowAuth]);

  const canNext =
    (step === 1 && !!answers.role) ||
    (step === 2 && answers.goals.length >= 1) ||
    (step === 3 && !!answers.tone) ||
    step === 4 ||
    step === 5;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (!user || !supabase) {
        setShowAuth(true);
        throw new Error('Please sign in to build your harness.');
      }
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No auth token — please sign in again.');

      const res = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...answers, lang: locale }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        if (body.code === 'QUOTA_EXHAUSTED') {
          router.push('/pricing?reason=builder_quota');
          return;
        }
        throw new Error(body.error ?? 'Failed to generate');
      }
      const data = (await res.json()) as { id: string };
      trackBuilderCompleted({
        tier: effectiveTier,
        role: answers.role,
        goalCount: answers.goals.length,
      });
      router.push(`/builder/result/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">{t.builder.pageTitle}</h1>
          <div className="mt-2 text-sm text-gray-400">Step {step} of {TOTAL}</div>
          <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </header>

        <div className="rounded-xl border border-border bg-surface/50 p-6">
          {step === 1 && <StepRole value={answers.role} onChange={(v) => setAnswers({ ...answers, role: v })} />}
          {step === 2 && <StepGoals value={answers.goals} onChange={(v) => setAnswers({ ...answers, goals: v })} />}
          {step === 3 && <StepBrand value={answers.tone} onChange={(v) => setAnswers({ ...answers, tone: v })} />}
          {step === 4 && <StepTools value={answers.tools} onChange={(v) => setAnswers({ ...answers, tools: v })} />}
          {step === 5 && <StepAutomation value={answers.automation} onChange={(v) => setAnswers({ ...answers, automation: v })} />}
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-md bg-red-900/40 border border-red-700 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            disabled={step === 1 || submitting}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 rounded-lg border border-border text-gray-300 disabled:opacity-40"
          >
            {t.builder.backCta}
          </button>
          {step < TOTAL ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent font-semibold text-white disabled:opacity-40"
            >
              {t.builder.nextCta}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent font-semibold text-white disabled:opacity-40"
            >
              {submitting ? t.builder.generating : t.builder.generateCta}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
