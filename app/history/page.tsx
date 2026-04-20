'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useTranslation } from '@/app/i18n';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import type { Grade, DimensionMeta } from '@/app/types';
import Footer from '../components/Footer';
import { LOADING, EMPTY, AUTH, CTA } from '../constants/messages';

type DimensionKey = 'precision' | 'role' | 'outputFormat' | 'missionContext' | 'promptStructure' | 'tailoring';

interface HistoryDimensionScore {
  score: number;
  feedback: string;
}

interface HistoryAnalysis {
  id: string;
  date: string;
  promptPreview: string;
  score: number;
  grade: Grade;
  jobRole: string;
  dimensions: Record<DimensionKey, HistoryDimensionScore>;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

interface DimensionBarProps {
  dimKey: string;
  data: HistoryDimensionScore;
}

const GRADE_CONFIG: Record<Grade, { color: string }> = {
  S: { color: '#10b981' },
  A: { color: '#3b82f6' },
  B: { color: '#f59e0b' },
  C: { color: '#f97316' },
  D: { color: '#ef4444' },
};

const DIMENSION_META: Record<DimensionKey, DimensionMeta> = {
  precision: { label: 'P — Precision', letter: 'P', maxScore: 20 },
  role: { label: 'R — Role', letter: 'R', maxScore: 15 },
  outputFormat: { label: 'O — Output Format', letter: 'O', maxScore: 15 },
  missionContext: { label: 'M — Mission Context', letter: 'M', maxScore: 20 },
  promptStructure: { label: 'P — Structure', letter: 'P', maxScore: 15 },
  tailoring: { label: 'T — Tailoring', letter: 'T', maxScore: 15 },
};

const DimensionBar = ({ dimKey, data }: DimensionBarProps) => {
  const meta = DIMENSION_META[dimKey as DimensionKey];
  if (!meta || !data) return null;

  const pct = (data.score / meta.maxScore) * 100;
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: color + '22', color }}
          >
            {meta.letter}
          </span>
          <span className="font-medium text-white text-xs">{meta.label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>
          {data.score}/{meta.maxScore}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const JOB_ROLES = ['All', 'Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering'];
const GRADES = ['All', 'S', 'A', 'B', 'C', 'D'];

export default function HistoryPage() {
  const router = useRouter();
  const { user, supabase, loading: authLoading, setShowAuth, setAuthMessage } = useAuth();
  const t = useTranslation();
  const [analyses, setAnalyses] = useState<HistoryAnalysis[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [jobRoleFilter, setJobRoleFilter] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 20;

  const fetchAnalyses = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!supabase) return;

    try {
      if (!append) setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const params = new URLSearchParams({
        role: jobRoleFilter,
        grade: gradeFilter,
        sort: sortBy,
        page: String(pageNum),
        limit: String(ITEMS_PER_PAGE),
      });

      const response = await fetch(`/api/history?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthMessage(AUTH.SIGN_IN_HISTORY);
          setShowAuth(true);
          router.push('/');
          return;
        }
        return;
      }

      const result = await response.json();

      if (append) {
        setAnalyses((prev) => [...prev, ...result.analyses]);
      } else {
        setAnalyses(result.analyses);
      }
      setTotal(result.total);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  }, [supabase, jobRoleFilter, gradeFilter, sortBy, router, setShowAuth, setAuthMessage]);

  useEffect(() => {
    if (!authLoading && !user) {
      setAuthMessage(AUTH.SIGN_IN_HISTORY);
      setShowAuth(true);
      router.push('/');
    }
  }, [user, authLoading, router, setShowAuth, setAuthMessage]);

  // Fetch when filters change
  useEffect(() => {
    if (user && supabase) {
      setPage(1);
      fetchAnalyses(1, false);
    }
  }, [user, supabase, jobRoleFilter, gradeFilter, sortBy, fetchAnalyses]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnalyses(nextPage, true);
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Skeleton variant="rect" className="h-10 w-64 mb-12" />
          <Skeleton variant="card" className="mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
                <Skeleton variant="circle" width={64} height={64} />
                <div className="flex-1">
                  <Skeleton variant="rect" className="h-4 w-1/4 mb-2" />
                  <Skeleton variant="rect" className="h-4 w-3/4 mb-2" />
                  <Skeleton variant="rect" className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
      <section id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white">{t.history.title}</h2>
          {total > 0 && (
            <span className="text-sm text-gray-400">{t.history.totalAnalyses.replace('{total}', String(total))}</span>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.history.jobRole}
              </label>
              <select
                value={jobRoleFilter}
                onChange={(e) => setJobRoleFilter(e.target.value)}
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.history.grade}
              </label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t.history.sortBy}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="newest">{t.history.newest}</option>
                <option value="oldest">{t.history.oldest}</option>
                <option value="highest">{t.history.highestScore}</option>
                <option value="lowest">{t.history.lowestScore}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State — Skeleton */}
        {loading && analyses.length === 0 && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
                <Skeleton variant="circle" width={64} height={64} />
                <div className="flex-1">
                  <Skeleton variant="rect" className="h-4 w-1/4 mb-2" />
                  <Skeleton variant="rect" className="h-4 w-3/4 mb-2" />
                  <Skeleton variant="rect" className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && analyses.length === 0 && (
          <EmptyState
            title={EMPTY.HISTORY_TITLE}
            description={EMPTY.HISTORY_DESC}
            action={{ label: CTA.SCORE_A_PROMPT, href: '/' }}
          />
        )}

        {/* Analyses List */}
        {analyses.length > 0 && (
          <>
            <div className="space-y-4 mb-8">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="card">
                  {/* Summary Row */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === analysis.id ? null : analysis.id)
                    }
                    className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Score Circle */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg width={64} height={64} className="transform -rotate-90">
                          <circle cx={32} cy={32} r={28} fill="none" stroke="#1e293b" strokeWidth="6" />
                          <circle
                            cx={32}
                            cy={32}
                            r={28}
                            fill="none"
                            stroke={GRADE_CONFIG[analysis.grade].color}
                            strokeWidth="6"
                            strokeDasharray={Math.PI * 56}
                            strokeDashoffset={
                              Math.PI * 56 - (analysis.score / 100) * Math.PI * 56
                            }
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-xs font-bold" style={{ color: GRADE_CONFIG[analysis.grade].color }}>
                            {analysis.score}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <p className="text-sm text-gray-400 mb-1">
                          {new Date(analysis.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-white line-clamp-1">
                          {analysis.promptPreview || `${analysis.jobRole} prompt — scored ${analysis.score}/100`}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: GRADE_CONFIG[analysis.grade].color + '22',
                              color: GRADE_CONFIG[analysis.grade].color,
                            }}
                          >
                            {t.history.gradeLabel.replace('{grade}', analysis.grade)}
                          </span>
                          <span className="inline-block px-2 py-1 rounded text-xs bg-slate-800 text-gray-400">
                            {analysis.jobRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-primary transition-transform ml-4 flex-shrink-0 ${
                        expandedId === analysis.id ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === analysis.id && analysis.dimensions && (
                    <div className="mt-6 pt-6 border-t border-border animate-fade-in">
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-white mb-4">{t.history.promptDimensions}</h4>
                        <div className="grid sm:grid-cols-2 gap-x-6">
                          {(Object.keys(DIMENSION_META) as DimensionKey[]).map((key) => (
                            analysis.dimensions[key] ? (
                              <DimensionBar key={key} dimKey={key} data={analysis.dimensions[key]} />
                            ) : null
                          ))}
                        </div>
                      </div>

                      <button className="btn-secondary w-full text-sm font-medium">
                        {t.history.reAnalyze}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="btn-secondary font-semibold px-8 py-3"
                >
                  {t.history.loadMore}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
