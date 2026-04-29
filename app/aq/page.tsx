'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AQ_DOMAIN_META, AQ_GRADE_CONFIG, AQ_MAX_SCORE, AQ_CERTIFICATE_MIN_SCORE } from './constants';
import type { AQDomain, AQGrade } from './types';

const Footer = dynamic(() => import('../components/Footer'), { ssr: false });

const FAQ_ITEMS = [
  {
    q: 'AQ(AI Quotient)가 정확히 뭔가요?',
    a: 'IQ가 학습 능력을, EQ가 감성을 측정한다면, AQ는 AI를 다루는 능력을 측정합니다. 프롬프트 작성·도구 선택·윤리 판단·개념 이해 — 이 4영역의 가중 평균이 당신의 AQ입니다.',
  },
  {
    q: '시간 얼마나 걸려요?',
    a: '약 15~20분입니다. 프롬프트 작성 1문항 + 객관식/시나리오 15문항. 중간에 나가도 진행 상황이 저장되니 부담 없이 시작하세요.',
  },
  {
    q: '인증서는 어떻게 받나요?',
    a: `AQ ${AQ_CERTIFICATE_MIN_SCORE}점(B등급) 이상이면 디지털 인증서가 자동 발급됩니다. 고유 검증 코드가 들어간 PNG 카드로, LinkedIn·이력서·포트폴리오에 그대로 첨부할 수 있습니다.`,
  },
  {
    q: '점수가 낮으면 어떡해요?',
    a: 'AQ는 IQ와 다릅니다 — 모든 등급이 출발점입니다. 결과 페이지에서 어느 영역이 약한지가 바로 보이고, 그 영역만 보완하면 점수가 가장 빠르게 오릅니다. 재측정은 언제든 가능하고, 가장 높은 점수가 기록됩니다.',
  },
  {
    q: '기업에서 활용할 수 있나요?',
    a: '인증 코드로 지원자의 AI 역량을 객관적으로 검증할 수 있습니다. 팀·조직 단위 측정 대시보드는 별도 트랙으로 준비 중입니다.',
  },
];

