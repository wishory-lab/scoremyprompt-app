'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './components/AuthProvider';
import dynamic from 'next/dynamic';
import AnalysisLoading from './components/AnalysisLoading';
import PromptQualityIndicator from './components/PromptQualityIndicator';
import type { JobRole } from './types';
import { TEMPLATES } from './templates/data';
import { trackJobRoleSelected, trackPromptSubmitted, trackGradeStarted, trackDemoClick } from './lib/analytics';
import { VALIDATION, ERRORS, PLACEHOLDERS, HINTS } from './constants/messages';
import { useTranslation, useLocale } from './i18n';

const AdBanner = dynamic(() => import('./components/AdBanner'), { ssr: false });
const DemoMode = dynamic(() => import('./components/DemoMode'), { ssr: false });
const Footer = dynamic(() => import('./components/Footer'), { ssr: false });
const OnboardingTour = dynamic(() => import('./components/OnboardingTour'), { ssr: false });
const ExitIntentModal = dynamic(() => import('./components/ExitIntentModal'), { ssr: false });
const Leaderboard = dynamic(() => import('./components/Leaderboard'), { ssr: false });
const Waitlist = dynamic(() => import('./components/Waitlist'), { ssr: false });

interface ExamplePrompt {
  text: string;
  label: string;
}

const EXAMPLE_PROMPTS_DATA = [
  {
    text: 'You are a senior growth marketer. Create a comprehensive go-to-market strategy for a new SaaS product targeting small businesses (10-50 employees). Include: target persona analysis, positioning statement, pricing strategy, and a 90-day launch plan with KPIs. Format as a structured document with executive summary.',
    labelKey: 'marketingStrategy' as const,
  },
  {
    text: 'As a senior UX designer, design a mobile app interface for a meditation platform. Provide: user flow for onboarding (3 screens), home dashboard wireframe description, guided meditation selection with filters, and progress tracking dashboard. Follow iOS HIG guidelines. Output as detailed wireframe specifications.',
    labelKey: 'productDesign' as const,
  },
  {
    text: 'Act as a CFO advisor. Analyze our quarterly financial performance: Revenue $2.4M (+12% QoQ), COGS 45%, OpEx $1.1M. Provide recommendations for improving cash flow and profitability. Consider seasonal trends in Q4. Output: executive summary, 5 key findings, and 3 actionable recommendations with expected impact.',
    labelKey: 'financeAnalysis' as const,
  },
];

