'use client';

import Link from 'next/link';
import { useTranslation } from '../../i18n';
import type { DimensionScores } from '../../types';
import { DIMENSION_META as DIMENSION_META_CENTRAL } from '../../constants';
import { GUIDES_CONTENT } from '../../guides/content';

const DIMENSION_KEYS = ['precision', 'role', 'outputFormat', 'missionContext', 'promptStructure', 'tailoring'] as const;

const DIMENSION_GUIDE_MAP: Record<string, string> = {
  precision: 'how-to-write-better-ai-prompts',
  role: 'prompt-engineering-for-beginners',
  outputFormat: 'chatgpt-prompt-tips',
  missionContext: 'prompt-score-framework',
  promptStructure: 'chatgpt-prompt-tips',
  tailoring: 'prompt-engineering-for-marketers',
};

interface GuideSuggestionsProps {
  dimensions: DimensionScores;
}

export default function GuideSuggestions({ dimensions }: GuideSuggestionsProps) {
  const t = useTranslation();
  const dimEntries = DIMENSION_KEYS
    .map((key) => {
      const data = dimensions[key];
      const meta = DIMENSION_META_CENTRAL[key];
      if (!data || !meta) return null;
      const pct = (data.score / meta.maxScore) * 100;
      return { key, pct, label: meta.label, letter: meta.letter };
    })
    .filter((d): d is NonNullable<typeof d> => d != null)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .filter((d) => d.pct < 75);

  if (dimEntries.length === 0) return null;

  const guideLinks = dimEntries
    .map((d) => {
      const slug = DIMENSION_GUIDE_MAP[d.key];
      const guide = GUIDES_CONTENT.find((g) => g.slug === slug);
      return guide ? { dimension: d, guide } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
    .filter((item, idx, arr) => arr.findIndex((x) => x.guide.slug === item.guide.slug) === idx);

  if (guideLinks.length === 0) return null;

  return (
    <div className="card mb-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30">
      <h2 className="text-lg font-bold text-white mb-2 flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2" aria-hidden="true" />
        {t.result.wantToImprove}
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        {t.result.wantToImproveDesc}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guideLinks.map(({ dimension, guide }) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-primary hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-amber-500/20 text-amber-400">
                {dimension.letter}
              </span>
              <span className="text-xs text-amber-400 font-medium">
                {t.result.improveDimension.replace('{dimension}', dimension.label)}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors mb-1">
              {guide.title}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2">
              {guide.description}
            </p>
            <span className="text-xs text-primary mt-2 inline-block group-hover:translate-x-1 transition-transform">
              {t.result.readGuide} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
