'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import dynamic from 'next/dynamic';
import AnalysisLoading from '../components/AnalysisLoading';
import ScoreCircle from '../components/ScoreCircle';
import DimensionBar from '../components/DimensionBar';
import PercentileBar from '../components/PercentileBar';
import Link from 'next/link';
import type { Grade, AnalysisResult, GradeConfig } from '../types';
import {
  GRADE_CONFIG as GRADE_CONFIG_CENTRAL,
  DIMENSION_META as DIMENSION_META_CENTRAL,
  DIMENSION_FEEDBACK,
} from '../constants';
import { GUIDES_CONTENT } from '../guides/content';
import { trackResultViewed, trackGradeCompleted, trackShare, trackSignupInitiated, trackReturnAnalysis } from '../lib/analytics';
import { useProfilePrompt } from '../components/ProfilePrompt';

// Lazy-load below-the-fold & heavy components
const AdBanner = dynamic(() => import('../components/AdBanner'), { ssr: false });
const Footer = dynamic(() => import('../components/Footer'), { ssr: false });
const ProfilePrompt = dynamic(() => import('../components/ProfilePrompt'), { ssr: false });
const ShareCard = dynamic(() => import('../components/ShareCard'), { ssr: false });

// Map each dimension to the most relevant guide slug for improvement suggestions
const DIMENSION_GUIDE_MAP: Record<string, string> = {
  precision: 'how-to-write-better-ai-prompts',
  role: 'prompt-engineering-for-beginners',
  outputFormat: 'chatgpt-prompt-tips',
  missionContext: 'prompt-score-framework',
  promptStructure: 'chatgpt-prompt-tips',
  tailoring: 'prompt-engineering-for-marketers',
};

interface ExtendedGradeConfig extends GradeConfig {
  bg: string;
}

// Extend centralized DIMENSION_META with display labels for the result page
const DIMENSION_META = Object.fromEntries(
  Object.entries(DIMENSION_META_CENTRAL).map(([key, meta]) => [
    key,
    { ...meta, label: `${meta.letter} \u2014 ${meta.label}` },
  ])
);

// Extend centralized GRADE_CONFIG with gradient backgrounds for the result page
const GRADE_CONFIG: Record<Grade, ExtendedGradeConfig> = {
  S: { ...GRADE_CONFIG_CENTRAL.S, bg: 'from-emerald-500/20 to-emerald-600/10' },
  A: { ...GRADE_CONFIG_CENTRAL.A, bg: 'from-blue-500/20 to-blue-600/10' },
  B: { ...GRADE_CONFIG_CENTRAL.B, bg: 'from-amber-500/20 to-amber-600/10' },
  C: { ...GRADE_CONFIG_CENTRAL.C, bg: 'from-orange-500/20 to-orange-600/10' },
  D: { ...GRADE_CONFIG_CENTRAL.D, bg: 'from-red-500/20 to-red-600/10' },
};

const DIMENSION_KEYS = ['precision', 'role', 'outputFormat', 'missionContext', 'promptStructure', 'tailoring'] as const;

