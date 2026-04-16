'use client';
import { TOOLS } from '@/app/types/builder';
import type { BuilderAnswers } from '@/app/types/builder';

const LABELS: Record<(typeof TOOLS)[number], string> = {
  web_search: 'Web search',
  google_sheets: 'Google Sheets',
  notion: 'Notion',
  slack: 'Slack',
  github: 'GitHub',
  buffer: 'Buffer',
};

interface Props {
  value: BuilderAnswers['tools'];
  onChange: (value: BuilderAnswers['tools']) => void;
}

export default function StepTools({ value, onChange }: Props) {
  function toggle(tool: (typeof TOOLS)[number]) {
    if (value.includes(tool)) onChange(value.filter((t) => t !== tool));
    else onChange([...value, tool]);
  }
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-white mb-2">Which tools to connect? (optional)</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TOOLS.map((t) => {
          const checked = value.includes(t);
          return (
            <label
              key={t}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-sm transition ${
                checked ? 'border-primary bg-primary/10 text-white' : 'border-border bg-surface text-gray-300 hover:border-primary'
              }`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(t)} className="mr-2" />
              {LABELS[t]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
