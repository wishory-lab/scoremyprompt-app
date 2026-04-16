'use client';

import { useState } from 'react';
import { trackWaitlistSignup, trackNewsletterSignup } from '@/app/lib/analytics';

export default function Waitlist({ source = 'homepage_newsletter' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe. Please try again.');
      }

      trackWaitlistSignup({ source });
      trackNewsletterSignup({ source });
      setSubmitted(true);
      setEmail('');

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-gradient-to-br from-primary/10 via-surface to-accent/10 border-primary/40 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          </div>

          <div className="relative z-10">
            {!submitted ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Get smarter with AI every week
                  </h2>
                  <p className="text-lg text-gray-300">
                    Weekly: top prompts of the week, new AI tools, and practical tips.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="your@email.com"
                      className="input-field flex-1"
                      disabled={loading}
                      autoComplete="email"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Subscribing...
                        </span>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  {/* Privacy Note */}
                  <p className="text-xs text-gray-400 text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-8 animate-fade-in">
                  {/* Confetti-like animation */}
                  <div className="mb-6 relative h-16 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-bounce"
                        style={{
                          left: `${50 + Math.cos(i * Math.PI / 4) * 30}%`,
                          top: `${50 + Math.sin(i * Math.PI / 4) * 30}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      >
                        <div className="text-2xl">
                          {['🚀', '✨', '🎯', '💡', '🔥', '⭐', '🎉', '🌟'][i]}
                        </div>
                      </div>
                    ))}
                    {/* Center checkmark */}
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
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
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    You're in! 🎉
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Check your inbox for this week's top prompts and start
                    improving your AI skills.
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Watch for emails from{' '}
                      <span className="text-primary font-medium">
                        hello@scoremyprompt.com
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      New prompt recipes and tips every Monday
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Bottom badge */}
            <div className="pt-6 border-t border-primary/20 text-center">
              <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-xs text-primary font-medium">
                Join our community
              </span>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gradient">5K+</p>
            <p className="text-xs text-gray-400 mt-1">subscribers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gradient">10+</p>
            <p className="text-xs text-gray-400 mt-1">weekly prompts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gradient">100%</p>
            <p className="text-xs text-gray-400 mt-1">spam-free</p>
          </div>
        </div>
      </div>
    </section>
  );
}
