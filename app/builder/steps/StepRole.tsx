'use client';
import { ROLES } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

interface Props {
  value: BuilderAnswers['role'];
  onChange: (value: BuilderAnswers['role']) => void;
}

export default function StepRole({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">What is your role?</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`rounded-lg border px-4 py-3 text-center text-sm font-medium transition ${
              value === r ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface text-gray-300 hover:border-primary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
