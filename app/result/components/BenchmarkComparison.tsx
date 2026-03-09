'use client';

import PercentileBar from '../../components/PercentileBar';
import { useTranslation } from '../../i18n';
import type { AnalysisResult } from '../../types';

interface BenchmarkComparisonProps {
  result: AnalysisResult;
}

export default function BenchmarkComparison({ result }: BenchmarkComparisonProps) {
  const t = useTranslation();
  if (!result.benchmarks) return null;

  return (
    <div className="card mb-12" aria-label="Benchmark comparison">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="text-center sm:border-r border-border pb-4 sm:pb-0">
          <p className="text-gray-400 text-sm mb-2">{t.result.yourScore}</p>
          <p className="text-3xl font-bold text-primary">{result.overallScore}</p>
        </div>
        <div className="text-center sm:border-r border-border pb-4 sm:pb-0">
          <p className="text-gray-400 text-sm mb-2">{t.result.average.replace('{role}', result.jobRole || '')}</p>
          <p className="text-3xl font-bold text-gray-300">{result.benchmarks.average}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">{t.result.excellentThreshold}</p>
          <p className="text-3xl font-bold text-accent">{result.benchmarks.excellent}</p>
        </div>
      </div>
      <PercentileBar
        score={result.overallScore}
        average={result.benchmarks.average}
        excellent={result.benchmarks.excellent}
        percentile={result.benchmarks.percentile}
      />
    </div>
  );
}
