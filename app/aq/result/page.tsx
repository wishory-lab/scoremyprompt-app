'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AQ_GRADE_CONFIG, AQ_DOMAIN_META, AQ_MAX_SCORE, AQ_CERTIFICATE_MIN_SCORE } from '../constants';
import type { AQResult, AQDomain } from '../types';

const Footer = dynamic(() => import('../../components/Footer'), { ssr: false });

// ─── 레이더 차트 (SVG) ──────────────────────────
function RadarChart({ domains }: { domains: AQResult['domains'] }) {
  const size = 240;
  const center = size / 2;
  const levels = 5;
  const radius = 90;

  const domainKeys: AQDomain[] = ['prompt', 'tool', 'ethics', 'concept'];
  const angles = domainKeys.map((_, i) => (Math.PI * 2 * i) / domainKeys.length - Math.PI / 2);

  const getPoint = (angle: number, value: number) => ({
    x: center + Math.cos(angle) * (value / 100) * radius,
    y: center + Math.sin(angle) * (value / 100) * radius,
  });

  const scores = domainKeys.map(key => {
    const d = domains.find(d => d.domain === key);
    return d?.rawScore ?? 0;
  });

  const dataPoints = scores.map((score, i) => getPoint(angles[i], score));
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid */}
      {Array.from({ length: levels }, (_, i) => {
        const r = (radius * (i + 1)) / levels;
        const points = angles.map(a => `${center + Math.cos(a) * r},${center + Math.sin(a) * r}`).join(' ');
        return <polygon key={i} points={points} fill="none" stroke="#333" strokeWidth={0.5} />;
      })}
      {/* Axes */}
      {angles.map((a, i) => (
        <line key={i} x1={center} y1={center} x2={center + Math.cos(a) * radius} y2={center + Math.sin(a) * radius} stroke="#444" strokeWidth={0.5} />
      ))}
      {/* Data */}
      <path d={pathData} fill="rgba(139, 92, 246, 0.15)" stroke="#8B5CF6" strokeWidth={2} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={AQ_DOMAIN_META[domainKeys[i]].color} />
      ))}
      {/* Labels */}
      {domainKeys.map((key, i) => {
        const meta = AQ_DOMAIN_META[key];
        const labelR = radius + 22;
        const x = center + Math.cos(angles[i]) * labelR;
        const y = center + Math.sin(angles[i]) * labelR;
        return (
          <text key={key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={meta.color} fontSize={11} fontWeight={600}>
            {meta.icon} {meta.letter}
          </text>
        );
      })}
    </svg>
  );
}

// ─── 메인 결과 페이지 ────────────────────────────
export default function AQResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AQResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem('aqResult');
    if (data) {
      setResult(JSON.parse(data));
    } else {
      router.push('/aq');
    }
  }, [router]);

  // Score animation
  useEffect(() => {
    if (!result) return;
    const target = result.totalScore;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [result]);

  if (!result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </main>
    );
  }

  const gradeConfig = AQ_GRADE_CONFIG[result.grade];
  const canCertify = result.totalScore >= AQ_CERTIFICATE_MIN_SCORE;
  const minutes = Math.floor(result.durationSeconds / 60);
  const seconds = result.durationSeconds % 60;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Nav */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AQ</span>
            </div>
            <span className="text-lg font-bold text-white">AQ 결과</span>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ═══ Score Hero ═══ */}
        <div className="text-center mb-12">
          <p className="text-gray-400 text-sm mb-4">당신의 AI Quotient</p>

          <div className="relative inline-block mb-6">
            <div
              className="w-44 h-44 rounded-full flex items-center justify-center border-4"
              style={{ borderColor: `${gradeConfig.color}40` }}
            >
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: gradeConfig.color }}>
                  {animatedScore}
                </p>
                <p className="text-gray-500 text-sm">/ {AQ_MAX_SCORE}</p>
              </div>
            </div>
            <div
              className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: gradeConfig.color }}
            >
              {gradeConfig.label}등급
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {gradeConfig.emoji} {gradeConfig.title}
          </h2>
          <p className="text-gray-400 mb-2">{gradeConfig.description}</p>
          <p className="text-sm text-gray-500">
            상위 {result.percentile}% · 소요 시간 {minutes}분 {seconds}초
          </p>
        </div>

        {/* ═══ Radar Chart ═══ */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold text-white text-center mb-4">영역별 역량 분석</h3>
          <RadarChart domains={result.domains} />
        </div>

        {/* ═══ Domain Detail Cards ═══ */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {result.domains.map((d) => {
            const meta = AQ_DOMAIN_META[d.domain];
            return (
              <div key={d.domain} className="card" style={{ borderColor: `${meta.color}20` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${meta.color}15` }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{meta.label}</h4>
                    <p className="text-xs text-gray-500">{meta.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold" style={{ color: meta.color }}>
                    {d.rawScore}
                  </span>
                  <span className="text-gray-500 text-sm">/ 100</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${d.rawScore}%`, backgroundColor: meta.color }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  가중치 반영: {d.weightedScore}점 (×{((d.weightedScore / Math.max(d.rawScore, 1)) * 50).toFixed(0)}%)
                </p>
              </div>
            );
          })}
        </div>

        {/* ═══ Strengths & Improvements ═══ */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-3">💪 강점</h3>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-300 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-3">📈 개선 영역</h3>
            <ul className="space-y-2">
              {result.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>
                  <span className="text-gray-300 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ═══ Certificate CTA ═══ */}
        {canCertify ? (
          <div className="card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 text-center py-10 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AQ</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">🎉 AQ 인증서 발급 가능!</h3>
            <p className="text-gray-400 mb-6">
              {gradeConfig.label}등급 ({result.totalScore}점)을 달성하셨습니다. 인증서를 발급받고 LinkedIn에 공유하세요.
            </p>
            <button
              onClick={() => router.push(`/aq/certificate?score=${result.totalScore}&grade=${result.grade}`)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              인증서 발급받기
            </button>
          </div>
        ) : (
          <div className="card text-center py-8 mb-8">
            <p className="text-gray-400 mb-2">
              인증서는 B등급({AQ_CERTIFICATE_MIN_SCORE}점) 이상부터 발급됩니다.
            </p>
            <p className="text-gray-500 text-sm">
              {AQ_CERTIFICATE_MIN_SCORE - result.totalScore}점만 더 올리면 인증서를 받을 수 있어요!
            </p>
          </div>
        )}

        {/* ═══ Action Buttons ═══ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/aq/test')}
            className="flex-1 btn-secondary text-center py-3 font-semibold"
          >
            다시 테스트하기
          </button>
          <button
            onClick={() => {
              const text = `나의 AQ(AI Quotient)는 ${result.totalScore}/${AQ_MAX_SCORE} (${gradeConfig.label}등급)! 🧠\n당신의 AI 역량은? aq.ai.kr에서 무료 테스트하세요!`;
              if (navigator.share) {
                navigator.share({ title: 'AQ 결과', text, url: 'https://aq.ai.kr' });
              } else {
                navigator.clipboard.writeText(text);
              }
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-center py-3 rounded-xl font-semibold transition-all"
          >
            결과 공유하기
          </button>
          <button
            onClick={() => router.push('/aq')}
            className="flex-1 btn-secondary text-center py-3 font-semibold"
          >
            AQ 홈으로
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
