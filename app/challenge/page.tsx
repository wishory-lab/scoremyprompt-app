'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n';
import { GRADE_COLORS } from '@/app/constants';
import type { Grade } from '@/app/types';
import Footer from '../components/Footer';

const GRADE_LABELS: Record<Grade, string> = {
  S: 'S-Tier',
  A: 'A-Tier',
  B: 'B-Tier',
  C: 'C-Tier',
  D: 'D-Tier',
};

function ChallengeContent(): React.JSX.Element {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const score: string = searchParams.get('score') || '0';
  const gradeParam: string = searchParams.get('grade') || 'B';
  const grade: Grade = (gradeParam in GRADE_COLORS ? gradeParam : 'B') as Grade;
  const name: string | null = searchParams.get('name');

  const gradeColor: string = GRADE_COLORS[grade] || GRADE_COLORS.B;
  const gradeLabel: string = GRADE_LABELS[grade] || grade;

  useEffect(() => {
    // Save challenger info for reverse-share flow
    const challengerData = {
      name: name || 'Someone',
      score: parseInt(score, 10),
      grade,
    };
    sessionStorage.setItem('challenger', JSON.stringify(challengerData));
  }, [name, score, grade]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center animate-fade-in">
          {/* Challenge badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface mb-8">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: gradeColor }} />
            <span className="text-sm font-medium text-gray-300">{t.challengeDetail.title}</span>
          </div>

          {/* Score display */}
          <div className="mb-6">
            <p className="text-7xl sm:text-9xl font-extrabold leading-none" style={{ color: gradeColor }}>
              {score}
            </p>
            <p className="text-gray-400 text-lg mt-2">{t.challengeDetail.points}</p>
          </div>

          {/* Grade badge */}
          <div className="flex justify-center mb-8">
            <span
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: gradeColor + '22', color: gradeColor, border: `1px solid ${gradeColor}44` }}
            >
              {t.challengeDetail.gradeLabel.replace('{grade}', grade).replace('{label}', gradeLabel)}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t.challengeDetail.canYouBeat.replace('{score}', score)}
          </h2>

          {/* Challenger message */}
          {name ? (
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-4">
              {name} scored <span className="font-semibold text-white">{score}/100</span>. Can you do better?
            </p>
          ) : (
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-4">
              Someone scored <span className="font-semibold text-white">{score}/100</span> on their AI prompt. Think you can beat that?
            </p>
          )}

          <p className="text-gray-400 text-sm mb-10">
            {t.challengeDetail.subtitle}
          </p>

          {/* CTA Button */}
          <Link
            href="/"
            className="btn-primary inline-block text-lg font-semibold px-10 py-4 shadow-lg hover:shadow-xl transition-all"
          >
            {t.challengeDetail.takeChallenge}
          </Link>

          {/* Additional info */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6 pt-12 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-gray-400 text-sm mt-1">{t.challengeDetail.scoringDimensions}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">30s</p>
              <p className="text-gray-400 text-sm mt-1">{t.challengeDetail.aiPoweredAnalysis}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Free</p>
              <p className="text-gray-400 text-sm mt-1">{t.challengeDetail.noSignupRequired}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ChallengePage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
      }
    >
      <ChallengeContent />
    </Suspense>
  );
}
