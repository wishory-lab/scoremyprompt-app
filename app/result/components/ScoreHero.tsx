'use client';

import ScoreCircle from '../../components/ScoreCircle';
import type { Grade, AnalysisResult, GradeConfig } from '../../types';

interface ExtendedGradeConfig extends GradeConfig {
  bg: string;
}

interface ScoreHeroProps {
  result: AnalysisResult;
  gradeConfig: ExtendedGradeConfig;
}

export default function ScoreHero({ result, gradeConfig }: ScoreHeroProps) {
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
        <p className="text-gray-400 max-w-xl mx-auto">
          Your prompt ranks in the <span className="text-primary font-semibold">top {result.benchmarks.percentile}%</span> compared to other {result.jobRole} professionals.
        </p>
      )}
    </div>
  );
}
