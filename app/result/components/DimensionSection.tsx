'use client';

import DimensionBar from '../../components/DimensionBar';
import { useTranslation } from '../../i18n';
import type { DimensionScores } from '../../types';
import {
  DIMENSION_META as DIMENSION_META_CENTRAL,
  DIMENSION_FEEDBACK,
} from '../../constants';

const DIMENSION_KEYS = ['precision', 'role', 'outputFormat', 'missionContext', 'promptStructure', 'tailoring'] as const;

// Extend centralized DIMENSION_META with display labels
const DIMENSION_META = Object.fromEntries(
  Object.entries(DIMENSION_META_CENTRAL).map(([key, meta]) => [
    key,
    { ...meta, label: `${meta.letter} \u2014 ${meta.label}` },
  ])
);

interface DimensionSectionProps {
  dimensions: DimensionScores;
  isGuest: boolean;
  onSignupClick: () => void;
}

export default function DimensionSection({ dimensions, isGuest, onSignupClick }: DimensionSectionProps) {
  const t = useTranslation();
  return (
    <div className="card mb-12 relative">
      <h2 className="text-xl font-bold text-white mb-2">{t.result.promptDimensions}</h2>
      <p className="text-sm text-gray-400 mb-8">{t.result.dimensionSubtitle}</p>
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-x-8 stagger-children">
        {DIMENSION_KEYS.map((key, idx) => (
          <DimensionBar
            key={key}
            dimKey={key}
            data={dimensions?.[key]}
            meta={DIMENSION_META[key]}
            feedback={DIMENSION_FEEDBACK[key]}
            blurred={isGuest && idx > 0}
            index={idx}
          />
        ))}
      </div>
      {isGuest && (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface via-surface/90 to-transparent flex items-end justify-center pb-6 rounded-b-lg">
          <button
            onClick={onSignupClick}
            className="btn-primary text-sm font-semibold px-6"
          >
            {t.result.signUpDimensions}
          </button>
        </div>
      )}
    </div>
  );
}
