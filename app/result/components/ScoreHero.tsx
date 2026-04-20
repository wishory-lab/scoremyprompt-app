'use client';

import ScoreCircle from '../../components/ScoreCircle';
import type { AnalysisResult, GradeConfig } from '../../types';
import { useTranslation } from '../../i18n';

interface ExtendedGradeConfig extends GradeConfig {
  bg: string;
}

interface ScoreHeroProps {
  result: AnalysisResult;
  gradeConfig: ExtendedGradeConfig;
}

export default function ScoreHero({ result, gradeConfig }: ScoreHeroProps) {
  const t = useTranslation();
  const renderPercentile = () => {
    if (!result.benchmarks) return null;
    const template = t.resultPage.percentileText;
    const percentile = String(result.benchmarks.percentile);
    const role = result.jobRole || '';
    const parts = template.split(/(\{percentile\}|\{role\})/);
    return (
      <p className="text-gray-400 max-w-xl mx-auto">
        {parts.map((part, i) => {
          if (part === '{percentile}') {
            return (
              <span key={i} className="text-primary font-semibold">
                {percentile}
              </span>
            );
          }
          if (part === '{role}') return <span key={i}>{role}</span>;
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="text-center mb-14 animate-fade-in">
      <div className="flex justify-center mb-6">
        <ScoreCircle score={result.overallScore} grade={result.grade} config={gradeConfig} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
        {gradeConfig.emoji} {result.scoreLevel || gradeConfig.label}!
      </h1>
      <p className="text-gray-400 text-sm mb-3">{gradeConfig.message}</p>
      {renderPercentile()}
    </div>
  );
}
