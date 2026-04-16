'use client';
import type { BuilderAnswers } from '@/app/types/builder';

interface Props {
  value: BuilderAnswers['automation'];
  onChange: (value: BuilderAnswers['automation']) => void;
}

export default function StepAutomation({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">How much control do you keep?</legend>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onChange('semi_auto')}
          className={`w-full rounded-lg border p-4 text-left transition ${
            value === 'semi_auto' ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary'
          }`}
        >
          <div className="font-bold text-white">Semi-auto</div>
          <div className="mt-1 text-sm text-gray-400">AI asks for approval before each action. Best for starting out.</div>
        </button>
        <button
          type="button"
          onClick={() => onChange('full_auto')}
          className={`w-full rounded-lg border p-4 text-left transition ${
            value === 'full_auto' ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary'
          }`}
        >
          <div className="font-bold text-white">Full-auto</div>
          <div className="mt-1 text-sm text-gray-400">AI runs end-to-end with a retry-on-fail loop. Best for trusted workflows.</div>
        </button>
      </div>
    </fieldset>
  );
}
