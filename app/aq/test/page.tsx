'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TOOL_QUESTIONS, ETHICS_QUESTIONS, CONCEPT_QUESTIONS } from '../questions';
import { AQ_DOMAIN_META, AQ_DOMAIN_WEIGHTS, calculateWeightedScore, calculateTotalAQ, getAQGrade, estimatePercentile } from '../constants';
import type { AQDomain, AQTestPhase, AQResult, AQDomainScore, AQQuestion } from '../types';
import { trackAqTestStarted, trackAqPhaseCompleted, trackAqTestCompleted } from '../../lib/analytics';
import { useAuth } from '@/app/components/AuthProvider';
import { AQ_DAILY_LIMIT } from '@/app/constants';

// ─── AQ 일일 횟수 관리 ──────────────
function getAqDailyCount(): number {
  try {
    const key = 'smp_aq_daily';
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    if (date !== new Date().toISOString().slice(0, 10)) return 0;
    return count;
  } catch { return 0; }
}

function incrementAqDaily(): void {
  try {
    const key = 'smp_aq_daily';
    const today = new Date().toISOString().slice(0, 10);
    const current = getAqDailyCount();
    localStorage.setItem(key, JSON.stringify({ date: today, count: current + 1 }));
  } catch { /* localStorage unavailable */ }
}

