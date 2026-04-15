'use client';
import { GOALS } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

const LABELS: Record<(typeof GOALS)[number], string> = {
  weekly_research: 'Weekly research reports',
  card_news_sns: 'Card news / SNS content',
  competitor_monitoring: 'Competitor monitoring',
  customer_replies: 'Customer reply drafts',
  data_summaries: 'Data analysis summaries',
  meeting_notes: 'Meeting notes + action items',
};

interface Props {
  value: BuilderAnswers['goals'];
  onChange: (value: BuilderAnswers['goals']) => void;
}

export default function StepGoals({ value, onChange }: Props) {
  function toggle(goal: (typeof GOALS)[number]) {
    if (value.includes(goal)) {
      onChange(value.filter((g) => g !== goal));
    } else {
      onChange([...value, goal]);
    }
  }
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">What should AI automate? (pick 1+)</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOALS.map((g) => {
          const checked = value.includes(g);
          return (
            <label
              key={g}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-sm transition ${
                checked ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface text-gray-300 hover:border-primary'
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(g)} className="mr-2" />
              {LABELS[g]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
