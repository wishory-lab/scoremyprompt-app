'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n';
import { useToast } from '@/app/components/Toast';
import { FAQ_ITEMS } from './data';
import Footer from '../components/Footer';
import TrialBanner from '../components/TrialBanner';

export default function PricingPage() {
  const router = useRouter();
  const { showToast } = useToast();
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
      showToast('결제 시작에 실패했습니다. 다시 시도해주세요.', 'error');
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

        {/* Pro Trial Banner */}
        <div className="mb-10">
          <TrialBanner />
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

        {/* ─── Pro Feature Highlights ─── */}
        <div className="mb-24">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            {t.pricingDetail.proHighlightTitle}{' '}
            <span className="text-gradient">{t.pricingDetail.proHighlightTitleAccent}</span>
          </h3>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            {t.pricingDetail.proHighlightSubtitle}
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                ),
                title: t.pricingDetail.highlight1Title,
                desc: t.pricingDetail.highlight1Desc,
                color: 'from-purple-500/20 to-purple-600/10',
                iconColor: 'text-purple-400',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: t.pricingDetail.highlight2Title,
                desc: t.pricingDetail.highlight2Desc,
                color: 'from-blue-500/20 to-blue-600/10',
                iconColor: 'text-blue-400',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: t.pricingDetail.highlight3Title,
                desc: t.pricingDetail.highlight3Desc,
                color: 'from-emerald-500/20 to-emerald-600/10',
                iconColor: 'text-emerald-400',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ),
                title: t.pricingDetail.highlight4Title,
                desc: t.pricingDetail.highlight4Desc,
                color: 'from-amber-500/20 to-amber-600/10',
                iconColor: 'text-amber-400',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`card bg-gradient-to-br ${item.color} border-border/50 hover:border-primary/30 transition-all duration-300`}
              >
                <div className={`${item.iconColor} mb-4`}>{item.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Free vs Pro Comparison Table ─── */}
        <div className="mb-24">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            {t.pricingDetail.comparisonTitle}{' '}
            <span className="text-gradient">{t.pricingDetail.comparisonTitleAccent}</span>
          </h3>

          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-gray-400 font-medium p-4 sm:p-5">{t.pricingDetail.compFeature}</th>
                  <th className="text-center text-gray-400 font-medium p-4 sm:p-5 w-28 sm:w-36">{t.pricingDetail.compFree}</th>
                  <th className="text-center font-medium p-4 sm:p-5 w-28 sm:w-36 bg-primary/5 text-primary">{t.pricingDetail.compPro}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: t.pricingDetail.compRow1, free: t.pricingDetail.compRow1Free, pro: t.pricingDetail.compRow1Pro, proHighlight: true },
                  { feature: t.pricingDetail.compRow2, free: t.pricingDetail.compRow2Both, pro: t.pricingDetail.compRow2Both, proHighlight: false },
                  { feature: t.pricingDetail.compRow3, free: '✕', pro: '✓', proHighlight: true },
                  { feature: t.pricingDetail.compRow4, free: t.pricingDetail.compRow4Free, pro: t.pricingDetail.compRow4Pro, proHighlight: true },
                  { feature: t.pricingDetail.compRow5, free: t.pricingDetail.compRow5Free, pro: t.pricingDetail.compRow5Pro, proHighlight: true },
                  { feature: t.pricingDetail.compRow6, free: '✕', pro: '✓', proHighlight: true },
                  { feature: t.pricingDetail.compRow7, free: t.pricingDetail.compRow7Free, pro: t.pricingDetail.compRow7Pro, proHighlight: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-0">
                    <td className="text-gray-300 p-4 sm:p-5">{row.feature}</td>
                    <td className="text-center text-gray-500 p-4 sm:p-5">{row.free}</td>
                    <td className={`text-center p-4 sm:p-5 bg-primary/5 ${row.proHighlight ? 'text-primary font-semibold' : 'text-gray-300'}`}>
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Testimonials ─── */}
        <div className="mb-24">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            {t.pricingDetail.testimonialsTitle}{' '}
            <span className="text-gradient">{t.pricingDetail.testimonialsTitleAccent}</span>
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { text: t.pricingDetail.testimonial1, author: t.pricingDetail.testimonial1Author, avatar: 'M' },
              { text: t.pricingDetail.testimonial2, author: t.pricingDetail.testimonial2Author, avatar: 'R' },
              { text: t.pricingDetail.testimonial3, author: t.pricingDetail.testimonial3Author, avatar: 'C' },
            ].map((review, idx) => (
              <div key={idx} className="card flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                    {review.avatar}
                  </div>
                  <span className="text-gray-400 text-sm">{review.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-24">
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

        {/* ─── Bottom CTA ─── */}
        <div className="text-center card bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 py-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            {t.pricingDetail.bottomCtaTitle}{' '}
            <span className="text-gradient">{t.pricingDetail.bottomCtaTitleAccent}</span>
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            {t.pricingDetail.bottomCtaSubtitle}
          </p>
          <button
            onClick={handleProPlan}
            className="btn-primary text-lg px-10 py-4 font-semibold"
          >
            {t.pricingDetail.bottomCtaButton}
          </button>
          <p className="text-gray-500 text-xs mt-4">
            {t.pricingDetail.bottomCtaNote}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
