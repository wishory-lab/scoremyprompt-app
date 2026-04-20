'use client';

import { useTranslation } from '../i18n';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardContent() {
  const t = useTranslation();

  return (
    <main id="main-content" className="min-h-screen pt-14">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              {t.leaderboard.pageTitle}
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            {t.leaderboard.pageSubtitle}
          </p>
        </div>

        {/* Leaderboard Component */}
        <Leaderboard />

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-2">{t.leaderboard.ctaTitle}</h2>
            <p className="text-gray-400 text-sm mb-5">
              {t.leaderboard.ctaSubtitle}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:brightness-110 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t.leaderboard.ctaButton}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
