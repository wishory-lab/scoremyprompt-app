'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TOOL_QUESTIONS, ETHICS_QUESTIONS, CONCEPT_QUESTIONS } from '../questions';
import { AQ_DOMAIN_META, AQ_DOMAIN_WEIGHTS, calculateWeightedScore, calculateTotalAQ, getAQGrade, estimatePercentile } from '../constants';
import type { AQDomain, AQTestPhase, AQResult, AQDomainScore, AQQuestion } from '../types';
import { trackAqTestStarted, trackAqPhaseCompleted, trackAqTestCompleted } from '../../lib/analytics';
import { useAuth } from '@/app/components/AuthProvider';
import { AQ_DAILY_LIMIT } from '@/app/constants';

// ─── 출제 풀에서 랜덤 5문제 선정 (난이도 균형) ──────
// Fisher-Yates shuffle, 그리고 난이도 1/2/3 적어도 1문제씩 보장하기 위해
// 난이도별로 그룹 → 각 그룹에서 라운드로빈으로 뽑기.
const PER_DOMAIN_QUESTIONS = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickBalanced(pool: AQQuestion[], count: number): AQQuestion[] {
  const byDiff: Record<1 | 2 | 3, AQQuestion[]> = { 1: [], 2: [], 3: [] };
  for (const q of pool) byDiff[q.difficulty].push(q);
  for (const k of [1, 2, 3] as const) byDiff[k] = shuffle(byDiff[k]);
  const picked: AQQuestion[] = [];
  // 라운드로빈: difficulty 1, 2, 3 순환하며 1개씩 뽑다가 부족하면 남은 풀에서.
  let safety = 0;
  while (picked.length < count && safety++ < count * 4) {
    for (const k of [1, 2, 3] as const) {
      if (picked.length >= count) break;
      const q = byDiff[k].pop();
      if (q) picked.push(q);
    }
  }
  // 그래도 부족하면 (풀이 작을 때) 남은 풀에서 채움
  if (picked.length < count) {
    const remaining = shuffle(pool.filter((q) => !picked.includes(q)));
    while (picked.length < count && remaining.length > 0) picked.push(remaining.pop()!);
  }
  // 출제 순서: 난이도 오름차순 (쉬운 것부터)
  return picked.sort((a, b) => a.difficulty - b.difficulty);
}

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
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 10) {
      setError('프롬프트를 10자 이상 입력하세요.');
      return;
    }
    if (trimmed.length > 5000) {
      setError('프롬프트는 5,000자 이내로 작성해주세요.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, jobRole }),
      });
      if (res.status === 429) {
        setError('잠시만요. 너무 빠르게 제출하셨어요. 1분 후 다시 시도해주세요.');
        return;
      }
      if (!res.ok) {
        let msg = '채점 중 오류가 발생했습니다. 다시 시도해주세요.';
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch { /* ignore */ }
        setError(msg);
        return;
      }
      const data = await res.json();
      const score = typeof data?.overallScore === 'number' ? data.overallScore : null;
      if (score === null) {
        setError('채점 결과를 받지 못했습니다. 다시 시도해주세요.');
        return;
      }
      onComplete(score);
    } catch {
      setError('네트워크 연결을 확인해주세요.');
    } finally {
      setAnalyzing(false);
      setRetryCount((n) => n + 1);
    }
  };

  const handleSkip = () => {
    // 채점 실패가 반복되어도 진행 가능하도록 — 평균값(50)으로 다음 영역 이동.
    // 실제 운영에서는 실패율을 PostHog로 추적해야 함.
    onComplete(50);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="text-purple-400 text-sm font-medium">영역 1/4</span>
          <span className="text-gray-500 text-sm">프롬프트 엔지니어링</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">당신만의 프롬프트를 작성하세요</h2>
        <p className="text-gray-400 text-sm">
          자유 주제. 평소 AI에게 시키던 가장 잘 쓰는 프롬프트를 한 가지만 적어주세요. ScoreMyPrompt 엔진이 6차원으로 채점합니다.
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
          프롬프트
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예시: 당신은 SaaS 마케팅 전문가입니다. 신제품 런칭 이메일을 작성하세요. 타겟은 SMB CTO, 본문 5문장 이내, 클릭 가능한 CTA 포함…"
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
          {analyzing ? '6차원 채점 중…' : '제출하고 다음 영역으로 →'}
        </button>

        {/* 채점이 두 번 이상 실패하면 건너뛰기 옵션 노출 — 진단 자체가 멈추지 않도록 */}
        {error && retryCount >= 2 && (
          <button
            onClick={handleSkip}
            className="mt-2 w-full text-gray-500 hover:text-white text-xs py-2 transition-colors"
          >
            계속 실패한다면 이 영역 건너뛰기 (평균 점수로 처리)
          </button>
        )}
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
            <p className="text-gray-300 text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={selected === null}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {!showExplanation ? '제출하고 정답 보기' : isLast ? '다음 영역으로 →' : '다음 문제 →'}
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
      <h2 className="text-2xl font-bold text-white mb-3">AQ 계산 중…</h2>
      <p className="text-gray-400 text-sm">4영역 점수에 가중치를 적용해 종합 AQ를 산출하고 있습니다.</p>
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

  // 한 회차당 도메인 별 5개 랜덤 선정 — 페이지 마운트 시 한 번만 결정.
  // 사용자가 다시 시작하려면 페이지를 reload하면 새 5개가 뽑힘.
  const toolQs = useMemo(() => pickBalanced(TOOL_QUESTIONS, PER_DOMAIN_QUESTIONS), []);
  const ethicsQs = useMemo(() => pickBalanced(ETHICS_QUESTIONS, PER_DOMAIN_QUESTIONS), []);
  const conceptQs = useMemo(() => pickBalanced(CONCEPT_QUESTIONS, PER_DOMAIN_QUESTIONS), []);

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
    const rawScore = computeDomainRawScore(scores, toolQs);
    trackAqPhaseCompleted('tool', rawScore);
    setPhase('ethics');
  };

  const handleEthicsComplete = (scores: Record<string, number>) => {
    setEthicsScores(scores);
    const rawScore = computeDomainRawScore(scores, ethicsQs);
    trackAqPhaseCompleted('ethics', rawScore);
    setPhase('concept');
  };

  // conceptScores를 받은 직후 최신 값으로 결과를 빌드하기 위한 ref
  const latestConceptScores = useRef<Record<string, number>>({});

  const handleConceptComplete = (scores: Record<string, number>) => {
    setConceptScores(scores);
    latestConceptScores.current = scores;
    const rawScore = computeDomainRawScore(scores, conceptQs);
    trackAqPhaseCompleted('concept', rawScore);
    setPhase('analyzing');

    // 잠시 로딩 후 결과 저장 & 이동
    setTimeout(() => {
      // buildResult는 state 기반이므로 아직 conceptScores가 반영 안됐을 수 있음
      // latestConceptScores로 직접 계산
      const domainRawScores: Record<AQDomain, number> = {
        prompt: promptScore,
        tool: computeDomainRawScore(toolScores, toolQs),
        ethics: computeDomainRawScore(ethicsScores, ethicsQs),
        concept: computeDomainRawScore(latestConceptScores.current, conceptQs),
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
      const strengths = sorted.slice(0, 2).map(d => `${AQ_DOMAIN_META[d.domain].label} — ${d.rawScore}점, 안정적인 강점`);
      const improvements = sorted.slice(-2).map(d => `${AQ_DOMAIN_META[d.domain].label} — ${d.rawScore}점, 가장 빠르게 끌어올릴 영역`);

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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">이제 AQ를 측정합니다</h2>
            <p className="text-gray-400 mb-8">
              4영역을 순서대로 진행합니다. 약 15~20분이면 끝.
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
                <p className="text-amber-400 text-sm">
                  오늘 분 AQ 측정({AQ_DAILY_LIMIT}회)을 모두 사용했어요. 내일 다시 도전하거나, Pro로 무제한 측정해보세요.
                </p>
                <a
                  href="/pricing"
                  className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Pro 업그레이드
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
                  <p className="text-gray-500 text-xs mt-3">오늘 남은 횟수 {aqRemaining}/{AQ_DAILY_LIMIT}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Phase: Prompt */}
        {phase === 'prompt' && <PromptPhase onComplete={handlePromptComplete} />}

        {/* Phase: Tool */}
        {phase === 'tool' && (
          <QuizPhase domain="tool" questions={toolQs} phaseIndex={2} onComplete={handleToolComplete} />
        )}

        {/* Phase: Ethics */}
        {phase === 'ethics' && (
          <QuizPhase domain="ethics" questions={ethicsQs} phaseIndex={3} onComplete={handleEthicsComplete} />
        )}

        {/* Phase: Concept */}
        {phase === 'concept' && (
          <QuizPhase domain="concept" questions={conceptQs} phaseIndex={4} onComplete={handleConceptComplete} />
        )}

        {/* Analyzing */}
        {phase === 'analyzing' && <AnalyzingPhase />}
      </section>
    </main>
  );
}