// ─── 프롬프트 입력 + SMP 채점 단계 ──────────────
function PromptPhase({ onComplete }: { onComplete: (score: number) => void }) {
  const [prompt, setPrompt] = useState('');
  const [jobRole, setJobRole] = useState('Marketing');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (prompt.trim().length < 10) {
      setError('프롬프트를 10자 이상 입력하세요.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), jobRole }),
      });
      if (!res.ok) throw new Error('분석 실패');
      const data = await res.json();
      onComplete(data.overallScore ?? 50);
    } catch {
      // Fallback: 분석 실패 시 50점 기본값으로 진행
      onComplete(50);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="text-purple-400 text-sm font-medium">영역 1/4</span>
          <span className="text-gray-500 text-sm">프롬프트 엔지니어링</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">프롬프트를 작성하세요</h2>
        <p className="text-gray-400 text-sm">
          아래 주제에 대해 최대한 효과적인 AI 프롬프트를 작성하세요. 기존 SMP 엔진으로 채점됩니다.
        </p>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-gray-300 mb-2">직무 분야</label>
        <select
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="w-full bg-dark border border-border rounded-lg px-4 py-2.5 text-white text-sm mb-4 focus:border-purple-500 outline-none"
        >
          {['Marketing', 'Design', 'Product', 'Finance', 'Engineering', 'Freelance', 'Other'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-300 mb-2">
          프롬프트 작성
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: '우리 회사의 신제품 런칭을 위한 마케팅 이메일을 작성해줘' 같은 AI 프롬프트를 작성하세요. 자유 주제입니다."
          className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white text-sm min-h-[160px] resize-y focus:border-purple-500 outline-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">{prompt.length}자</span>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={analyzing || prompt.trim().length < 10}
          className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {analyzing ? '프롬프트 분석 중...' : '프롬프트 제출 →'}
        </button>
      </div>
    </div>
  );
}

// ─── 객관식/시나리오 문제 단계 ───────────────────
function QuizPhase({
  domain,
  questions,
  phaseIndex,
  onComplete,
}: {
  domain: AQDomain;
  questions: AQQuestion[];
  phaseIndex: number;
  onComplete: (scores: Record<string, number>) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const meta = AQ_DOMAIN_META[domain];
  const q = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const score = q.options?.[selected]?.score ?? 0;
    const newAnswers = { ...answers, [q.id]: score };
    setAnswers(newAnswers);

    if (!showExplanation) {
      setShowExplanation(true);
      return;
    }

    if (isLast) {
      onComplete(newAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="text-purple-400 text-sm font-medium">영역 {phaseIndex}/4</span>
          <span className="text-gray-500 text-sm">{meta.label}</span>
        </div>
        <div className="flex justify-center gap-1 mb-4">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentIdx ? 'w-8 bg-purple-500' : i === currentIdx ? 'w-8 bg-purple-400' : 'w-4 bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{meta.icon}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
            Q{currentIdx + 1}/{questions.length}
          </span>
          {q.difficulty > 1 && (
            <span className="text-xs text-gray-500">
              {'★'.repeat(q.difficulty)}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-3">{q.question}</h3>
        {q.scenario && (
          <div className="bg-dark/50 border border-border rounded-lg p-3 mb-4">
            <p className="text-gray-400 text-sm">{q.scenario}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {q.options?.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.correctIndex;
            let borderColor = 'border-border';
            let bgColor = '';
            if (showExplanation) {
              if (isCorrect) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-500/5';
              } else if (isSelected && !isCorrect) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-500/5';
              }
            } else if (isSelected) {
              borderColor = 'border-purple-500';
              bgColor = 'bg-purple-500/5';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left border ${borderColor} ${bgColor} rounded-lg p-4 transition-all hover:border-purple-500/50 ${
                  showExplanation ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-600 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-gray-300 text-sm">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 mb-4">
            <p className="text-blue-400 text-xs font-medium mb-1">해설</p>
            <p className="text-gray-300 text-sm">{q.explanation}</p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={selected === null}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {!showExplanation ? '정답 확인' : isLast ? '다음 영역으로 →' : '다음 문제 →'}
        </button>
      </div>
    </div>
  );
}

// ─── 분석 중 로딩 ────────────────────────────────
function AnalyzingPhase() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-8" />
      <h2 className="text-2xl font-bold text-white mb-3">AQ 점수 산출 중...</h2>
      <p className="text-gray-400 text-sm">4개 영역의 점수를 종합하여 AQ를 계산하고 있습니다.</p>
    </div>
  );
}

// ─── 메인 테스트 페이지 ──────────────────────────
export default function AQTestPage() {
  const router = useRouter();
  const { tier } = useAuth();
  const [phase, setPhase] = useState<AQTestPhase>('intro');
  const [promptScore, setPromptScore] = useState(0);
  const [toolScores, setToolScores] = useState<Record<string, number>>({});
  const [ethicsScores, setEthicsScores] = useState<Record<string, number>>({});
  const [conceptScores, setConceptScores] = useState<Record<string, number>>({});
  const [startedAt] = useState(Date.now());
  const [aqRemaining, setAqRemaining] = useState<number>(AQ_DAILY_LIMIT);
  const isPro = tier === 'pro';

  useEffect(() => {
    if (!isPro) {
      setAqRemaining(AQ_DAILY_LIMIT - getAqDailyCount());
    }
  }, [isPro]);

  const computeDomainRawScore = useCallback((scores: Record<string, number>, questions: AQQuestion[]): number => {
    const maxTotal = questions.reduce((s, q) => s + q.points, 0);
    const actual = Object.values(scores).reduce((s, v) => s + v, 0);
    return maxTotal > 0 ? Math.round((actual / maxTotal) * 100) : 0;
  }, []);

  const handlePromptComplete = (score: number) => {
    setPromptScore(score);
    trackAqPhaseCompleted('prompt', score);
    setPhase('tool');
  };

  const handleToolComplete = (scores: Record<string, number>) => {
    setToolScores(scores);
    const rawScore = computeDomainRawScore(scores, TOOL_QUESTIONS);
    trackAqPhaseCompleted('tool', rawScore);
    setPhase('ethics');
  };

  const handleEthicsComplete = (scores: Record<string, number>) => {
    setEthicsScores(scores);
    const rawScore = computeDomainRawScore(scores, ETHICS_QUESTIONS);
    trackAqPhaseCompleted('ethics', rawScore);
    setPhase('concept');
  };

  // conceptScores를 받은 직후 최신 값으로 결과를 빌드하기 위한 ref
  const latestConceptScores = useRef<Record<string, number>>({});

  const handleConceptComplete = (scores: Record<string, number>) => {
    setConceptScores(scores);
    latestConceptScores.current = scores;
    const rawScore = computeDomainRawScore(scores, CONCEPT_QUESTIONS);
    trackAqPhaseCompleted('concept', rawScore);
    setPhase('analyzing');

    // 잠시 로딩 후 결과 저장 & 이동
    setTimeout(() => {
      // buildResult는 state 기반이므로 아직 conceptScores가 반영 안됐을 수 있음
      // latestConceptScores로 직접 계산
      const domainRawScores: Record<AQDomain, number> = {
        prompt: promptScore,
        tool: computeDomainRawScore(toolScores, TOOL_QUESTIONS),
        ethics: computeDomainRawScore(ethicsScores, ETHICS_QUESTIONS),
        concept: computeDomainRawScore(latestConceptScores.current, CONCEPT_QUESTIONS),
      };

      const domains: AQDomainScore[] = (Object.keys(AQ_DOMAIN_WEIGHTS) as AQDomain[]).map(domain => ({
        domain,
        rawScore: domainRawScores[domain],
        weightedScore: calculateWeightedScore(domain, domainRawScores[domain]),
        grade: getAQGrade(domainRawScores[domain] * 2),
        feedback: '',
        details: [],
      }));

      const totalScore = calculateTotalAQ(domainRawScores);
      const grade = getAQGrade(totalScore);
      const percentile = estimatePercentile(totalScore);
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

      const sorted = [...domains].sort((a, b) => b.rawScore - a.rawScore);
      const strengths = sorted.slice(0, 2).map(d => `${AQ_DOMAIN_META[d.domain].label} (${d.rawScore}점)`);
      const improvements = sorted.slice(-2).map(d => `${AQ_DOMAIN_META[d.domain].label} 역량 강화 추천`);

      const result: AQResult = {
        totalScore, grade, percentile, domains,
        summary: '', strengths, improvements, recommendations: [],
        durationSeconds, testedAt: new Date().toISOString(),
      };

      trackAqTestCompleted(totalScore, grade, percentile);
      sessionStorage.setItem('aqResult', JSON.stringify(result));
      router.push('/aq/result');
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Header */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AQ</span>
            </div>
            <span className="text-lg font-bold text-white">AQ 테스트</span>
          </div>
          {phase !== 'intro' && phase !== 'analyzing' && (
            <div className="flex gap-1">
              {(['prompt', 'tool', 'ethics', 'concept'] as AQTestPhase[]).map((p, i) => (
                <div
                  key={p}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    phase === p ? 'w-10 bg-purple-500' :
                    (['prompt', 'tool', 'ethics', 'concept'].indexOf(phase) > i) ? 'w-6 bg-purple-500/50' : 'w-6 bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        {phase === 'intro' && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">AQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">AQ 테스트를 시작합니다</h2>
            <p className="text-gray-400 mb-8">
              4가지 영역을 순서대로 진행합니다. 약 15~20분 소요됩니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {(Object.entries(AQ_DOMAIN_META) as [AQDomain, typeof AQ_DOMAIN_META[AQDomain]][]).map(([key, meta]) => (
                <div key={key} className="card text-center py-4">
                  <div className="text-2xl mb-1">{meta.icon}</div>
                  <p className="text-white text-sm font-medium">{meta.label}</p>
                  <p className="text-gray-500 text-xs">{AQ_DOMAIN_WEIGHTS[key]}%</p>
                </div>
              ))}
            </div>
            {!isPro && aqRemaining <= 0 ? (
              <div className="space-y-4">
                <p className="text-amber-400 text-sm">오늘의 AQ 테스트 횟수({AQ_DAILY_LIMIT}회)를 모두 사용했습니다.</p>
                <a
                  href="/pricing"
                  className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Pro로 업그레이드
                </a>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { incrementAqDaily(); setAqRemaining(prev => prev - 1); trackAqTestStarted(); setPhase('prompt'); }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  시작하기
                </button>
                {!isPro && (
                  <p className="text-gray-500 text-xs mt-3">오늘 남은 횟수: {aqRemaining}/{AQ_DAILY_LIMIT}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Phase: Prompt */}
        {phase === 'prompt' && <PromptPhase onComplete={handlePromptComplete} />}

        {/* Phase: Tool */}
        {phase === 'tool' && (
          <QuizPhase domain="tool" questions={TOOL_QUESTIONS} phaseIndex={2} onComplete={handleToolComplete} />
        )}

        {/* Phase: Ethics */}
        {phase === 'ethics' && (
          <QuizPhase domain="ethics" questions={ETHICS_QUESTIONS} phaseIndex={3} onComplete={handleEthicsComplete} />
        )}

        {/* Phase: Concept */}
        {phase === 'concept' && (
          <QuizPhase domain="concept" questions={CONCEPT_QUESTIONS} phaseIndex={4} onComplete={handleConceptComplete} />
        )}

        {/* Analyzing */}
        {phase === 'analyzing' && <AnalyzingPhase />}
      </section>
    </main>
  );
}
