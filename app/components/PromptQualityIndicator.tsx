'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/app/i18n';

interface Props {
  prompt: string;
}

type Level = 'empty' | 'weak' | 'moderate' | 'strong';

const LEVEL_STYLE: Record<Level, { color: string; barColor: string; bars: number }> = {
  empty:    { color: 'text-gray-500',    barColor: 'bg-gray-700',     bars: 0 },
  weak:     { color: 'text-red-400',     barColor: 'bg-red-400',      bars: 1 },
  moderate: { color: 'text-amber-400',   barColor: 'bg-amber-400',    bars: 2 },
  strong:   { color: 'text-emerald-400', barColor: 'bg-emerald-400',  bars: 3 },
};

// Check keys map to t.quality tip keys
const CHECK_KEYS = ['tipContext', 'tipOutput', 'tipDetail', 'tipObjective'] as const;

function analyzePrompt(text: string): { level: Level; failedTipKey: string | null } {
  const trimmed = text.trim();
  if (trimmed.length < 10) return { level: 'empty', failedTipKey: null };

  const checks = [
    { tipKey: 'tipContext',   passed: /(?:you are|act as|as a|role|context|background)/i.test(trimmed) },
    { tipKey: 'tipOutput',    passed: /(?:format|output|structure|bullet|list|table|json|markdown|paragraph)/i.test(trimmed) },
    { tipKey: 'tipDetail',    passed: trimmed.length >= 100 },
    { tipKey: 'tipObjective', passed: /(?:create|write|analyze|design|build|generate|develop|explain|summarize|compare)/i.test(trimmed) },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const firstFailed = checks.find((c) => !c.passed);

  if (passed >= 3) return { level: 'strong', failedTipKey: firstFailed?.tipKey || null };
  if (passed >= 2) return { level: 'moderate', failedTipKey: firstFailed?.tipKey || null };
  return { level: 'weak', failedTipKey: firstFailed?.tipKey || null };
}

export default function PromptQualityIndicator({ prompt }: Props) {
  const t = useTranslation();
  const { level, failedTipKey } = useMemo(() => analyzePrompt(prompt), [prompt]);
  const style = LEVEL_STYLE[level];

  const levelLabels: Record<Level, string> = {
    empty: '',
    weak: t.quality.weak,
    moderate: t.quality.moderate,
    strong: t.quality.strong,
  };

  if (level === 'empty') return null;

  return (
    <div className="flex items-center gap-3 mt-2" aria-live="polite">
      <div className="flex items-center gap-1" aria-label={levelLabels[level]}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-5 sm:w-6 rounded-full transition-all duration-300 ${
              i <= style.bars ? style.barColor : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${style.color} transition-colors duration-300`}>
        {levelLabels[level]}
      </span>

      {level !== 'strong' && failedTipKey && (
        <span className="text-xs text-gray-500 hidden sm:inline">
          {(t.quality as Record<string, string>)[failedTipKey] || ''}
        </span>
      )}
    </div>
  );
}
