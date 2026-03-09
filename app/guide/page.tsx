import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Use — ScoreMyPrompt',
  description: 'Learn how to use ScoreMyPrompt to grade, improve, and master your AI prompts. Step-by-step guide for beginners.',
  alternates: { canonical: 'https://scoremyprompt.com/guide' },
};

/* ── Data ── */

const STEPS = [
  {
    step: 1,
    title: 'Write or paste your prompt',
    description: 'Enter any AI prompt you want to grade. It can be for ChatGPT, Claude, Gemini — any AI model.',
    tip: 'Select your job role for more relevant scoring.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Get your PROMPT Score',
    description: 'AI analyzes your prompt across 6 dimensions and gives you a score from 0-100 with a letter grade (S/A/B/C/D).',
    tip: 'Each dimension shows exactly where your prompt is strong or weak.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Read improvement tips',
    description: 'Get specific, actionable suggestions to strengthen each weak area of your prompt.',
    tip: 'Tips are tailored to your job role and use case.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: 'Share or iterate',
    description: 'Share your score card, compare with the leaderboard, or revise your prompt and try again for a higher score.',
    tip: 'Pro users can analyze prompts in bulk.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
];

const DIMENSIONS = [
  { letter: 'P', name: 'Precision', color: '#6366f1', desc: 'How specific and clear is your request?' },
  { letter: 'R', name: 'Role', color: '#8b5cf6', desc: 'Does the prompt define who the AI should be?' },
  { letter: 'O', name: 'Output Format', color: '#a855f7', desc: 'Did you specify the desired format?' },
  { letter: 'M', name: 'Mission Context', color: '#d946ef', desc: 'Is the background and purpose clear?' },
  { letter: 'P', name: 'Structure', color: '#ec4899', desc: 'Is it well-organized and logical?' },
  { letter: 'T', name: 'Tailoring', color: '#f43f5e', desc: 'Is it customized for a specific audience?' },
];

const FEATURES = [
  { title: 'Prompt Analysis', href: '/', desc: 'Grade any prompt in 30 seconds with AI-powered scoring.', free: true },
  { title: 'Templates', href: '/templates', desc: 'Pre-built high-scoring prompt templates by profession.', free: true },
  { title: 'Guides', href: '/guides', desc: 'In-depth articles on prompt engineering best practices.', free: true },
  { title: 'Leaderboard', href: '/#leaderboard', desc: 'See how your prompts rank against others.', free: true },
  { title: 'Share Card', href: null, desc: 'Beautiful shareable result cards for social media.', free: true },
  { title: 'Dashboard', href: '/dashboard', desc: 'Track your prompt scores over time.', free: false },
  { title: 'Bulk Analysis', href: '/bulk', desc: 'Analyze multiple prompts at once. (Pro)', free: false },
  { title: 'Challenge Mode', href: '/challenge', desc: 'Challenge others to beat your prompt score.', free: true },
  { title: 'Compare Mode', href: '/compare', desc: 'Compare two prompts side by side.', free: true },
];

const FAQS = [
  { q: 'Is it really free?', a: 'Yes! Basic prompt scoring is free with no signup required. Pro features like bulk analysis and dashboard require a subscription.' },
  { q: 'What AI models does this work for?', a: 'ScoreMyPrompt evaluates prompts universally — the PROMPT Score framework applies to ChatGPT, Claude, Gemini, Copilot, and any other AI.' },
  { q: 'How is the score calculated?', a: 'Our AI evaluates your prompt across 6 dimensions (Precision, Role, Output Format, Mission Context, Structure, Tailoring). Each dimension is scored 0-100, then combined into an overall score with a letter grade.' },
  { q: 'Is my prompt stored?', a: 'Prompts are processed for analysis only. Unauthenticated users\' prompts are not permanently stored.' },
  { q: 'Can I use it in Korean?', a: 'Yes! ScoreMyPrompt supports both English and Korean. You can switch language in the top navigation.' },
];

/* ── Component ── */

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">

        {/* Hero */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-400 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Beginner Guide
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            How to Use <span className="text-gradient">ScoreMyPrompt</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            AI 프롬프트를 입력하면 6가지 차원으로 분석해서 점수와 개선 팁을 받을 수 있어요.
            처음 쓰는 분도 30초면 시작할 수 있습니다.
          </p>
        </header>

        {/* Steps */}
        <section className="mb-20" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="text-2xl font-bold text-white mb-8 text-center">
            4 Steps to Grade Your Prompt
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {STEPS.map(({ step, title, description, tip, icon }) => (
              <div
                key={step}
                className="relative bg-surface/50 border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-indigo-400 mb-1">Step {step}</div>
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

        {/* PROMPT Dimensions */}
        <section className="mb-20" aria-labelledby="dimensions-heading">
          <h2 id="dimensions-heading" className="text-2xl font-bold text-white mb-3 text-center">
            The PROMPT Score Framework
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-lg mx-auto text-sm">
            Your prompt is analyzed across 6 dimensions. Each letter in &quot;PROMPT&quot; represents one.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIMENSIONS.map(({ letter, name, color, desc }, i) => (
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

        {/* All Features */}
        <section className="mb-20" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-bold text-white mb-3 text-center">
            All Features
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            ScoreMyPrompt에서 사용할 수 있는 모든 기능 한눈에 보기
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, href, desc, free }) => {
              const Tag = href ? Link : 'div';
              const props = href ? { href } : {};
              return (
                <Tag
                  key={title}
                  {...(props as Record<string, string>)}
                  className="bg-surface/30 border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      free ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {free ? 'Free' : 'Pro'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </Tag>
              );
            })}
          </div>
        </section>

        {/* Grade Scale */}
        <section className="mb-20" aria-labelledby="grades-heading">
          <h2 id="grades-heading" className="text-2xl font-bold text-white mb-8 text-center">
            Grade Scale
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { grade: 'S', range: '90-100', label: 'Exceptional', color: '#10b981' },
              { grade: 'A', range: '80-89', label: 'Excellent', color: '#3b82f6' },
              { grade: 'B', range: '65-79', label: 'Good', color: '#f59e0b' },
              { grade: 'C', range: '50-64', label: 'Fair', color: '#f97316' },
              { grade: 'D', range: '0-49', label: 'Needs Work', color: '#ef4444' },
            ].map(({ grade, range, label, color }) => (
              <div
                key={grade}
                className="flex items-center gap-3 bg-surface/30 border border-white/5 rounded-xl px-5 py-3 min-w-[140px]"
              >
                <span className="text-2xl font-bold" style={{ color }}>{grade}</span>
                <div>
                  <div className="text-xs text-white font-medium">{label}</div>
                  <div className="text-[10px] text-gray-500">{range} pts</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-white mb-8 text-center">
            FAQ
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {FAQS.map(({ q, a }, i) => (
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

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to try?
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              무료, 회원가입 없이, 30초면 끝.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              Grade My Prompt
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