export default function AQLandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const domains = Object.entries(AQ_DOMAIN_META) as [AQDomain, typeof AQ_DOMAIN_META[AQDomain]][];
  const grades = Object.entries(AQ_GRADE_CONFIG) as [AQGrade, typeof AQ_GRADE_CONFIG[AQGrade]][];

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AQ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">AQ</h1>
              <p className="text-[10px] text-gray-500 leading-tight">AI Quotient</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ScoreMyPrompt
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-purple-400 text-sm font-medium">IQ · EQ · 그리고 AQ</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          당신의 AI는<br className="hidden sm:block" />
          {' '}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            몇 점입니까?
          </span>
        </h2>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-3">
          IQ는 고정형, <span className="text-white font-medium">AQ는 성장형</span>.
        </p>
        <p className="text-base text-gray-500 max-w-2xl mx-auto mb-4 leading-relaxed">
          자기보고 설문이 아닌 실측 진단으로, 프롬프트·도구·윤리·개념 4영역을 한 번에 측정합니다.
        </p>
        <p className="text-sm text-gray-600 mb-10">
          약 15분 · 무료 · B등급 이상 인증서 발급
        </p>

        <button
          onClick={() => router.push('/aq/test')}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
        >
          AQ 테스트 시작하기
        </button>

        {/* Score Preview */}
        <div className="mt-16 flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-4 border-purple-500/30 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ?
                </p>
                <p className="text-xs text-gray-500 mt-1">/ {AQ_MAX_SCORE}</p>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              AQ
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4대 측정 영역 ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          측정하는{' '}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            4가지 영역
          </span>
        </h3>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          프롬프트 작성·도구 선택·윤리 판단·개념 이해. 4영역의 가중 평균이 0~200점의 AQ가 됩니다.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {domains.map(([key, meta]) => {
            const weights: Record<AQDomain, number> = { prompt: 40, tool: 25, ethics: 20, concept: 15 };
            return (
              <div
                key={key}
                className="card hover:border-opacity-50 transition-all duration-300 group"
                style={{ borderColor: `${meta.color}30` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                      >
                        {meta.letter}
                      </span>
                      <h4 className="text-lg font-bold text-white">{meta.label}</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{meta.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${weights[key]}%`, backgroundColor: meta.color }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: meta.color }}>
                        {weights[key]}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 등급 체계 ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          AQ{' '}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            등급 체계
          </span>
        </h3>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          0~{AQ_MAX_SCORE}점, 5단계. <span className="text-white font-medium">모든 등급은 성장 가능한 출발점입니다.</span>
        </p>

        <div className="grid sm:grid-cols-5 gap-3">
          {grades.map(([grade, config]) => (
            <div
              key={grade}
              className="card text-center py-6 hover:scale-105 transition-transform duration-300"
              style={{ borderColor: `${config.color}30` }}
            >
              <div className="text-3xl mb-2">{config.emoji}</div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: config.color }}
              >
                {config.label}
              </div>
              <p className="text-white text-sm font-semibold mb-1">{config.title}</p>
              <p className="text-gray-500 text-xs">{config.min}+ 점</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 인증서 미리보기 ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          공식{' '}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AQ 인증서
          </span>
        </h3>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          B등급({AQ_CERTIFICATE_MIN_SCORE}점) 이상이면 고유 검증 코드가 들어간 디지털 인증서가 자동 발급됩니다. LinkedIn·이력서·포트폴리오에 그대로 첨부하세요.
        </p>

        <div className="max-w-md mx-auto">
          <div className="card bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20 p-8 text-center">
            {/* Certificate preview mockup */}
            <div className="border border-purple-500/20 rounded-xl p-6 bg-dark/50">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">AQ</span>
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">AI Quotient Certificate</p>
              <p className="text-white font-bold text-lg mb-1">홍길동</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-4xl font-bold" style={{ color: '#3B82F6' }}>156</span>
                <span className="text-gray-500">/ {AQ_MAX_SCORE}</span>
              </div>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: '#3B82F620', color: '#3B82F6' }}
              >
                A등급 — AI 전문가
              </span>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {domains.map(([key, meta]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg mb-0.5">{meta.icon}</div>
                    <p className="text-[10px] text-gray-500">{meta.letter}</p>
                    <div className="h-1 rounded-full mt-1" style={{ backgroundColor: `${meta.color}40` }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: meta.color,
                          width: key === 'prompt' ? '85%' : key === 'tool' ? '75%' : key === 'ethics' ? '80%' : '70%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-[10px] mt-4">aq.ai.kr/cert/XXXX-XXXX</p>
            </div>
            <p className="text-gray-400 text-sm mt-4">LinkedIn · 이력서 · 포트폴리오에 공유 가능</p>
          </div>
        </div>
      </section>

      {/* ═══ SMP와의 차이 ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          ScoreMyPrompt vs{' '}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AQ</span>
        </h3>

        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-gray-400 font-medium p-4 sm:p-5">항목</th>
                <th className="text-center text-gray-400 font-medium p-4 sm:p-5 w-36">ScoreMyPrompt</th>
                <th className="text-center font-medium p-4 sm:p-5 w-36 bg-purple-500/5 text-purple-400">AQ</th>
              </tr>
            </thead>
            <tbody>
              {[
                { item: '측정 대상', smp: '프롬프트 품질', aq: 'AI 종합 역량', highlight: true },
                { item: '점수 범위', smp: '0~100', aq: '0~200', highlight: true },
                { item: '측정 영역', smp: '6가지 차원', aq: '4대 영역 (16+ 항목)', highlight: true },
                { item: '인증서', smp: '✕', aq: '디지털 인증서 발급', highlight: true },
                { item: '채용 연계', smp: '✕', aq: 'LinkedIn 공유 가능', highlight: true },
                { item: '윤리/개념', smp: '✕', aq: '윤리 + 개념 이해 평가', highlight: true },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  <td className="text-gray-300 p-4 sm:p-5">{row.item}</td>
                  <td className="text-center text-gray-500 p-4 sm:p-5">{row.smp}</td>
                  <td className={`text-center p-4 sm:p-5 bg-purple-500/5 ${row.highlight ? 'text-purple-400 font-semibold' : 'text-gray-300'}`}>
                    {row.aq}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">자주 묻는 질문</h3>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="card">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <h4 className="text-lg font-semibold text-white text-left">{item.q}</h4>
                <span className={`text-xl text-purple-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openFaq === idx && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 py-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            측정되지 않은 능력은,{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              존재하지 않습니다
            </span>
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
            막연했던 &lsquo;AI 잘 다룸&rsquo;에 5분 만에 답이 나옵니다.
          </p>
          <button
            onClick={() => router.push('/aq/test')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20"
          >
            지금 AQ 측정하기
          </button>
          <p className="text-gray-500 text-xs mt-4">약 15분 · 무료 · B등급 이상 인증서 발급</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
