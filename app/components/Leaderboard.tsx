'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n';
import type { LeaderboardEntry } from '../types';

const JOB_ROLE_FILTER_KEYS = ['All', 'Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering'];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500',
  'bg-yellow-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500',
  'bg-lime-500', 'bg-amber-500', 'bg-teal-500', 'bg-fuchsia-500',
  'bg-sky-500', 'bg-violet-500', 'bg-orange-500', 'bg-emerald-500',
  'bg-red-500', 'bg-slate-500', 'bg-stone-500', 'bg-zinc-500',
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function Leaderboard() {
  const t = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animatedRanks, setAnimatedRanks] = useState<Set<number>>(new Set());

  // Map filter keys to display labels
  const getFilterLabel = (key: string) => {
    if (key === 'All') return t.leaderboard.all;
    return key; // Job role names stay as-is (Marketing, Design, etc.)
  };

  const fetchLeaderboard = useCallback(async (role: string) => {
    setLoading(true);
    setError('');
    try {
      const params = role && role !== 'All' ? `?role=${encodeURIComponent(role)}` : '';
      const res = await fetch(`/api/leaderboard${params}`);
      if (!res.ok) throw new Error(t.leaderboard.loadFailed);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError(t.leaderboard.loadFailedDesc);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLeaderboard(selectedFilter);
  }, [selectedFilter, fetchLeaderboard]);

  useEffect(() => {
    if (loading || entries.length === 0) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const rank = parseInt((entry.target as HTMLElement).dataset.rank || '0');
          setAnimatedRanks((prev) => new Set([...prev, rank]));
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('[data-rank]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, entries]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-gray-300';
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-dark to-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {t.leaderboard.title}
            </h2>
            <p className="text-gray-400 text-sm">
              {t.leaderboard.subtitle}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">{t.leaderboard.yourBestScore}</p>
            <p className="text-2xl font-bold text-gray-400">--</p>
            <p className="text-xs text-gray-400 mt-1">
              <a href="#" className="text-primary hover:underline">
                {t.leaderboard.signInRanking}
              </a>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border" role="tablist">
          {JOB_ROLE_FILTER_KEYS.map((filter) => (
            <button
              key={filter}
              role="tab"
              aria-selected={selectedFilter === filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm min-h-[44px] inline-flex items-center ${
                selectedFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-gray-400 hover:border-primary'
              }`}
            >
              {getFilterLabel(filter)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {loading ? t.leaderboard.loading : `${entries.length}`}
        </div>
        {loading && (
          <div className="space-y-3" aria-busy="true">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700" />
                  <div className="w-12 h-12 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-24" />
                    <div className="h-3 bg-slate-700 rounded w-16" />
                  </div>
                  <div className="h-8 bg-slate-700 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="card text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchLeaderboard(selectedFilter)}
              className="btn-primary text-sm"
            >
              {t.leaderboard.retry}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && entries.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-2">{t.leaderboard.noEntries}</p>
            <p className="text-sm text-gray-400">
              {t.leaderboard.noEntriesDesc}
            </p>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const isAnimated = animatedRanks.has(entry.rank);
              const initials = getInitials(entry.display_name);
              return (
                <div
                  key={entry.rank}
                  data-rank={entry.rank}
                  className={`card hover:border-primary/50 hover:bg-slate-800/30 transition-all duration-300 ${
                    isAnimated ? 'animate-fade-in' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    {/* Rank */}
                    <div className="flex items-center gap-4 min-w-max">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <span className="font-bold text-white text-sm">
                          {entry.rank}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 ${getAvatarColor(idx)} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="font-bold text-white text-sm">
                          {initials}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base">
                        {entry.display_name}
                      </h3>
                      <p className="text-xs text-gray-400">{entry.job_role}</p>
                    </div>

                    {/* Prompt Preview - Hidden on mobile */}
                    <div className="hidden lg:block flex-1 min-w-0">
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {entry.prompt_preview}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right min-w-fit">
                      <p
                        className={`text-2xl font-bold ${getScoreColor(entry.score)}`}
                      >
                        {entry.score}
                      </p>
                      <p className="text-xs text-gray-400">/ 100</p>
                    </div>

                    {/* View Recipe Button */}
                    <div className="relative group w-full sm:w-auto">
                      <button
                        disabled
                        className="btn-secondary w-full sm:w-auto opacity-50 cursor-not-allowed text-sm"
                        title={t.leaderboard.comingSoon}
                      >
                        {t.leaderboard.viewRecipe}
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        {t.leaderboard.comingSoon}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-center">
          <p className="text-gray-300 mb-4">
            {t.leaderboard.communityTitle}
          </p>
          <p className="text-sm text-gray-400">
            {t.leaderboard.communitySubtitle}
          </p>
          <a
            href="#"
            className="text-primary hover:text-accent transition-colors mt-2 inline-block text-sm font-medium"
          >
            {t.leaderboard.startAnalyzing} →
          </a>
        </div>
      </div>
    </section>
  );
}
