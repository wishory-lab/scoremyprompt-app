'use client';
import { TONE_STYLES } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

const EXAMPLES: Record<(typeof TONE_STYLES)[number], string> = {
  Professional: '"We analyzed Q3 trends across three key verticals..."',
  Friendly: '"Hey team, here\'s what we learned this week and what it means for you..."',
  Bold: '"Stop. This one change wins 40% more conversions. Here\'s how."',
};

interface Props {
  value: BuilderAnswers['tone'];
  onChange: (value: BuilderAnswers['tone']) => void;
}

export default function StepBrand({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">Pick a tone your AI should write in.</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TONE_STYLES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`rounded-lg border p-4 text-left transition ${
              value === t ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary'
            }`}
          >
            <div className="text-base font-bold text-white">{t}</div>
            <div className="mt-2 text-sm text-gray-400 italic">{EXAMPLES[t]}</div>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
