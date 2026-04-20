'use client';

import ScoreCircle from '../../components/ScoreCircle';
import { useTranslation } from '../../i18n';
import type { Grade, AnalysisResult } from '../../types';

interface ExtendedGradeConfig {
  min: number;
  color: string;
  label: string;
  emoji: string;
  message: string;
  bg: string;
}

interface ScoreHeroProps {
  result: AnalysisResult;
  gradeConfig: ExtendedGradeConfig;
}

export default function ScoreHero({ result, gradeConfig }: ScoreHeroProps) {
  const t = useTranslation();
  const percentileText = t.result.percentileText
    .replace('{percentile}', String(result.benchmarks?.percentile || 0))
    .replace('{role}', result.jobRole || '');

  return (
    <div className="text-center mb-14 animate-fade-in">
      <div className="flex justify-center mb-6">
        <ScoreCircle score={result.overallScore} grade={result.grade} config={gradeConfig} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
        {gradeConfig.emoji} {result.scoreLevel || gradeConfig.label}!
      </h1>
      <p className="text-gray-400 text-sm mb-3">{gradeConfig.message}</p>
      {result.benchmarks && (
        <p className="text-gray-400 max-w-xl mx-auto" dangerouslySetInnerHTML={{
          __html: percentileText.replace(
            `${result.benchmarks.percentile}%`,
            `<span class="text-primary font-semibold">${result.benchmarks.percentile}%</span>`
          )
        }} />
      )}
    </div>
  );
}
