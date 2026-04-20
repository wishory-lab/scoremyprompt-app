'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import type { Grade } from '@/app/types';
import Footer from '../components/Footer';
import { ERRORS, LOADING, EMPTY, AUTH, CTA } from '../constants/messages';

interface DashboardStats {
  totalAnalyses: number;
  bestScore: { value: number; grade: Grade };
  averageScore: number;
  mostUsedRole: string;
}

interface TrendDataPoint {
  date: string;
  score: number;
}

interface RecentAnalysis {
  id: string;
  date: string;
  promptPreview: string;
  score: number;
  grade: Grade;
  jobRole?: string;
}

interface DashboardData {
  stats: DashboardStats;
  trend: TrendDataPoint[];
  recent: RecentAnalysis[];
}

interface GradeStyle {
  color: string;
}

const GRADE_CONFIG: Record<Grade, GradeStyle> = {
  S: { color: '#10b981' },
  A: { color: '#3b82f6' },
  B: { color: '#f59e0b' },
  C: { color: '#f97316' },
  D: { color: '#ef4444' },
};

function getBarColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#3b82f6';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, supabase, tier, loading: authLoading, setShowAuth, setAuthMessage } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthMessage(AUTH.SIGN_IN_DASHBOARD);
          setShowAuth(true);
          router.push('/');
          return;
        }
        throw new Error(ERRORS.DASHBOARD_LOAD);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERRORS.DASHBOARD_LOAD);
    } finally {
      setLoading(false);
    }
  }, [supabase, router, setShowAuth, setAuthMessage]);

  useEffect(() => {
    if (!authLoading && !user) {
      setAuthMessage(AUTH.SIGN_IN_DASHBOARD);
      setShowAuth(true);
      router.push('/');
    }
  }, [user, authLoading, router, setShowAuth, setAuthMessage]);

  useEffect(() => {
    if (user && supabase) {
      fetchDashboard();
    }
  }, [user, supabase, fetchDashboard]);

  const handlePortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to open portal');
      }

      const { url } = (await response.json()) as { url: string };
      if (url) {
        window.location.href = url;
      }
    } catch (err: unknown) {
      console.error('Portal error:', err);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Skeleton variant="rect" className="h-10 w-64 mb-12" />
          <div className="grid sm:grid-cols-4 gap-4 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-6">
                <Skeleton variant="rect" className="h-4 w-24 mb-3" />
                <Skeleton variant="rect" className="h-8 w-16" />
              </div>
            ))}
          </div>
          <Skeleton variant="card" className="mb-12" />
        </div>
      </main>
    );
  }

  const isPro = tier === 'premium' || tier === 'pro';
  const stats = data?.stats;
  const trendData = data?.trend || [];
  const recentAnalyses = data?.recent || [];
  const hasData = stats && stats.totalAnalyses > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
      <section id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-4xl font-bold text-white mb-12">Your Dashboard</h2>

        {error && (
          <div className="card mb-8 border-red-500/30 bg-red-500/5 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchDashboard} className="btn-secondary mt-3 text-sm">
              Try Again
            </button>
          </div>
        )}

        {loading && !data && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-6">
                  <Skeleton variant="rect" className="h-4 w-24 mb-3" />
                  <Skeleton variant="rect" className="h-8 w-16" />
                </div>
              ))}
            </div>
            <div className="bg-surface border border-border rounded-lg p-6">
              <Skeleton variant="rect" className="h-5 w-48 mb-6" />
              <Skeleton variant="rect" className="h-64 w-full" />
            </div>
            <div className="bg-surface border border-border rounded-lg p-6">
              <Skeleton variant="rect" className="h-5 w-40 mb-6" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                    <Skeleton variant="circle" width={48} height={48} />
                    <div className="flex-1">
                      <Skeleton variant="rect" className="h-4 w-3/4 mb-2" />
                      <Skeleton variant="rect" className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && !hasData && !error && (
          <EmptyState
            title={EMPTY.DASHBOARD_TITLE}
            description={EMPTY.DASHBOARD_DESC}
            action={{ label: CTA.SCORE_A_PROMPT, href: '/' }}
          />
        )}

        {hasData && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-4 gap-4 mb-12">
              <div className="card">
                <p className="text-gray-400 text-sm mb-2">Total Analyses</p>
                <p className="text-3xl font-bold text-white">{stats.totalAnalyses}</p>
              </div>

              <div className="card">
                <p className="text-gray-400 text-sm mb-2">Best Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">{stats.bestScore.value}</p>
                  <span
                    className="text-sm font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: GRADE_CONFIG[stats.bestScore.grade].color + '22',
                      color: GRADE_CONFIG[stats.bestScore.grade].color,
                    }}
                  >
                    {stats.bestScore.grade}
                  </span>
                </div>
              </div>

              <div className="card">
                <p className="text-gray-400 text-sm mb-2">Average Score</p>
                <p className="text-3xl font-bold text-white">{stats.averageScore}</p>
              </div>

              <div className="card">
                <p className="text-gray-400 text-sm mb-2">Most Used Role</p>
                <p className="text-3xl font-bold text-white">{stats.mostUsedRole}</p>
              </div>
            </div>

            {/* Score Trend Section */}
            {trendData.length > 0 && (
              <div className="card mb-12">
                <h3 className="text-xl font-bold text-white mb-6">Score Trend (Last 14 Days)</h3>
                <div className="h-64 flex items-end gap-1.5 px-2 pb-2 pt-6 bg-slate-800/50 rounded-lg border border-border relative">
                  <div className="absolute left-2 top-2 bottom-8 flex flex-col justify-between text-xs text-gray-400 w-6">
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                  <div className="flex items-end gap-1.5 flex-1 ml-8 h-full">
                    {trendData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div
                          className="w-full rounded-t-sm min-w-[6px] transition-all duration-300 hover:opacity-80"
                          style={{
                            height: `${d.score}%`,
                            backgroundColor: getBarColor(d.score),
                          }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {d.score}
                        </div>
                        {i % 3 === 0 && (
                          <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">
                            {d.date.slice(5)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Analyses */}
            {recentAnalyses.length > 0 && (
              <div className="card mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Analyses</h3>
                  <a href="/history" className="text-sm text-primary hover:text-accent transition-colors">
                    View all →
                  </a>
                </div>

                <div className="space-y-3">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <svg width={48} height={48} className="transform -rotate-90">
                            <circle cx={24} cy={24} r={20} fill="none" stroke="#1e293b" strokeWidth="4" />
                            <circle
                              cx={24}
                              cy={24}
                              r={20}
                              fill="none"
                              stroke={GRADE_CONFIG[analysis.grade].color}
                              strokeWidth="4"
                              strokeDasharray={Math.PI * 40}
                              strokeDashoffset={
                                Math.PI * 40 - (analysis.score / 100) * Math.PI * 40
                              }
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-xs font-bold" style={{ color: GRADE_CONFIG[analysis.grade].color }}>
                              {analysis.score}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-300 line-clamp-1">{analysis.promptPreview || `${analysis.jobRole} prompt — scored ${analysis.score}/100`}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(analysis.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <span
                        className="text-xs font-bold px-2 py-1 rounded ml-2 flex-shrink-0"
                        style={{
                          backgroundColor: GRADE_CONFIG[analysis.grade].color + '22',
                          color: GRADE_CONFIG[analysis.grade].color,
                        }}
                      >
                        {analysis.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pro Section or Upgrade CTA */}
        {isPro ? (
          <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 mb-12">
            <h3 className="text-xl font-bold text-white mb-4">Pro Subscription</h3>
            <p className="text-gray-400 mb-6 text-sm">Manage your subscription and billing settings.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePortal}
                className="btn-primary font-semibold"
              >
                Manage Subscription
              </button>
              <a href="/bulk" className="btn-secondary font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Bulk Analysis
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-primary/30">
              <h4 className="text-lg font-bold text-white mb-4">API Key</h4>
              <p className="text-gray-400 text-sm">API access coming soon. You&apos;ll be able to integrate ScoreMyPrompt into your own apps.</p>
            </div>
          </div>
        ) : (
          <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-center py-8">
            <h3 className="text-2xl font-bold text-white mb-3">Upgrade to Pro</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Get unlimited analyses, auto-rewrite suggestions, and more.
            </p>
            <a href="/pricing" className="btn-primary inline-block">
              View Plans
            </a>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
