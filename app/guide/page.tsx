'use client';

import Link from 'next/link';
import { useTranslation } from '../i18n';

export default function GuidePage() {
  const t = useTranslation();

  const steps = [
    {
      step: 1,
      title: t.guide.step1Title,
      description: t.guide.step1Desc,
      tip: t.guide.step1Tip,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      step: 2,
      title: t.guide.step2Title,
      description: t.guide.step2Desc,
      tip: t.guide.step2Tip,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      step: 3,
      title: t.guide.step3Title,
      description: t.guide.step3Desc,
      tip: t.guide.step3Tip,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      step: 4,
      title: t.guide.step4Title,
      description: t.guide.step4Desc,
      tip: t.guide.step4Tip,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
  ];

  const dimensions = [
    { letter: 'P', name: t.guide.dimPrecisionName, color: '#6366f1', desc: t.guide.dimPrecisionDesc },
    { letter: 'R', name: t.guide.dimRoleName, color: '#8b5cf6', desc: t.guide.dimRoleDesc },
    { letter: 'O', name: t.guide.dimOutputName, color: '#a855f7', desc: t.guide.dimOutputDesc },
    { letter: 'M', name: t.guide.dimMissionName, color: '#d946ef', desc: t.guide.dimMissionDesc },
    { letter: 'P', name: t.guide.dimStructureName, color: '#ec4899', desc: t.guide.dimStructureDesc },
    { letter: 'T', name: t.guide.dimTailoringName, color: '#f43f5e', desc: t.guide.dimTailoringDesc },
  ];

  const features = [
    { title: t.guide.featPromptAnalysisTitle, href: '/', desc: t.guide.featPromptAnalysisDesc, free: true },
    { title: t.guide.featTemplatesTitle, href: '/templates', desc: t.guide.featTemplatesDesc, free: true },
    { title: t.guide.featGuidesTitle, href: '/guides', desc: t.guide.featGuidesDesc, free: true },
    { title: t.guide.featLeaderboardTitle, href: '/#leaderboard', desc: t.guide.featLeaderboardDesc, free: true },
    { title: t.guide.featShareCardTitle, href: null, desc: t.guide.featShareCardDesc, free: true },
    { title: t.guide.featDashboardTitle, href: '/dashboard', desc: t.guide.featDashboardDesc, free: false },
    { title: t.guide.featBulkTitle, href: '/bulk', desc: t.guide.featBulkDesc, free: false },
    { title: t.guide.featChallengeTitle, href: '/challenge', desc: t.guide.featChallengeDesc, free: true },
    { title: t.guide.featCompareTitle, href: '/compare', desc: t.guide.featCompareDesc, free: true },
  ];

  const faqs = [
    { q: t.guide.faq1Q, a: t.guide.faq1A },
    { q: t.guide.faq2Q, a: t.guide.faq2A },
    { q: t.guide.faq3Q, a: t.guide.faq3A },
    { q: t.guide.faq4Q, a: t.guide.faq4A },
    { q: t.guide.faq5Q, a: t.guide.faq5A },
  ];

  const grades = [
    { grade: 'S', range: '90-100', label: t.guide.gradeSLabel, color: '#10b981' },
    { grade: 'A', range: '80-89', label: t.guide.gradeALabel, color: '#3b82f6' },
    { grade: 'B', range: '65-79', label: t.guide.gradeBLabel, color: '#f59e0b' },
    { grade: 'C', range: '50-64', label: t.guide.gradeCLabel, color: '#f97316' },
    { grade: 'D', range: '0-49', label: t.guide.gradeDLabel, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">

        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-400 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.guide.beginnerTag}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {t.guide.howToUse} <span className="text-gradient">ScoreMyPrompt</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.guide.heroSubtitle}
          </p>
        </header>

        <section className="mb-20" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="text-2xl font-bold text-white mb-8 text-center">
            {t.guide.stepsHeading}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {steps.map(({ step, title, description, tip, icon }) => (
              <div
                key={step}
                className="relative bg-surface/50 border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-indigo-400 mb-1">{t.guide.stepLabel} {step}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{description}</p>
                    <p className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">💡</span> {tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20" aria-labelledby="dimensions-heading">
          <h2 id="dimensions-heading" className="text-2xl font-bold text-white mb-3 text-center">
            {t.guide.frameworkHeading}
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-lg mx-auto text-sm">
            {t.guide.frameworkDesc}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dimensions.map(({ letter, name, color, desc }, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-surface/30 border border-white/5 rounded-xl p-4"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {letter}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-bold text-white mb-3 text-center">
            {t.guide.featuresHeading}
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            {t.guide.featuresSubtitle}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, href, desc, free }) => {
              const inner = (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      free ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {free ? t.guide.featFreeBadge : t.guide.featProBadge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </>
              );
              const className = 'bg-surface/30 border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 transition-colors block';
              return href ? (
                <Link key={title} href={href} className={className}>{inner}</Link>
              ) : (
                <div key={title} className={className}>{inner}</div>
              );
            })}
          </div>
        </section>

        <section className="mb-20" aria-labelledby="grades-heading">
          <h2 id="grades-heading" className="text-2xl font-bold text-white mb-8 text-center">
            {t.guide.gradeScaleHeading}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {grades.map(({ grade, range, label, color }) => (
              <div
                key={grade}
                className="flex items-center gap-3 bg-surface/30 border border-white/5 rounded-xl px-5 py-3 min-w-[140px]"
              >
                <span className="text-2xl font-bold" style={{ color }}>{grade}</span>
                <div>
                  <div className="text-xs text-white font-medium">{label}</div>
                  <div className="text-[10px] text-gray-500">{range} {t.guide.gradePtsSuffix}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-white mb-8 text-center">
            {t.guide.faqHeading}
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map(({ q, a }, i) => (
              <details
                key={i}
                className="group bg-surface/30 border border-white/5 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-white hover:text-indigo-300 transition-colors">
                  {q}
                  <svg
                    className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform shrink-0 ml-2"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              {t.guide.ctaReadyTitle}
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              {t.guide.ctaReadySubtitle}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              {t.guide.ctaButton}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
