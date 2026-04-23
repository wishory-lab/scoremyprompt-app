'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import dynamic from 'next/dynamic';
import AnalysisLoading from '../components/AnalysisLoading';
import type { Grade, AnalysisResult, GradeConfig } from '../types';
import { GRADE_CONFIG as GRADE_CONFIG_CENTRAL } from '../constants';
import { trackResultViewed, trackGradeCompleted, trackSignupInitiated, trackReturnAnalysis } from '../lib/analytics';
import { useTranslation } from '../i18n';
import { useProfilePrompt } from '../components/ProfilePrompt';
import { useToast } from '../components/Toast';

// Sub-components (extracted from this monolith)
import ScoreHero from './components/ScoreHero';
import BenchmarkComparison from './components/BenchmarkComparison';
import DimensionSection from './components/DimensionSection';
import ActionButtons from './components/ActionButtons';

// Lazy-load below-the-fold & heavy components
const AdBanner = dynamic(() => import('../components/AdBanner'), { ssr: false });
const Footer = dynamic(() => import('../components/Footer'), { ssr: false });
const ProfilePrompt = dynamic(() => import('../components/ProfilePrompt'), { ssr: false });
const GuideSuggestions = dynamic(() => import('./components/GuideSuggestions'), { ssr: false });
const QuickFix = dynamic(() => import('./components/QuickFix'), { ssr: false });
const StrengthsAndImprovements = dynamic(() => import('./components/StrengthsAndImprovements'), { ssr: false });
const RewriteSuggestion = dynamic(() => import('./components/RewriteSuggestion'), { ssr: false });
const ChallengerResult = dynamic(() => import('./components/ChallengerResult'), { ssr: false });
const ShareSection = dynamic(() => import('./components/ShareSection'), { ssr: false });
const CommunityCTA = dynamic(() => import('./components/CommunityCTA'), { ssr: false });
const TrialBanner = dynamic(() => import('../components/TrialBanner'), { ssr: false });

interface ExtendedGradeConfig extends GradeConfig {
  bg: string;
}

// Extend centralized GRADE_CONFIG with gradient backgrounds for the result page
const GRADE_CONFIG: Record<Grade, ExtendedGradeConfig> = {
  S: { ...GRADE_CONFIG_CENTRAL.S, bg: 'from-emerald-500/20 to-emerald-600/10' },
  A: { ...GRADE_CONFIG_CENTRAL.A, bg: 'from-blue-500/20 to-blue-600/10' },
  B: { ...GRADE_CONFIG_CENTRAL.B, bg: 'from-amber-500/20 to-amber-600/10' },
  C: { ...GRADE_CONFIG_CENTRAL.C, bg: 'from-orange-500/20 to-orange-600/10' },
  D: { ...GRADE_CONFIG_CENTRAL.D, bg: 'from-red-500/20 to-red-600/10' },
};

export default function ResultPage() {
  const router = useRouter();
  const t = useTranslation();
  const { showToast } = useToast();
  const { user, tier, supabase, setShowAuth, setAuthMessage, trial } = useAuth();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [challenger, setChallenger] = useState<{ name: string; score: number; grade: string } | null>(null);
  const isGuest = !user;
  const isPro = tier === 'premium' || tier === 'pro' || trial.active;
  const { shouldShow: showProfile, dismiss: dismissProfile } = useProfilePrompt();

  // --- Data loading ---
  useEffect(() => {
    const resultData = sessionStorage.getItem('promptResult');
    if (resultData) {
      const parsed = JSON.parse(resultData);
      setResult(parsed);
      setLoading(false);
      trackResultViewed({ score: parsed.overallScore, grade: parsed.grade, jobRole: parsed.jobRole || '' });
      trackGradeCompleted({ jobRole: parsed.jobRole || '', score: parsed.overallScore, grade: parsed.grade });

      // Track return analysis
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

  // Challenger data from challenge flow
  useEffect(() => {
    const stored = sessionStorage.getItem('challenger');
    if (stored) {
      try {
        setChallenger(JSON.parse(stored));
        sessionStorage.removeItem('challenger');
      } catch { /* ignore */ }
    }
  }, []);

  // --- Share URL (permalink) ---
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://scoremyprompt.com';
  const shareUrl = result?.shareId
    ? `${origin}/share/${result.shareId}`
    : origin;

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('promptResult');
    router.push('/');
  };

  const handleDimensionSignup = () => {
    setAuthMessage(t.auth.signInDimensions);
    setShowAuth(true);
    trackSignupInitiated({ source: 'result_dimensions' });
  };

  const handleExport = async (format: 'html' | 'csv' = 'html') => {
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
        body: JSON.stringify({ analysisId: result.analysisId, format }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('Export failed:', err);
        showToast('내보내기에 실패했습니다. 다시 시도해주세요.', 'error');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'csv' ? 'csv' : 'html';
      a.download = `prompt-analysis-${result.analysisId}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`${ext.toUpperCase()} 리포트 다운로드 완료`, 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('내보내기 중 오류가 발생했습니다.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // --- Loading state ---
  if (loading || !result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center px-4 pt-14">
        <div className="max-w-md w-full">
          <AnalysisLoading />
        </div>
      </main>
    );
  }

  const gradeConfig = GRADE_CONFIG[result.grade] || GRADE_CONFIG.B;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
      <section id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Score Hero */}
        <ScoreHero result={result} gradeConfig={gradeConfig} />

        {/* Ad Slot: Below score circle */}
        <div className="mb-8">
          <AdBanner slot="leaderboard" isPro={isPro} />
        </div>

        {/* Benchmark Comparison */}
        {result.benchmarks && <BenchmarkComparison result={result} />}

        {/* PROMPT Dimensions */}
        <DimensionSection
          dimensions={result.dimensions}
          isGuest={isGuest}
          onSignupClick={handleDimensionSignup}
        />

        {/* Guide Suggestions */}
        {result.dimensions && <GuideSuggestions dimensions={result.dimensions} />}

        {/* Quick Fix */}
        <QuickFix
          improvements={result.improvements}
          isPro={isPro}
          onNewAnalysis={handleNewAnalysis}
        />

        {/* Strengths and Improvements */}
        <StrengthsAndImprovements
          strengths={result.strengths}
          improvements={result.improvements}
        />

        {/* AI Rewrite Suggestion */}
        <RewriteSuggestion
          suggestion={result.rewriteSuggestion}
          isPro={isPro}
          gradeLabel={result.scoreLevel || gradeConfig.label}
        />

        {/* Ad Slot: Below improvements, above share */}
        <div className="mb-12">
          <AdBanner slot="rectangle" isPro={isPro} />
        </div>

        {/* Reverse Challenge Result */}
        {challenger && (
          <ChallengerResult
            challenger={challenger}
            myScore={result.overallScore}
            myGrade={result.grade}
          />
        )}

        {/* Share Section (Desktop + Mobile + Embed) */}
        <ShareSection
          result={result}
          gradeConfig={gradeConfig}
          shareUrl={shareUrl}
        />

        {/* Pro Trial Banner (for non-Pro users) */}
        {!isPro && (
          <div className="mb-12">
            <TrialBanner />
          </div>
        )}

        {/* CTA to Community */}
        <CommunityCTA />

        {/* Action Buttons */}
        <ActionButtons
          isPro={isPro}
          isGuest={isGuest}
          analysisId={result.analysisId}
          exporting={exporting}
          onNewAnalysis={handleNewAnalysis}
          onExport={handleExport}
        />
      </section>

      <Footer />

      {/* Progressive Profiling */}
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
