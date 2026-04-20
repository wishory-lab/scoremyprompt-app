'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n';
import { FAQ_ITEMS } from './data';
import Footer from '../components/Footer';

export default function PricingPage() {
  const router = useRouter();
  const t = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const PRICING_PLANS = {
    free: {
      name: t.pricingDetail.freeName,
      price: t.pricingDetail.freePrice,
      period: t.pricingDetail.freePeriod,
      cta: t.pricingDetail.freeCta,
      features: [
        { text: t.pricingDetail.freeFeature1, included: true },
        { text: t.pricingDetail.freeFeature2, included: true },
        { text: t.pricingDetail.freeFeature3, included: true },
        { text: t.pricingDetail.freeFeature4, included: true },
        { text: t.pricingDetail.freeFeature5, included: false },
        { text: t.pricingDetail.freeFeature6, included: false },
        { text: t.pricingDetail.freeFeature7, included: false },
      ],
    },
    pro: {
      name: t.pricingDetail.proName,
      price: t.pricingDetail.proPrice,
      period: t.pricingDetail.proPeriod,
      badge: t.pricingDetail.proBadge,
      trial: t.pricingDetail.proTrial,
      cta: t.pricingDetail.proCta,
      highlight: true,
      features: [
        { text: t.pricingDetail.proFeature1, included: true },
        { text: t.pricingDetail.proFeature2, included: true },
        { text: t.pricingDetail.proFeature3, included: true },
        { text: t.pricingDetail.proFeature4, included: true },
        { text: t.pricingDetail.proFeature5, included: true },
        { text: t.pricingDetail.proFeature6, included: true },
        { text: t.pricingDetail.proFeature7, included: true },
        { text: t.pricingDetail.proFeature8, included: false },
      ],
    },
  };

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
              {t.pricingDetail.home}
            </a>
            <a href="https://x.com/scoremyprompt" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t.pricingDetail.community}
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t.pricingDetail.heroTitle} <span className="text-gradient">{t.pricingDetail.heroTitleHighlight}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            {t.pricingDetail.heroSubtitle}
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
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{PRICING_PLANS.pro.price}</span>
                <span className="text-gray-400">{PRICING_PLANS.pro.period}</span>
              </div>
              {PRICING_PLANS.pro.trial && (
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
            >
              {PRICING_PLANS.pro.cta}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t.pricingDetail.faqTitle}
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
