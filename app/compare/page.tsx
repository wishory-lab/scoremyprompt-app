'use client';

import { useState } from 'react';
import { useTranslation } from '@/app/i18n';
import type { Grade, AnalysisResult, DimensionScore, DimensionScores, DimensionMeta, JobRole } from '@/app/types';
import Footer from '../components/Footer';
import PromptQualityIndicator from '../components/PromptQualityIndicator';

type DimensionKey = keyof DimensionScores;

interface CompareGradeConfig {
  color: string;
}

const JOB_ROLES: JobRole[] = ['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other'];

const DIMENSION_META: Record<string, DimensionMeta> = {
  precision: { label: 'P — Precision(정밀도)', letter: 'P', maxScore: 20 },
  role: { label: 'R — Role(역할)', letter: 'R', maxScore: 15 },
  outputFormat: { label: 'O — Output Format(출력 형식)', letter: 'O', maxScore: 15 },
  missionContext: { label: 'M — Mission Context(미션)', letter: 'M', maxScore: 20 },
  promptStructure: { label: 'P — Structure(구조)', letter: 'P', maxScore: 15 },
  tailoring: { label: 'T — Tailoring(맞춤화)', letter: 'T', maxScore: 15 },
};

const GRADE_CONFIG: Record<Grade, CompareGradeConfig> = {
  S: { color: '#10b981' },
  A: { color: '#3b82f6' },
  B: { color: '#f59e0b' },
  C: { color: '#f97316' },
  D: { color: '#ef4444' },
};

interface DimensionBarProps {
  dimKey: string;
  data: DimensionScore | undefined;
}

const DimensionBar = ({ dimKey, data }: DimensionBarProps) => {
  const meta: DimensionMeta | undefined = DIMENSION_META[dimKey];
  if (!meta || !data) return null;

  const pct = (data.score / meta.maxScore) * 100;
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: color + '22', color }}
          >
            {meta.letter}
          </span>
          <span className="font-medium text-white text-sm">{meta.label}</span>
        </div>
        <span className="text-sm font-bold" style={{ color }}>
          {data.score}/{meta.maxScore}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={data.score} aria-valuemin={0} aria-valuemax={meta.maxScore} aria-label={`${meta.label}: ${data.score} out of ${meta.maxScore}`}>
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

interface ScoreCircleProps {
  score: number;
  grade: Grade;
  size?: number;
}

const ScoreCircle = ({ score, grade, size = 120 }: ScoreCircleProps) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const config: CompareGradeConfig = GRADE_CONFIG[grade] || GRADE_CONFIG.B;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" role="img" aria-label={`Score ${score} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={config.color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold" style={{ color: config.color }}>
          {score}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Score</p>
      </div>
    </div>
  );
};

