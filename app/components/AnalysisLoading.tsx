'use client';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/app/i18n';

export default function AnalysisLoading() {
  const t = useTranslation();

  const STEPS = useMemo(() => [
    { label: t.analysisLoading.step1Label, detail: t.analysisLoading.step1Detail, duration: 1500, icon: '📖' },
    { label: t.analysisLoading.step2Label, detail: t.analysisLoading.step2Detail, duration: 3000, icon: '🔬' },
    { label: t.analysisLoading.step3Label, detail: t.analysisLoading.step3Detail, duration: 2000, icon: '📊' },
    { label: t.analysisLoading.step4Label, detail: t.analysisLoading.step4Detail, duration: 2000, icon: '✨' },
  ], [t]);

  const TIPS = useMemo(() => [
    { text: t.analysisLoading.tip1Text, category: t.analysisLoading.tip1Category },
    { text: t.analysisLoading.tip2Text, category: t.analysisLoading.tip2Category },
    { text: t.analysisLoading.tip3Text, category: t.analysisLoading.tip3Category },
    { text: t.analysisLoading.tip4Text, category: t.analysisLoading.tip4Category },
    { text: t.analysisLoading.tip5Text, category: t.analysisLoading.tip5Category },
  ], [t]);

  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStep(i), STEPS.slice(0, i).reduce((a, b) => a + b.duration, 0))
    );
    return () => timers.forEach(clearTimeout);
  }, [STEPS]);

  // Smooth progress bar
  useEffect(() => {
    const totalDuration = STEPS.reduce((a, b) => a + b.duration, 0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (totalDuration / 50));
        return next >= 95 ? 95 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [STEPS]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right mt-1">{Math.round(progress)}%</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 transition-all duration-300 ${
              i <= step ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all duration-300 ${
                i < step
                  ? 'bg-green-500/20 text-green-400'
                  : i === step
                  ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                  : 'bg-slate-800 text-slate-600'
              }`}
            >
              {i < step ? '✓' : s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-medium block ${
                  i === step ? 'text-white' : i < step ? 'text-gray-400' : 'text-slate-600'
                }`}
              >
                {s.label}
                {i === step && <span className="inline-block ml-1 animate-pulse">...</span>}
              </span>
              {i <= step && (
                <span className="text-xs text-gray-500 block mt-0.5">{s.detail}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Preview */}
      <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
        <div className="h-20 w-20 mx-auto rounded-full bg-slate-700/50 animate-pulse" />
        <div className="h-4 bg-slate-700/50 rounded w-3/4 mx-auto animate-pulse" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-3 bg-slate-700/30 rounded text-[8px] text-slate-600 flex items-center justify-center">
                {'PROMPT'[i]}
              </div>
              <div className="h-3 bg-slate-700/50 rounded animate-pulse" style={{ width: `${40 + Math.random() * 50}%`, animationDelay: `${i * 100}ms` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-xs text-blue-400 font-medium mb-1">{tip.category}</p>
        <p className="text-blue-300 text-sm">{tip.text}</p>
      </div>
    </div>
  );
}
