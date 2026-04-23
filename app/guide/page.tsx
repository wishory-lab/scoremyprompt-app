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
    title: '프롬프트 작성 또는 붙여넣기',
    description: '채점하고 싶은 AI 프롬프트를 입력하세요. ChatGPT, Claude, Gemini 등 어떤 AI 모델용이든 가능합니다.',
    tip: '직무를 선택하면 더 정확한 채점을 받을 수 있어요.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'PROMPT 점수 받기',
    description: 'AI가 6가지 차원으로 프롬프트를 분석하고, 0~100점 점수와 등급(S/A/B/C/D)을 부여합니다.',
    tip: '각 차원별로 프롬프트의 강점과 약점을 정확히 보여줍니다.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: '개선 팁 확인하기',
    description: '프롬프트의 약한 부분을 강화할 수 있는 구체적이고 실행 가능한 제안을 받으세요.',
    tip: '직무와 사용 목적에 맞춘 맞춤 팁을 제공합니다.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: '공유하거나 반복 개선하기',
    description: '점수 카드를 공유하고, 리더보드와 비교하거나, 프롬프트를 수정해서 더 높은 점수에 도전하세요.',
    tip: 'Pro 사용자는 여러 프롬프트를 한 번에 분석할 수 있어요.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
];

const DIMENSIONS = [
  { letter: 'P', name: 'Precision(정밀도)', color: '#6366f1', desc: '요청이 얼마나 구체적이고 명확한가요?' },
  { letter: 'R', name: 'Role(역할)', color: '#8b5cf6', desc: 'AI에게 역할이 정의되어 있나요?' },
  { letter: 'O', name: 'Output Format(출력 형식)', color: '#a855f7', desc: '원하는 출력 형식을 지정했나요?' },
  { letter: 'M', name: 'Mission Context(미션)', color: '#d946ef', desc: '배경과 목적이 명확한가요?' },
  { letter: 'P', name: 'Structure(구조)', color: '#ec4899', desc: '잘 구조화되어 논리적인가요?' },
  { letter: 'T', name: 'Tailoring(맞춤화)', color: '#f43f5e', desc: '특정 대상에 맞춰져 있나요?' },
];

const FEATURES = [
  { title: '프롬프트 분석', href: '/', desc: 'AI 채점으로 30초 만에 프롬프트를 평가하세요.', free: true },
  { title: '템플릿', href: '/templates', desc: '직무별 고득점 프롬프트 템플릿 모음.', free: true },
  { title: '가이드', href: '/guides', desc: '프롬프트 엔지니어링 베스트 프랙티스 심층 가이드.', free: true },
  { title: '리더보드', href: '/#leaderboard', desc: '다른 사용자들과 프롬프트 순위를 비교하세요.', free: true },
  { title: '공유 카드', href: null, desc: 'SNS 공유용 아름다운 결과 카드.', free: true },
  { title: '대시보드', href: '/dashboard', desc: '시간에 따른 프롬프트 점수를 추적하세요.', free: false },
  { title: '대량 분석', href: '/bulk', desc: '여러 프롬프트를 한 번에 분석하세요. (Pro)', free: false },
  { title: '챌린지 모드', href: '/challenge', desc: '다른 사용자에게 점수 대결을 신청하세요.', free: true },
  { title: '비교 모드', href: '/compare', desc: '두 프롬프트를 나란히 비교하세요.', free: true },
];

const FAQS = [
  { q: '정말 무료인가요?', a: '네! 기본 프롬프트 채점은 가입 없이 무료입니다. 대량 분석, 대시보드 등 Pro 기능은 구독이 필요합니다.' },
  { q: '어떤 AI 모델에 사용할 수 있나요?', a: 'ScoreMyPrompt는 모든 AI 프롬프트를 평가합니다 — PROMPT 점수 프레임워크는 ChatGPT, Claude, Gemini, Copilot 등 모든 AI에 적용됩니다.' },
  { q: '점수는 어떻게 계산되나요?', a: 'AI가 프롬프트를 6가지 차원(Precision, Role, Output Format, Mission Context, Structure, Tailoring)으로 평가합니다. 각 차원 점수를 합산하여 100점 만점의 종합 점수와 등급을 산출합니다.' },
  { q: '내 프롬프트가 저장되나요?', a: '프롬프트는 분석 목적으로만 처리됩니다. 비로그인 사용자의 프롬프트는 영구 저장되지 않습니다.' },
  { q: '영어로도 사용할 수 있나요?', a: '네! ScoreMyPrompt는 한국어와 영어를 모두 지원합니다. 상단 내비게이션에서 언어를 전환할 수 있습니다.' },
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
            초보자 가이드
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            <span className="text-gradient">ScoreMyPrompt</span> 사용법
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            AI 프롬프트를 입력하면 6가지 차원으로 분석해서 점수와 개선 팁을 받을 수 있어요.
            처음 쓰는 분도 30초면 시작할 수 있습니다.
          </p>
        </header>

        {/* Steps */}
        <section className="mb-20" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="text-2xl font-bold text-white mb-8 text-center">
            프롬프트 채점 4단계
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
                    <div className="text-xs font-medium text-indigo-400 mb-1">{step}단계</div>
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
            PROMPT 점수 프레임워크
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-lg mx-auto text-sm">
            프롬프트를 6가지 차원으로 분석합니다. &quot;PROMPT&quot;의 각 글자가 하나의 차원을 나타냅니다.
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
            모든 기능
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            ScoreMyPrompt에서 사용할 수 있는 모든 기능 한눈에 보기
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, href, desc, free }) => {
              const inner = (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      free ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {free ? '무료' : 'Pro'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </>
              );
              const cls = "bg-surface/30 border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 transition-colors block";
              return href ? (
                <Link key={title} href={href} className={cls}>{inner}</Link>
              ) : (
                <div key={title} className={cls}>{inner}</div>
              );
            })}
          </div>
        </section>

        {/* Grade Scale */}
        <section className="mb-20" aria-labelledby="grades-heading">
          <h2 id="grades-heading" className="text-2xl font-bold text-white mb-8 text-center">
            등급 기준
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { grade: 'S', range: '90-100', label: '마스터급', color: '#10b981' },
              { grade: 'A', range: '80-89', label: '우수', color: '#3b82f6' },
              { grade: 'B', range: '65-79', label: '양호', color: '#f59e0b' },
              { grade: 'C', range: '50-64', label: '보통', color: '#f97316' },
              { grade: 'D', range: '0-49', label: '개선 필요', color: '#ef4444' },
            ].map(({ grade, range, label, color }) => (
              <div
                key={grade}
                className="flex items-center gap-3 bg-surface/30 border border-white/5 rounded-xl px-5 py-3 min-w-[140px]"
              >
                <span className="text-2xl font-bold" style={{ color }}>{grade}</span>
                <div>
                  <div className="text-xs text-white font-medium">{label}</div>
                  <div className="text-[10px] text-gray-500">{range}점</div>
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
              시작할 준비가 되셨나요?
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              무료, 회원가입 없이, 30초면 끝.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              프롬프트 채점하기
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