export default function ComparePage() {
  const t = useTranslation();
  const [prompt1, setPrompt1] = useState<string>('');
  const [prompt2, setPrompt2] = useState<string>('');
  const [jobRole, setJobRole] = useState<JobRole>('Marketing');
  const [loading, setLoading] = useState<boolean>(false);
  const [result1, setResult1] = useState<AnalysisResult | null>(null);
  const [result2, setResult2] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleCompare = async () => {
    if (!prompt1.trim() || !prompt2.trim()) {
      setError('Please enter both prompts');
      return;
    }

    if (prompt1.trim().length < 10 || prompt2.trim().length < 10) {
      setError('Both prompts need to be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');
    setResult1(null);
    setResult2(null);

    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt1.trim(), jobRole }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt2.trim(), jobRole }),
        }),
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error('Failed to analyze prompts');
      }

      const data1: AnalysisResult = await res1.json();
      const data2: AnalysisResult = await res2.json();

      setResult1(data1);
      setResult2(data2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while comparing prompts');
      console.error('Compare error:', err);
    } finally {
      setLoading(false);
    }
  };

  const winner: 1 | 2 | null =
    result1 && result2
      ? result1.overallScore > result2.overallScore
        ? 1
        : result2.overallScore > result1.overallScore
        ? 2
        : null
      : null;

  const delta: number =
    result1 && result2
      ? Math.abs(result1.overallScore - result2.overallScore)
      : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              {t.nav.home}
            </a>
            <a href="https://x.com/scoremyprompt" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t.pricingDetail.community}
            </a>
          </div>
        </div>
      </nav>

      <section id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t.compare.title}</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.compareDetail.heroSubtitle}
          </p>
        </div>

        {/* Job Role Selector */}
        <div className="card mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {t.compareDetail.jobRoleLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {JOB_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setJobRole(role)}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg font-medium transition-all duration-200 text-sm ${
                  jobRole === role
                    ? 'bg-primary text-white'
                    : 'bg-dark border border-border text-gray-400 hover:border-primary'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Input */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Prompt 1 */}
          <div className="card">
            <label htmlFor="prompt1" className="block text-sm font-medium text-gray-300 mb-3">
              {t.compareDetail.prompt1}
            </label>
            <textarea
              id="prompt1"
              value={prompt1}
              onChange={(e) => {
                setPrompt1(e.target.value);
                setError('');
              }}
              placeholder={t.compareDetail.placeholder1}
              className="input-field min-h-40 sm:min-h-40 min-h-32 resize-none"
              maxLength={5000}
              aria-describedby="prompt1-count"
            />
            <div className="flex items-center justify-between mt-2">
              <PromptQualityIndicator prompt={prompt1} />
              <p id="prompt1-count" className={`text-xs flex-shrink-0 ${prompt1.length > 4500 ? 'text-amber-400' : 'text-gray-400'}`}>
                {prompt1.length} / 5,000
              </p>
            </div>
          </div>

          {/* Prompt 2 */}
          <div className="card">
            <label htmlFor="prompt2" className="block text-sm font-medium text-gray-300 mb-3">
              {t.compareDetail.prompt2}
            </label>
            <textarea
              id="prompt2"
              value={prompt2}
              onChange={(e) => {
                setPrompt2(e.target.value);
                setError('');
              }}
              placeholder={t.compareDetail.placeholder2}
              className="input-field min-h-40 sm:min-h-40 min-h-32 resize-none"
              maxLength={5000}
              aria-describedby="prompt2-count"
            />
            <div className="flex items-center justify-between mt-2">
              <PromptQualityIndicator prompt={prompt2} />
              <p id="prompt2-count" className={`text-xs flex-shrink-0 ${prompt2.length > 4500 ? 'text-amber-400' : 'text-gray-400'}`}>
                {prompt2.length} / 5,000
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Compare Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleCompare}
            disabled={loading || (!prompt1.trim() && !prompt2.trim())}
            className="btn-primary font-semibold text-lg px-12 py-4 w-full sm:w-auto min-h-[48px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.compareDetail.comparing}
              </span>
            ) : (
              t.compareDetail.compare
            )}
          </button>
        </div>

        {/* Results */}
        {result1 && result2 && (
          <div className="grid sm:grid-cols-2 gap-6 mb-12 animate-fade-in">
            {/* Result 1 */}
            <div
              className={`card ${
                winner === 1
                  ? 'border-green-500 bg-gradient-to-br from-green-500/5 to-green-600/5'
                  : ''
              }`}
            >
              {winner === 1 && (
                <div className="mb-4 inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                  {t.compareDetail.winner}
                </div>
              )}

              <div className="flex justify-center mb-6">
                <ScoreCircle score={result1.overallScore} grade={result1.grade} />
              </div>

              <div className="text-center mb-6 pb-6 border-b border-border">
                <p className="text-gray-400 mb-3">{t.compareDetail.scoreDifference}</p>
                <p className="text-2xl font-bold text-white">
                  {winner === 1
                    ? t.compareDetail.pointsPlus.replace('{delta}', String(delta))
                    : winner === 2
                    ? t.compareDetail.pointsMinus.replace('{delta}', String(delta))
                    : t.compareDetail.tied}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-4">{t.compareDetail.dimensions}</h4>
                {(Object.keys(DIMENSION_META) as DimensionKey[]).map((key) => (
                  <DimensionBar
                    key={key}
                    dimKey={key}
                    data={result1.dimensions?.[key]}
                  />
                ))}
              </div>
            </div>

            {/* Result 2 */}
            <div
              className={`card ${
                winner === 2
                  ? 'border-green-500 bg-gradient-to-br from-green-500/5 to-green-600/5'
                  : ''
              }`}
            >
              {winner === 2 && (
                <div className="mb-4 inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                  {t.compareDetail.winner}
                </div>
              )}

              <div className="flex justify-center mb-6">
                <ScoreCircle score={result2.overallScore} grade={result2.grade} />
              </div>

              <div className="text-center mb-6 pb-6 border-b border-border">
                <p className="text-gray-400 mb-3">{t.compareDetail.scoreDifference}</p>
                <p className="text-2xl font-bold text-white">
                  {winner === 2
                    ? t.compareDetail.pointsPlus.replace('{delta}', String(delta))
                    : winner === 1
                    ? t.compareDetail.pointsMinus.replace('{delta}', String(delta))
                    : t.compareDetail.tied}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-4">{t.compareDetail.dimensions}</h4>
                {(Object.keys(DIMENSION_META) as DimensionKey[]).map((key) => (
                  <DimensionBar
                    key={key}
                    dimKey={key}
                    data={result2.dimensions?.[key]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="card bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 text-center py-8">
          <h4 className="text-2xl font-bold text-white mb-3">{t.compareDetail.wantDeeper}</h4>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm">
            {t.compareDetail.wantDeeperDesc}
          </p>
          <a href="/" className="btn-primary inline-block">
            {t.compareDetail.tryFullAnalyzer}
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