const JOB_ROLES: JobRole[] = ['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other'];

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();
  const t = useTranslation();
  const { locale } = useLocale();
  const [prompt, setPrompt] = useState('');
  const [jobRole, setJobRole] = useState<JobRole>('Marketing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Retry countdown timer
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) { setError(''); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  // Pre-fill job role from re-analyze or saved default
  useEffect(() => {
    try {
      const reanalyzeRole = sessionStorage.getItem('smp_reanalyze_role');
      if (reanalyzeRole) {
        setJobRole(reanalyzeRole as JobRole);
        sessionStorage.removeItem('smp_reanalyze_role');
        return;
      }
      const defaultRole = localStorage.getItem('smp_default_role');
      if (defaultRole) {
        setJobRole(defaultRole as JobRole);
      }
    } catch { /* storage unavailable */ }
  }, []);

  // Pre-fill from template query param
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setPrompt(template.prompt);
        setJobRole(template.jobRole);
        // Auto-analyze if requested
        if (searchParams.get('auto') === 'true') {
          setTimeout(() => {
            document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError(t.validation.promptEmpty);
      return;
    }
    if (prompt.trim().length < 10) {
      setError(t.validation.promptTooShort);
      return;
    }

    setLoading(true);
    setError('');
    trackPromptSubmitted({ jobRole, promptLength: prompt.trim().length });
    trackGradeStarted({ jobRole, promptLength: prompt.trim().length });

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: prompt.trim(), jobRole, locale }),
      });

      // Read rate-limit headers
      const remaining = response.headers.get('X-RateLimit-Remaining');
      if (remaining !== null) setRateLimitRemaining(parseInt(remaining, 10));

      if (response.status === 429) {
        const body = await response.json().catch(() => ({}));
        const retryAfter = body.retryAfter || 60;
        setRetryCountdown(Math.min(retryAfter, 300));
        setError(t.errors.rateLimit);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || t.errors.analyzeFailed);
      }

      const data = await response.json();
      sessionStorage.setItem('promptResult', JSON.stringify(data));
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.analyzeGeneric);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleText: string) => {
    setPrompt(exampleText);
    setError('');
    const example = EXAMPLE_PROMPTS_DATA.find(e => e.text === exampleText);
    if (example) {
      trackDemoClick({ exampleId: example.labelKey.toLowerCase().replace(/\s+/g, '-'), difficulty: 'example' });
    }
    document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-fluid-hero font-bold mb-6">
            {t.hero.title}{' '}
            <br className="hidden sm:block" />
            <span className="text-gradient">{t.hero.titleHighlight}</span>{t.hero.titleEnd}
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            {t.hero.subtitle}
            <br className="hidden sm:block" />
            {t.hero.subtitleLine2}
          </p>
        </div>

        {/* 6 AI Dimensions - 3D Hexagonal Visual */}
        <div className="mb-12 animate-fade-in">
          <div className="relative mx-auto" style={{ width: '320px', height: '260px' }}>
            {/* Center hub */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-lg shadow-primary/30 flex flex-col items-center justify-center border border-white/20">
                <span className="text-2xl font-black text-white tracking-tight leading-none">6</span>
                <span className="text-[10px] font-medium text-white/80 mt-0.5">{t.socialProof.aiDimensions}</span>
              </div>
            </div>
            {/* Connecting lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Lines from center to each node */}
              <line x1="160" y1="130" x2="160" y2="28" stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4" />
              <line x1="160" y1="130" x2="268" y2="68" stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4" />
              <line x1="160" y1="130" x2="268" y2="192" stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4" />
              <line x1="160" y1="130" x2="160" y2="232" stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4" />
              <line x1="160" y1="130" x2="52" y2="192" stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4" />
              <line x1="160" y1="130" x2="52" y2="68" stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4" />
              {/* Hexagon outline */}
              <polygon points="160,28 268,68 268,192 160,232 52,192 52,68" stroke="url(#hexGrad)" strokeWidth="1" fill="none" opacity="0.2" />
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            {/* P — Precision (top) */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '4px' }}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-110 group-hover:shadow-emerald-500/30 transition-all duration-300">
                  <span className="text-base font-bold text-emerald-400">P</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">정확성</span>
              </div>
            </div>
            {/* R — Role (top-right) */}
            <div className="absolute" style={{ right: '16px', top: '44px' }}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-300">
                  <span className="text-base font-bold text-blue-400">R</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">역할</span>
              </div>
            </div>
            {/* O — Output Format (bottom-right) */}
            <div className="absolute" style={{ right: '16px', bottom: '44px' }}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:scale-110 group-hover:shadow-amber-500/30 transition-all duration-300">
                  <span className="text-base font-bold text-amber-400">O</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">출력 형식</span>
              </div>
            </div>
            {/* M — Mission Context (bottom) */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '4px' }}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-md shadow-rose-500/10 group-hover:scale-110 group-hover:shadow-rose-500/30 transition-all duration-300">
                  <span className="text-base font-bold text-rose-400">M</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">미션</span>
              </div>
            </div>
            {/* P — Prompt Structure (bottom-left) */}
            <div className="absolute" style={{ left: '16px', bottom: '44px' }}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shadow-md shadow-violet-500/10 group-hover:scale-110 group-hover:shadow-violet-500/30 transition-all duration-300">
                  <span className="text-base font-bold text-violet-400">P</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">구조</span>
              </div>
            </div>
            {/* T — Tailoring (top-left) */}
            <div className="absolute" style={{ left: '16px', top: '44px' }}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shadow-md shadow-cyan-500/10 group-hover:scale-110 group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <span className="text-base font-bold text-cyan-400">T</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium">맞춤화</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">{t.form.frameworkHint}</p>
        </div>

        {/* Analysis Form */}
        <div id="analyze" className="card mb-12 animate-slide-in">
          {/* Job Role Selector */}
          <div className="mb-6" data-tour="role-selector" role="group" aria-label="Select your job role">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t.form.jobRoleLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {JOB_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => { setJobRole(role); trackJobRoleSelected({ jobRole: role }); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm min-h-[44px] inline-flex items-center ${
                    jobRole === role
                      ? 'bg-primary text-white'
                      : 'bg-dark border border-border text-gray-400 hover:border-primary'
                  }`}
                >
                  {(t.jobRoles as Record<string, string>)[role] || role}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t.form.promptLabel}
            </label>
            <textarea
              id="analyze"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder={t.form.promptPlaceholder}
              className="input-field min-h-[200px] text-base resize-none"
              maxLength={5000}
              aria-describedby="prompt-hint prompt-error"
            />
            <div className="flex justify-between mt-2">
              <p id="prompt-hint" className="text-xs text-gray-400">
                {t.form.minChars}
              </p>
              <p className={`text-xs ${prompt.length > 4500 ? 'text-amber-400' : 'text-gray-400'}`}>
                {prompt.length} / 5,000
              </p>
            </div>
            <PromptQualityIndicator prompt={prompt} />
          </div>

          {/* Error Message */}
          {error && (
            <div id="prompt-error" role="alert" className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
              {retryCountdown > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span>{error}</span>
                  <span className="shrink-0 tabular-nums font-mono text-xs bg-red-900/40 px-2 py-1 rounded">
                    {Math.floor(retryCountdown / 60)}:{String(retryCountdown % 60).padStart(2, '0')}
                  </span>
                </div>
              ) : error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || retryCountdown > 0}
            data-tour="analyze-btn"
            aria-label="Score my prompt for free"
            className="btn-primary w-full font-semibold text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.form.analyzing}
              </span>
            ) : retryCountdown > 0 ? (
              t.form.waitMessage.replace('{seconds}', String(retryCountdown))
            ) : (
              t.form.scoreFree
            )}
          </button>

          {/* PROMPT Framework Hint + Rate limit info */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">
              {t.form.frameworkHint}
            </p>
            {rateLimitRemaining !== null && rateLimitRemaining <= 5 && (
              <p className={`text-xs shrink-0 ml-3 ${rateLimitRemaining <= 2 ? 'text-amber-400' : 'text-gray-500'}`}>
                {t.form.leftToday.replace('{count}', String(rateLimitRemaining))}
              </p>
            )}
          </div>
        </div>

        {/* Analysis Loading State */}
        {loading && (
          <div className="card mb-12 animate-fade-in">
            <AnalysisLoading />
          </div>
        )}

        {/* Example Prompts */}
        <div className="mb-16">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t.examples.title}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 stagger-children">
            {EXAMPLE_PROMPTS_DATA.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.text)}
                className="card hover:border-primary hover:bg-slate-800/50 transition-all duration-200 text-left"
              >
                <p className="font-medium text-white mb-2">{(t.examples as Record<string, string>)[example.labelKey] || example.labelKey}</p>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {example.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="py-12 border-t border-b border-border">
          <div className="grid sm:grid-cols-3 gap-6 stagger-children">
            <div className="text-center">
              <div className="text-2xl mb-2 hover-bounce inline-block">&#9889;</div>
              <p className="text-white font-semibold mb-1">{t.trust.instantResults}</p>
              <p className="text-sm text-gray-400">{t.trust.instantResultsDesc}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2 hover-bounce inline-block">&#127919;</div>
              <p className="text-white font-semibold mb-1">{t.trust.actionableFixes}</p>
              <p className="text-sm text-gray-400">{t.trust.actionableFixesDesc}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2 hover-bounce inline-block">&#128202;</div>
              <p className="text-white font-semibold mb-1">{t.trust.benchmarkYourself}</p>
              <p className="text-sm text-gray-400">{t.trust.benchmarkYourselfDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Mode Section */}
      <DemoMode />

      {/* Ad Slot: Between DemoMode and Leaderboard */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdBanner slot="leaderboard" />
      </div>

      {/* Leaderboard Section */}
      <div id="leaderboard">
        <Leaderboard />
      </div>

      {/* Waitlist / Newsletter Section */}
      <Waitlist />

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent border border-indigo-500/20 p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              {t.cta.title}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {t.cta.subtitle}
            </p>
            <a
              href="#analyze"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg shadow-indigo-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t.cta.button}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Onboarding Tour for first-time visitors */}
      <OnboardingTour />

      {/* Exit-Intent Modal for leaving guests */}
      <ExitIntentModal />
    </main>
  );
}
