'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FAQ_ITEMS } from './data';
import Footer from '../components/Footer';
import { useAuth } from '@/app/components/AuthProvider';
import { trackPricingViewed } from '@/app/lib/analytics';

const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: '$0',
    period: '/forever',
    cta: 'Score My First Prompt',
    features: [
      { text: 'Score up to 10 prompts a day', included: true },
      { text: 'See all 6 PROMPT dimensions', included: true },
      { text: 'Compare with peers on the leaderboard', included: true },
      { text: 'Share your score on social media', included: true },
      { text: 'Ads shown between sections', included: false },
      { text: 'No saved history', included: false },
      { text: 'No AI rewrite suggestions', included: false },
    ],
  },
  pro: {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    badge: 'Most Popular',
    trial: '7-day free trial',
    cta: 'Start Free Trial',
    highlight: true,
    features: [
      { text: 'Unlimited scoring — never hit a daily cap', included: true },
      { text: 'Unlimited Harness Builder generations', included: true },
      { text: 'AI rewrites your prompt for a higher score', included: true },
      { text: 'Track progress and revisit past analyses', included: true },
      { text: 'Score 5 prompts at once with Bulk mode', included: true },
      { text: 'Clean, distraction-free experience (no ads)', included: true },
      { text: 'Export polished HTML reports for clients', included: true },
      { text: 'Priority support when you need help', included: true },
    ],
  },
};

export default function PricingClient() {
  const router = useRouter();
  const { user, tier, supabase } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pricingPlan, setPricingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;
    (async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('pricing_plan')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.pricing_plan) setPricingPlan(data.pricing_plan as string);
    })();
  }, [user, supabase]);

  useEffect(() => {
    trackPricingViewed({
      tier: (tier as 'guest' | 'free' | 'pro') ?? 'guest',
      pricingPlan: (pricingPlan as 'legacy_999' | 'pro_499' | null) ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFreePlan = () => {
    router.push('/');
  };

  const handleProPlan = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate checkout');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const isLegacy = pricingPlan === 'legacy_999';
  const displayedProPrice = isLegacy ? '$9.99' : PRICING_PLANS.pro.price;

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

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Simple <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your prompt engineering needs. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <div className="card flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{PRICING_PLANS.free.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{PRICING_PLANS.free.price}</span>
                <span className="text-gray-400">{PRICING_PLANS.free.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_PLANS.free.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : (
                    <span className="text-gray-600 text-lg">✕</span>
                  )}
                  <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Button */}
            <button
              onClick={handleFreePlan}
              className="btn-secondary w-full font-semibold"
            >
              {PRICING_PLANS.free.cta}
            </button>
          </div>

          {/* Pro Plan */}
          <div
            className={`card flex flex-col relative overflow-hidden ${
              PRICING_PLANS.pro.highlight
                ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5'
                : ''
            }`}
          >
            {PRICING_PLANS.pro.badge && (
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                {PRICING_PLANS.pro.badge}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{PRICING_PLANS.pro.name}</h3>
              {isLegacy && (
                <div className="mb-4 inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300">
                  🏆 You have Legacy Pro — locked at $9.99 forever
                </div>
              )}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{displayedProPrice}</span>
                <span className="text-gray-400">{PRICING_PLANS.pro.period}</span>
              </div>
              {PRICING_PLANS.pro.trial && !isLegacy && (
                <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  {PRICING_PLANS.pro.trial}
                </span>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8 flex-grow">
              {PRICING_PLANS.pro.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <span className="text-green-500 text-lg">✓</span>
                  ) : (
                    <span className="text-gray-600 text-lg">✕</span>
                  )}
                  <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Button */}
            <button
              onClick={handleProPlan}
              className="btn-primary w-full font-semibold"
              disabled={isLegacy}
            >
              {isLegacy ? 'Already subscribed (Legacy)' : PRICING_PLANS.pro.cta}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="card"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                >
                  <h4 className="text-lg font-semibold text-white text-left">
                    {item.question}
                  </h4>
                  <span className={`text-xl text-primary transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {openFaq === idx && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
