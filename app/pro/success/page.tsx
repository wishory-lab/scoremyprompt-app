'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from '../../components/Footer';
import { trackProSubscribed } from '@/app/lib/analytics';

declare global {
  interface Window {
    confetti?: (options: { particleCount: number; spread: number; origin: { y: number } }) => void;
  }
}

const FEATURES = [
  {
    title: 'Unlimited Analyses',
    description: 'No daily limits. Score as many prompts as you want.',
  },
  {
    title: 'Auto-Rewrite',
    description: 'AI rewrites your prompts for higher scores automatically.',
  },
  {
    title: 'Ad-Free',
    description: 'Clean, distraction-free experience while analyzing.',
  },
];

export default function ProSuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track Pro subscription conversion
    const plan = searchParams.get('plan') || 'pro_monthly';
    const source = searchParams.get('source') || 'pricing_page';
    trackProSubscribed({ plan, source });

    // Trigger confetti animation on mount
    const triggerConfetti = () => {
      if (typeof window !== 'undefined' && window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    // Delay slightly to ensure DOM is ready
    const timer = setTimeout(triggerConfetti, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Home
            </a>
            <a href="https://x.com/scoremyprompt" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              Community →
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 text-center">
        {/* CSS Confetti Animation */}
        <style>{`
          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(600px) rotate(720deg);
              opacity: 0;
            }
          }

          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            pointer-events: none;
            animation: confetti-fall 3s ease-in forwards;
          }
        `}</style>

        {/* Checkmark Icon */}
        <div className="inline-block mb-8 animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 animate-fade-in">
          Welcome to Pro!
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-400 mb-12 animate-fade-in">
          Your 7-day free trial has started
        </p>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="card hover:border-primary transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/"
            className="btn-primary font-semibold px-8 py-4 text-lg"
          >
            Analyze Your First Pro Prompt →
          </a>
          <a
            href="/dashboard"
            className="btn-secondary font-semibold px-8 py-4 text-lg"
          >
            View your dashboard →
          </a>
        </div>

        {/* Info Box */}
        <div className="card mt-12 bg-slate-800/50 border-border">
          <p className="text-sm text-gray-400 mb-2">
            Your free trial includes full access to all Pro features.
          </p>
          <p className="text-xs text-gray-400">
            No credit card will be charged until your trial ends. You can cancel anytime.
          </p>
        </div>
      </section>

      <Footer />

      {/* Tailwind Animation Definitions */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}
