'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import { useTranslation } from '../i18n';

export default function PricingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useTranslation();

  const freeFeatures = [
    { text: t.pricing.freeFeature1, included: true },
    { text: t.pricing.freeFeature2, included: true },
    { text: t.pricing.freeFeature3, included: true },
    { text: t.pricing.freeFeature4, included: true },
    { text: t.pricing.freeFeature5, included: false },
    { text: t.pricing.freeFeature6, included: false },
    { text: t.pricing.freeFeature7, included: false },
  ];

  const proFeatures = [
    { text: t.pricing.proFeature1, included: true },
    { text: t.pricing.proFeature2, included: true },
    { text: t.pricing.proFeature3, included: true },
    { text: t.pricing.proFeature4, included: true },
    { text: t.pricing.proFeature5, included: true },
    { text: t.pricing.proFeature6, included: true },
    { text: t.pricing.proFeature7, included: true },
    { text: t.pricing.proFeature8, included: false },
  ];

  const faqItems = [
    { question: t.pricing.faq1Q, answer: t.pricing.faq1A },
    { question: t.pricing.faq2Q, answer: t.pricing.faq2A },
    { question: t.pricing.faq3Q, answer: t.pricing.faq3A },
    { question: t.pricing.faq4Q, answer: t.pricing.faq4A },
  ];

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
              {t.pricing.navHome}
            </a>
            <a href="https://x.com/scoremyprompt" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t.pricing.navCommunity}
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t.pricing.heroTitle} <span className="text-gradient">{t.pricing.heroTitleHighlight}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            {t.pricing.heroSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          <div className="card flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{t.pricing.free}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">{t.pricing.freePeriod}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {freeFeatures.map((feature, idx) => (
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

            <button
              onClick={handleFreePlan}
              className="btn-secondary w-full font-semibold"
            >
              {t.pricing.freeCta}
            </button>
          </div>

          <div className="card flex flex-col relative overflow-hidden border-primary bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
              {t.pricing.badgeMostPopular}
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{t.pricing.pro}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-gray-400">{t.pricing.proPeriod}</span>
              </div>
              <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                {t.pricing.proTrial}
              </span>
            </div>

            <div className="space-y-3 mb-8 flex-grow">
              {proFeatures.map((feature, idx) => (
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

            <button
              onClick={handleProPlan}
              className="btn-primary w-full font-semibold"
            >
              {t.pricing.proCta}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t.pricing.faq}
          </h3>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="card">
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
