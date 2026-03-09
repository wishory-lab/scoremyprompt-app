import type { Metadata } from 'next';
import { CHANGELOG } from './data';

export const metadata: Metadata = {
  title: 'Changelog — ScoreMyPrompt',
  description: 'See what\'s new in ScoreMyPrompt. Latest features, improvements, and fixes.',
  robots: { index: true, follow: true },
};

const TYPE_STYLES = {
  feature: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Feature' },
  improvement: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Improvement' },
  fix: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Fix' },
  infrastructure: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Infrastructure' },
} as const;

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Changelog
          </h1>
          <p className="text-gray-400 text-lg">
            Track every update to ScoreMyPrompt
          </p>
        </header>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-white/10" aria-hidden="true" />

          <div className="space-y-10">
            {CHANGELOG.map((entry) => {
              const style = TYPE_STYLES[entry.type];
              return (
                <article
                  key={entry.version}
                  className="relative pl-12 sm:pl-16"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2.5 sm:left-4.5 top-1.5 w-3 h-3 rounded-full border-2 border-dark ${style.bg.replace('/10', '/80')}`}
                    aria-hidden="true"
                  />

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-500">
                      v{entry.version}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <time dateTime={entry.date} className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  <h2 className="text-lg font-semibold text-white mb-2">
                    {entry.title}
                  </h2>

                  <ul className="space-y-1">
                    {entry.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-gray-600 mt-1 shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>

        <footer className="mt-16 text-center">
          <a
            href="/"
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            ← Back to ScoreMyPrompt
          </a>
        </footer>
      </div>
    </div>
  );
}
