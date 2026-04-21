'use client';

import Link from 'next/link';
import { useTranslation } from '../../i18n';

interface ActionButtonsProps {
  isPro: boolean;
  isGuest: boolean;
  analysisId?: string;
  exporting: boolean;
  onNewAnalysis: () => void;
  onExport: (format: 'html' | 'csv') => void;
}

export default function ActionButtons({
  isPro,
  isGuest,
  analysisId,
  exporting,
  onNewAnalysis,
  onExport,
}: ActionButtonsProps) {
  const t = useTranslation();
  return (
    <div className="flex gap-4 mt-12 justify-center flex-wrap">
      <button onClick={onNewAnalysis} className="btn-primary font-semibold">
        {t.result.analyzeAnother}
      </button>
      {!isGuest && analysisId ? (
        <div className="flex gap-2">
          <button
            onClick={() => onExport('html')}
            disabled={exporting}
            className="btn-secondary font-semibold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {exporting ? t.result.exporting : 'HTML'}
          </button>
          <button
            onClick={() => onExport('csv')}
            disabled={exporting}
            className="btn-secondary font-semibold flex items-center gap-2 text-sm"
          >
            CSV
          </button>
        </div>
      ) : null}
      {isPro && (
        <Link href="/bulk" className="btn-secondary font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          {t.result.bulkAnalysis}
        </Link>
      )}
    </div>
  );
}