export default function ResultPage() {
  const router = useRouter();
  const { user, tier, supabase, setShowAuth, setAuthMessage } = useAuth();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState<'html' | 'md' | null>(null);
  const [challenger, setChallenger] = useState<{ name: string; score: number; grade: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const isGuest = !user;
  const isPro = tier === 'pro';
  const { shouldShow: showProfile, dismiss: dismissProfile } = useProfilePrompt();

  type SharePlatform = 'twitter' | 'linkedin' | 'bluesky' | 'copy';

  function getShareText(platform: SharePlatform, score: number, grade: string, gradeLabel: string, jobRole: string, percentile: number, url: string): string {
    switch (platform) {
      case 'twitter':
        return `My AI prompt just scored ${score}/100 (${grade}-Tier) on ScoreMyPrompt! \u{1F3AF}\n\nTop ${100 - percentile}% among ${jobRole} professionals.\n\n#PromptScoreChallenge #PromptEngineering\n\nWhat's your PROMPT Score? \u{1F447}\n${url}`;
      case 'linkedin':
        return `I just discovered my AI prompting skill level.\n\nUsing ScoreMyPrompt's PROMPT Framework, my prompt scored ${score}/100 \u2014 ${gradeLabel}.\n\nAs a ${jobRole} professional, this puts me in the top ${100 - percentile}%.\n\nThe 6 dimensions measured: Precision, Role, Output Format, Mission Context, Prompt Structure, and Tailoring.\n\nCurious about your score? Try it free: ${url}\n\n#PromptEngineering #AI #PromptScoreChallenge`;
      case 'bluesky':
        return `My AI prompt scored ${score}/100 (${grade}-Tier) on ScoreMyPrompt! \u{1F3AF}\n\nTop ${100 - percentile}% among ${jobRole} pros.\n\nWhat's your score?\n${url}`;
      case 'copy':
        return `I scored ${score}/100 (Grade ${grade}) on ScoreMyPrompt! Can you beat my score? ${url}`;
    }
  }

  useEffect(() => {
    const resultData = sessionStorage.getItem('promptResult');
    if (resultData) {
      const parsed = JSON.parse(resultData);
      setResult(parsed);
      setLoading(false);
      trackResultViewed({ score: parsed.overallScore, grade: parsed.grade, jobRole: parsed.jobRole || '' });
      trackGradeCompleted({ jobRole: parsed.jobRole || '', score: parsed.overallScore, grade: parsed.grade });

      // Track return analysis — detect repeat users via localStorage counter
      try {
        const countKey = 'smp_analysis_count';
        const prev = parseInt(localStorage.getItem(countKey) || '0', 10);
        const newCount = prev + 1;
        localStorage.setItem(countKey, String(newCount));
        if (newCount >= 2) {
          trackReturnAnalysis({ analysisCount: newCount, jobRole: parsed.jobRole || '' });
        }
      } catch { /* localStorage unavailable */ }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const stored = sessionStorage.getItem('challenger');
    if (stored) {
      try {
        setChallenger(JSON.parse(stored));
        sessionStorage.removeItem('challenger'); // consume it
      } catch { /* ignore */ }
    }
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://scoremyprompt.com';

  const handleShareTwitter = () => {
    if (!result) return;
    trackShare({ method: 'twitter', score: result.overallScore, grade: result.grade });
    const text = getShareText('twitter', result.overallScore, result.grade, result.scoreLevel || '', result.jobRole || 'professionals', result.benchmarks?.percentile || 50, shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    if (!result) return;
    trackShare({ method: 'linkedin', score: result.overallScore, grade: result.grade });
    const text = getShareText('linkedin', result.overallScore, result.grade, result.scoreLevel || '', result.jobRole || 'professionals', result.benchmarks?.percentile || 50, shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareBluesky = () => {
    if (!result) return;
    trackShare({ method: 'bluesky', score: result.overallScore, grade: result.grade });
    const text = getShareText('bluesky', result.overallScore, result.grade, result.scoreLevel || '', result.jobRole || 'professionals', result.benchmarks?.percentile || 50, shareUrl);
    window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    if (!result) return;
    trackShare({ method: 'copy', score: result.overallScore, grade: result.grade });
    const text = getShareText('copy', result.overallScore, result.grade, result.scoreLevel || '', result.jobRole || 'professionals', result.benchmarks?.percentile || 50, shareUrl);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!result || !navigator.share) return;
    trackShare({ method: 'native', score: result.overallScore, grade: result.grade });
    const text = getShareText('copy', result.overallScore, result.grade, result.scoreLevel || '', result.jobRole || 'professionals', result.benchmarks?.percentile || 50, shareUrl);
    navigator.share({ title: 'My PROMPT Score', text, url: shareUrl });
  };

  const handleChallenge = async () => {
    if (!result) return;
    trackShare({ method: 'challenge', score: result.overallScore, grade: result.grade });
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const challengeUrl = `${origin}/challenge?score=${result.overallScore}&grade=${result.grade}`;
    await navigator.clipboard.writeText(challengeUrl);
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2000);
  };

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('promptResult');
    router.push('/');
  };

  const handleExport = async () => {
    if (!result?.analysisId || !supabase) return;

    try {
      setExporting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ analysisId: result.analysisId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('Export failed:', err);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-analysis-${result.analysisId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading || !result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <AnalysisLoading />
        </div>
      </main>
    );
  }

  const gradeConfig = GRADE_CONFIG[result.grade] || GRADE_CONFIG.B;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={handleNewAnalysis} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
          </button>
          {user ? (
            <span className="text-sm text-gray-300">{user.email?.split('@')[0]}</span>
          ) : (
            <button
              onClick={() => {
                setAuthMessage('Sign in to see all 6 dimension details.');
                setShowAuth(true);
                trackSignupInitiated({ source: 'result_nav' });
              }}
              className="text-sm px-4 py-1.5 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <section id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Score Hero */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="flex justify-center mb-6">
            <ScoreCircle score={result.overallScore} grade={result.grade} config={gradeConfig} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {gradeConfig.emoji} {result.scoreLevel || gradeConfig.label}!
          </p>
          <p className="text-gray-400 text-sm mb-3">{gradeConfig.message}</p>
          {result.benchmarks && (
            <p className="text-gray-400 max-w-xl mx-auto">
              Your prompt ranks in the <span className="text-primary font-semibold">top {result.benchmarks.percentile}%</span> compared to other {result.jobRole} professionals.
            </p>
          )}
        </div>

        {/* Ad Slot: Below score circle */}
        <div className="mb-8">
          <AdBanner slot="leaderboard" isPro={tier === 'pro'} />
        </div>

        {/* Benchmark Comparison */}
        {result.benchmarks && (
          <div className="card mb-12">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center sm:border-r border-border pb-4 sm:pb-0">
                <p className="text-gray-400 text-sm mb-2">Your Score</p>
                <p className="text-3xl font-bold text-primary">{result.overallScore}</p>
              </div>
              <div className="text-center sm:border-r border-border pb-4 sm:pb-0">
                <p className="text-gray-400 text-sm mb-2">{result.jobRole} Average</p>
                <p className="text-3xl font-bold text-gray-300">{result.benchmarks.average}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Excellent Threshold</p>
                <p className="text-3xl font-bold text-accent">{result.benchmarks.excellent}</p>
              </div>
            </div>
            {/* Visual Percentile Bar */}
            <PercentileBar
              score={result.overallScore}
              average={result.benchmarks.average}
              excellent={result.benchmarks.excellent}
              percentile={result.benchmarks.percentile}
            />
          </div>
        )}

        {/* PROMPT Dimensions */}
        <div className="card mb-12 relative">
          <h3 className="text-xl font-bold text-white mb-2">PROMPT Dimensions</h3>
          <p className="text-sm text-gray-400 mb-8">Each letter of PROMPT measures a key aspect of prompt quality.</p>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-x-8 stagger-children">
            {DIMENSION_KEYS.map((key, idx) => (
              <DimensionBar key={key} dimKey={key} data={result.dimensions?.[key]} meta={DIMENSION_META[key]} feedback={DIMENSION_FEEDBACK[key]} blurred={isGuest && idx > 0} index={idx} />
            ))}
          </div>
          {isGuest && (
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface via-surface/90 to-transparent flex items-end justify-center pb-6 rounded-b-lg">
              <button
                onClick={() => {
                  setAuthMessage('Sign up free to unlock all 6 dimension insights.');
                  setShowAuth(true);
                  trackSignupInitiated({ source: 'result_dimensions' });
                }}
                className="btn-primary text-sm font-semibold px-6"
              >
                Sign up free to see all 6 dimensions
              </button>
            </div>
          )}
        </div>

        {/* Want to Improve? - Guide suggestions based on lowest-scoring dimensions */}
        {result.dimensions && (() => {
          const dimEntries = DIMENSION_KEYS
            .map((key) => {
              const data = result.dimensions[key];
              const meta = DIMENSION_META[key];
              if (!data || !meta) return null;
              const pct = (data.score / meta.maxScore) * 100;
              return { key, pct, label: meta.label, letter: meta.letter };
            })
            .filter((d): d is NonNullable<typeof d> => d != null)
            .sort((a, b) => a.pct - b.pct)
            .slice(0, 3)
            .filter((d) => d.pct < 75);

          if (dimEntries.length === 0) return null;

          const guideLinks = dimEntries
            .map((d) => {
              const slug = DIMENSION_GUIDE_MAP[d.key];
              const guide = GUIDES_CONTENT.find((g) => g.slug === slug);
              return guide ? { dimension: d, guide } : null;
            })
            .filter((item): item is NonNullable<typeof item> => item != null)
            // Deduplicate by guide slug
            .filter((item, idx, arr) => arr.findIndex((x) => x.guide.slug === item.guide.slug) === idx);

          if (guideLinks.length === 0) return null;

          return (
            <div className="card mb-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                Want to Improve?
              </h4>
              <p className="text-sm text-gray-400 mb-5">
                Based on your scores, these guides can help you strengthen your weakest dimensions.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guideLinks.map(({ dimension, guide }) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="block p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-primary hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-amber-500/20 text-amber-400">
                        {dimension.letter}
                      </span>
                      <span className="text-xs text-amber-400 font-medium">
                        Improve {dimension.label}
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors mb-1">
                      {guide.title}
                    </h5>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {guide.description}
                    </p>
                    <span className="text-xs text-primary mt-2 inline-block group-hover:translate-x-1 transition-transform">
                      Read guide →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Quick Fix - Aha Moment */}
        {result.improvements && result.improvements.length > 0 && (
          <div className="card mb-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/30 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 text-lg">&#9889;</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1">Quick Fix</h4>
                <p className="text-sm text-amber-200/80 mb-3">The #1 thing you can do right now to improve your score:</p>
                <p className="text-gray-200 text-sm leading-relaxed">{result.improvements[0]}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleNewAnalysis}
                    className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Fix it &amp; re-score &rarr;
                  </button>
                  {!isPro && result.improvements.length > 1 && (
                    <span className="text-xs text-gray-500">
                      +{result.improvements.length - 1} more fixes with full analysis
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strengths and Improvements */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12" style={{ lineHeight: 'var(--leading-relaxed)' }}>
          <div className="card">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Strengths
            </h4>
            <ul className="space-y-3">
              {result.strengths?.map((s, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5 flex-shrink-0">{'\u2713'}</span>
                  <span className="text-gray-300 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Areas for Improvement
            </h4>
            <ul className="space-y-3">
              {result.improvements?.map((imp, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-0.5 flex-shrink-0">{'\u2192'}</span>
                  <span className="text-gray-300 text-sm">{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Rewrite Suggestion */}
        {result.rewriteSuggestion && (
          <div className="card mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">AI Rewrite Suggestion</h4>
                {!isPro && (
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">PRO</span>
                )}
              </div>
              {isPro && (
                <button
                  onClick={() => setShowRewrite(!showRewrite)}
                  className="text-sm text-primary hover:text-accent transition-colors"
                  aria-expanded={showRewrite}
                  aria-label="Toggle AI rewrite suggestion"
                >
                  {showRewrite ? 'Hide' : 'Show Rewrite'}
                </button>
              )}
            </div>
            {isPro ? (
              <>
                {showRewrite && (
                  <div className="p-4 bg-slate-800/50 border border-primary/20 rounded-lg animate-fade-in">
                    <p className="text-gray-300 text-sm leading-relaxed italic">
                      &ldquo;{result.rewriteSuggestion}&rdquo;
                    </p>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(result.rewriteSuggestion || '');
                      }}
                      className="mt-3 text-xs text-primary hover:text-accent transition-colors"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                )}
                {!showRewrite && (
                  <p className="text-sm text-gray-400">
                    See how your prompt could be improved with AI-powered suggestions.
                  </p>
                )}
              </>
            ) : (
              <div className="relative">
                <div className="p-4 bg-slate-800/50 border border-border rounded-lg">
                  <p className="text-gray-500 text-sm leading-relaxed italic blur-sm select-none" aria-hidden="true">
                    &ldquo;{result.rewriteSuggestion.substring(0, 80)}...&rdquo;
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-surface/60 rounded-lg">
                  <Link
                    href="/pricing"
                    className="btn-primary text-sm font-semibold flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Unlock with Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Slot: Below improvements, above share */}
        <div className="mb-12">
          <AdBanner slot="rectangle" isPro={tier === 'pro'} />
        </div>

        {/* Reverse Challenge Result */}
        {challenger && result && (
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-gray-300 mb-3">
              {result.overallScore > challenger.score
                ? `\u{1F3C6} You beat ${challenger.name}'s score! ${result.overallScore} vs ${challenger.score}`
                : result.overallScore === challenger.score
                ? `\u{1F91D} Tied with ${challenger.name}! Both scored ${result.overallScore}`
                : `\u{1F624} So close! ${challenger.name} beat you by ${challenger.score - result.overallScore} points`}
            </p>
            <button
              onClick={async () => {
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const myName = 'I'; // could be user name if authenticated
                const text = result.overallScore > challenger.score
                  ? `I beat ${challenger.name}'s PROMPT Score! ${result.overallScore} vs ${challenger.score} \u{1F3C6} Can you beat mine?`
                  : `${challenger.name} beat me ${challenger.score} to ${result.overallScore} on ScoreMyPrompt! Can you do better?`;
                const challengeUrl = `${origin}/challenge?score=${result.overallScore}&grade=${result.grade}&name=${encodeURIComponent(myName)}`;
                await navigator.clipboard.writeText(`${text}\n${challengeUrl}`);
                setChallengeCopied(true);
                setTimeout(() => setChallengeCopied(false), 2000);
              }}
              className="btn-primary text-sm"
            >
              {challengeCopied ? 'Copied!' : result.overallScore > challenger.score ? '\u{1F3C6} Share Your Victory' : '\u{1F525} Challenge Back'}
            </button>
          </div>
        )}

        {/* Share Section - Desktop */}
        <div className="hidden sm:block card mb-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <h4 className="text-lg font-bold text-white mb-4">Share Your Score</h4>
          <p className="text-gray-400 mb-6 text-sm">
            Showcase your prompt engineering skills and compare with other professionals.
          </p>
          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Twitter/X */}
            <button onClick={handleShareTwitter} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Share on X">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </button>
            {/* LinkedIn */}
            <button onClick={handleShareLinkedIn} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Share on LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            {/* Bluesky */}
            <button onClick={handleShareBluesky} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Share on Bluesky">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 600 530"><path d="M135.72 44.03C202.216 93.951 273.74 195.86 300 249.834c26.262-53.974 97.782-155.883 164.28-205.804C520.074-1.248 630-46.996 630 105.28c0 30.394-17.396 255.372-27.6 291.96-35.466 127.196-165.416 159.608-282.348 139.952 204.396 34.764 256.272 149.876 144.012 265.2C345.766 924.724 300 844.5 300 844.5s-45.766 80.224-164.064-42.108C23.676 687.068 75.552 571.956 279.948 537.192 163.016 556.848 33.066 524.436-2.4 397.24-12.596 360.652-30 135.674-30 105.28-30-46.996 79.926-1.248 135.72 44.03z"/></svg>
              Bluesky
            </button>
            {/* Copy Link */}
            <button onClick={handleCopyLink} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Copy share link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {result.dimensions && (
              <ShareCard
                score={result.overallScore}
                grade={result.grade}
                gradeLabel={result.scoreLevel || gradeConfig.label}
                jobRole={result.jobRole || 'professionals'}
                percentile={result.benchmarks?.percentile || 50}
                dimensions={result.dimensions}
              />
            )}
            <a
              href={`/api/badge?score=${result.overallScore}&grade=${result.grade}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-lg font-semibold text-sm border border-primary/40 text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
              aria-label="Download score badge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Badge
            </a>
            <button
              onClick={handleChallenge}
              className="px-5 py-3 rounded-lg font-semibold text-sm border border-accent/40 text-accent hover:bg-accent/10 transition-colors flex items-center gap-2"
              aria-label="Challenge a friend"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              {challengeCopied ? 'Link Copied!' : 'Challenge a Friend'}
            </button>
          </div>
        </div>

        {/* Embed Your Score */}
        <div className="hidden sm:block card mb-12">
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={showEmbed}
            aria-label="Toggle embed code"
          >
            <div>
              <h4 className="text-lg font-bold text-white">Embed Your Score</h4>
              <p className="text-sm text-gray-400 mt-1">Add your PROMPT Score badge to your website, blog, or portfolio.</p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showEmbed ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showEmbed && (
            <div className="mt-6 space-y-6 animate-fade-in">
              {/* Live Preview */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preview</p>
                <div className="bg-dark rounded-lg p-4 border border-border flex justify-center">
                  <iframe
                    src={`/api/embed?score=${result.overallScore}&grade=${result.grade}&gradeLabel=${encodeURIComponent(result.scoreLevel || gradeConfig.label)}`}
                    width="280"
                    height="80"
                    style={{ border: 'none', borderRadius: '8px' }}
                    title="PROMPT Score Badge"
                  />
                </div>
              </div>
              {/* HTML Embed Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">HTML Embed</p>
                  <button
                    onClick={async () => {
                      const code = `<iframe src="${shareUrl}/api/embed?score=${result.overallScore}&grade=${result.grade}&gradeLabel=${encodeURIComponent(result.scoreLevel || gradeConfig.label)}" width="280" height="80" style="border:none;border-radius:8px" title="PROMPT Score Badge"></iframe>`;
                      await navigator.clipboard.writeText(code);
                      setEmbedCopied('html');
                      setTimeout(() => setEmbedCopied(null), 2000);
                    }}
                    className="text-xs text-primary hover:text-accent transition-colors"
                  >
                    {embedCopied === 'html' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-dark border border-border rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                  {`<iframe src="${shareUrl}/api/embed?score=${result.overallScore}&grade=${result.grade}&gradeLabel=${encodeURIComponent(result.scoreLevel || gradeConfig.label)}" width="280" height="80" style="border:none;border-radius:8px" title="PROMPT Score Badge"></iframe>`}
                </pre>
              </div>
              {/* Markdown Badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Markdown Badge</p>
                  <button
                    onClick={async () => {
                      const code = `[![PROMPT Score: ${result.overallScore} (${result.grade})](${shareUrl}/api/badge?score=${result.overallScore}&grade=${result.grade})](${shareUrl})`;
                      await navigator.clipboard.writeText(code);
                      setEmbedCopied('md');
                      setTimeout(() => setEmbedCopied(null), 2000);
                    }}
                    className="text-xs text-primary hover:text-accent transition-colors"
                  >
                    {embedCopied === 'md' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-dark border border-border rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                  {`[![PROMPT Score: ${result.overallScore} (${result.grade})](${shareUrl}/api/badge?score=${result.overallScore}&grade=${result.grade})](${shareUrl})`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Share Section - Mobile Sticky Bottom */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-border p-4 animate-slide-up">
          <div className="flex gap-2">
            {/* Twitter/X */}
            <button
              onClick={handleShareTwitter}
              className="min-w-[44px] min-h-[44px] rounded-lg text-sm border border-border text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center"
              title="Share on X"
              aria-label="Share on X"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedIn}
              className="min-w-[44px] min-h-[44px] rounded-lg text-sm border border-border text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center"
              title="Share on LinkedIn"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </button>
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="min-w-[44px] min-h-[44px] rounded-lg text-sm border border-border text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center"
              title={copied ? 'Copied!' : 'Copy Link'}
              aria-label="Copy share link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            </button>
            {/* Native Share (if available) */}
            <button
              onClick={handleNativeShare}
              className="btn-primary flex-1 font-semibold text-sm"
            >
              Share
            </button>
            <a
              href={`/api/badge?score=${result.overallScore}&grade=${result.grade}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[44px] min-h-[44px] rounded-lg font-semibold text-sm border border-primary/40 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
              title="Download Badge"
              aria-label="Download score badge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
            <button
              onClick={handleChallenge}
              className="min-w-[44px] min-h-[44px] rounded-lg font-semibold text-sm border border-accent/40 text-accent hover:bg-accent/10 transition-colors flex items-center justify-center"
              title="Challenge a Friend"
              aria-label="Challenge a friend"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </button>
          </div>
        </div>
        {/* Spacer for mobile sticky share bar */}
        <div className="sm:hidden h-20" />

        {/* CTA to Community */}
        <div className="card bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 text-center py-8">
          <h4 className="text-2xl font-bold text-white mb-3">Join the Community</h4>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm">
            Connect with thousands of prompt engineers. Share templates, learn best practices, and stay updated.
          </p>
          <a href="https://x.com/scoremyprompt" target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Follow @ScoreMyPrompt</a>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12 justify-center flex-wrap">
          <button onClick={handleNewAnalysis} className="btn-primary font-semibold">
            Analyze Another Prompt
          </button>
          {isPro && result.analysisId ? (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-secondary font-semibold flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {exporting ? 'Exporting...' : 'Export Report'}
            </button>
          ) : !isGuest && !isPro ? (
            <Link
              href="/pricing"
              className="btn-secondary font-semibold flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Report
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">PRO</span>
            </Link>
          ) : null}
          {isPro && (
            <Link href="/bulk" className="btn-secondary font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Bulk Analysis
            </Link>
          )}
        </div>
      </section>

      <Footer />

      {/* Progressive Profiling - shows after 3rd analysis */}
      {showProfile && (
        <ProfilePrompt
          onDismiss={dismissProfile}
          onComplete={(profileData) => {
            dismissProfile();
            console.log('Profile collected:', profileData);
          }}
        />
      )}
    </main>
  );
}
