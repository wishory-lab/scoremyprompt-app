'use client';
import { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Reading your prompt', detail: 'Identifying key elements and structure', duration: 1500, icon: '📖' },
  { label: 'Analyzing 6 PROMPT dimensions', detail: 'Precision · Role · Output · Mission · Structure · Tailoring', duration: 3000, icon: '🔬' },
  { label: 'Calculating your score', detail: 'Applying the PROMPT 6-dimension rubric', duration: 2000, icon: '📊' },
  { label: 'Generating personalized feedback', detail: 'Creating actionable improvement suggestions', duration: 2000, icon: '✨' },
];

const TIPS = [
  { text: '85% of top-scoring prompts include a specific Role.', category: 'Did you know?' },
  { text: 'Adding output format can boost your score by 15 points.', category: 'Pro tip' },
  { text: 'The average prompt scores 62 points. Can you beat it?', category: 'Fun fact' },
  { text: 'Context-rich prompts score 2x higher on Mission Context.', category: 'Pro tip' },
  { text: 'Prompts with clear structure are 3x easier for AI to follow.', category: 'Research' },
];

export default function AnalysisLoading() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setStep(i), STEPS.slice(0, i).reduce((a, b) => a + b.duration, 0))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

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
  }, []);

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
