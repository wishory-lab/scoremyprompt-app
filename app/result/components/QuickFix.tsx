'use client';

interface QuickFixProps {
  improvements: string[] | undefined;
  isPro: boolean;
  onNewAnalysis: () => void;
}

export default function QuickFix({ improvements, isPro, onNewAnalysis }: QuickFixProps) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div className="card mb-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/30 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-amber-400 text-lg" aria-hidden="true">&#9889;</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white mb-1">Quick Fix</h2>
          <p className="text-sm text-amber-200/80 mb-3">The #1 thing you can do right now to improve your score:</p>
          <p className="text-gray-200 text-sm leading-relaxed">{improvements[0]}</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onNewAnalysis}
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors min-h-[44px]"
            >
              Fix it &amp; re-score &rarr;
            </button>
            {!isPro && improvements.length > 1 && (
              <span className="text-xs text-gray-500">
                +{improvements.length - 1} more fixes with full analysis
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
