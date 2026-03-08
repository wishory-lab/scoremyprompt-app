'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './components/AuthProvider';
import dynamic from 'next/dynamic';
import AdBanner from './components/AdBanner';
import AnalysisLoading from './components/AnalysisLoading';
import DemoMode from './components/DemoMode';
import Footer from './components/Footer';
import OnboardingTour from './components/OnboardingTour';
import ExitIntentModal from './components/ExitIntentModal';
import type { JobRole } from './types';
import { TEMPLATES } from './templates/data';
import { trackJobRoleSelected, trackPromptSubmitted, trackGradeStarted, trackDemoClick, trackSignupInitiated } from './lib/analytics';
import { VALIDATION, ERRORS, LOADING, AUTH, PLACEHOLDERS, HINTS, CTA } from './constants/messages';

const Leaderboard = dynamic(() => import('./components/Leaderboard'), { ssr: false });
const Waitlist = dynamic(() => import('./components/Waitlist'), { ssr: false });

interface ExamplePrompt {
  text: string;
  label: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    text: 'You are a senior growth marketer. Create a comprehensive go-to-market strategy for a new SaaS product targeting small businesses (10-50 employees). Include: target persona analysis, positioning statement, pricing strategy, and a 90-day launch plan with KPIs. Format as a structured document with executive summary.',
    label: 'Marketing Strategy',
  },
  {
    text: 'As a senior UX designer, design a mobile app interface for a meditation platform. Provide: user flow for onboarding (3 screens), home dashboard wireframe description, guided meditation selection with filters, and progress tracking dashboard. Follow iOS HIG guidelines. Output as detailed wireframe specifications.',
    label: 'Product Design',
  },
  {
    text: 'Act as a CFO advisor. Analyze our quarterly financial performance: Revenue $2.4M (+12% QoQ), COGS 45%, OpEx $1.1M. Provide recommendations for improving cash flow and profitability. Consider seasonal trends in Q4. Output: executive summary, 5 key findings, and 3 actionable recommendations with expected impact.',
    label: 'Finance Analysis',
  },
];

const JOB_ROLES: JobRole[] = ['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other'];

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, tier, supabase, setShowAuth, setAuthMessage, signOut } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [jobRole, setJobRole] = useState<JobRole>('Marketing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError(VALIDATION.PROMPT_EMPTY);
      return;
    }
    if (prompt.trim().length < 10) {
      setError(VALIDATION.PROMPT_TOO_SHORT);
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
        body: JSON.stringify({ prompt: prompt.trim(), jobRole }),
      });

      if (response.status === 429) {
        setError(ERRORS.RATE_LIMIT);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || ERRORS.ANALYZE_FAILED);
      }

      const data = await response.json();
      sessionStorage.setItem('promptResult', JSON.stringify(data));
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : ERRORS.ANALYZE_GENERIC);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleText: string) => {
    setPrompt(exampleText);
    setError('');
    const example = EXAMPLE_PROMPTS.find(e => e.text === exampleText);
    if (example) {
      trackDemoClick({ exampleId: example.label.toLowerCase().replace(/\s+/g, '-'), difficulty: 'example' });
    }
    document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
                  Dashboard
                </Link>
                {tier === 'pro' && (
                  <Link href="/bulk" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
                    Bulk
                  </Link>
                )}
                <span className="text-sm text-gray-300 hidden sm:block">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMessage(AUTH.SIGN_IN_FEATURES);
                  setShowAuth(true);
                  trackSignupInitiated({ source: 'homepage_nav' });
                }}
                className="text-sm px-4 py-1.5 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-fluid-hero font-bold mb-6">
            Write better prompts.{' '}
            <br className="hidden sm:block" />
            Get <span className="text-gradient">better AI results</span>.
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Paste your prompt. Get an instant score with actionable fixes.
            <br className="hidden sm:block" />
            Free, no signup required.
          </p>
        </div>

        {/* Social Proof - Above the fold */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-12 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">5,000+</span>
            <span className="text-sm text-gray-400">Prompts Scored</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">92%</span>
            <span className="text-sm text-gray-400">Find It Helpful</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gradient">6</span>
            <span className="text-sm text-gray-400">AI Dimensions</span>
          </div>
        </div>

        {/* Analysis Form */}
        <div id="analyze" className="card mb-12 animate-slide-in">
          {/* Job Role Selector */}
          <div className="mb-6" data-tour="role-selector" role="group" aria-label="Select your job role">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Job Role
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
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Prompt
            </label>
            <textarea
              id="analyze"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder={PLACEHOLDERS.PROMPT_INPUT}
              className="input-field min-h-[200px] text-base resize-none"
              maxLength={5000}
              aria-describedby="prompt-hint prompt-error"
            />
            <div className="flex justify-between mt-2">
              <p id="prompt-hint" className="text-xs text-gray-400">
                {HINTS.PROMPT_MIN_CHARS}
              </p>
              <p className={`text-xs ${prompt.length > 4500 ? 'text-amber-400' : 'text-gray-400'}`}>
                {prompt.length} / 5,000
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div id="prompt-error" role="alert" className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            data-tour="analyze-btn"
            aria-label="Score my prompt for free"
            className="btn-primary w-full font-semibold text-lg py-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing with AI...
              </span>
            ) : (
              'Score My Prompt — Free'
            )}
          </button>

          {/* PROMPT Framework Hint */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Scored on 6 dimensions: Precision · Role · Output Format · Mission Context · Structure · Tailoring
          </p>
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
            Example Prompts
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 stagger-children">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.text)}
                className="card hover:border-primary hover:bg-slate-800/50 transition-all duration-200 text-left"
              >
                <p className="font-medium text-white mb-2">{example.label}</p>
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
              <p className="text-white font-semibold mb-1">Instant Results</p>
              <p className="text-sm text-gray-400">Get your score in under 5 seconds with detailed AI analysis</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2 hover-bounce inline-block">&#127919;</div>
              <p className="text-white font-semibold mb-1">Actionable Fixes</p>
              <p className="text-sm text-gray-400">Not just a score — specific improvements to make your prompts work harder</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2 hover-bounce inline-block">&#128202;</div>
              <p className="text-white font-semibold mb-1">Benchmark Yourself</p>
              <p className="text-sm text-gray-400">See how your prompts compare with other professionals in your field</p>
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

      {/* Footer */}
      <Footer />

      {/* Onboarding Tour for first-time visitors */}
      <OnboardingTour />

      {/* Exit-Intent Modal for leaving guests */}
      <ExitIntentModal />
    </main>
  );
}
