'use client';

interface StrengthsAndImprovementsProps {
  strengths: string[] | undefined;
  improvements: string[] | undefined;
}

export default function StrengthsAndImprovements({ strengths, improvements }: StrengthsAndImprovementsProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-6 mb-12" style={{ lineHeight: 'var(--leading-relaxed)' }}>
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" aria-hidden="true" />
          Strengths
        </h2>
        <ul className="space-y-3" aria-label="Prompt strengths">
          {strengths?.map((s, i) => (
            <li key={i} className="flex items-start">
              <span className="text-green-500 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true">{'\u2713'}</span>
              <span className="text-gray-300 text-sm">{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" aria-hidden="true" />
          Areas for Improvement
        </h2>
        <ul className="space-y-3" aria-label="Areas for improvement">
          {improvements?.map((imp, i) => (
            <li key={i} className="flex items-start">
              <span className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true">{'\u2192'}</span>
              <span className="text-gray-300 text-sm">{imp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
