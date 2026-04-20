export interface FaqItem {
  question: string;
  answer: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceDetail: string;
  /** Introductory discount price (e.g., "$2.99") */
  introPrice?: string;
  /** How many months the intro price lasts */
  introMonths?: number;
  description: string;
  features: PlanFeature[];
  cta: string;
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'guest',
    name: 'Guest',
    price: 'Free',
    priceDetail: 'No sign-up needed',
    description: 'Try it out — no account required',
    features: [
      { text: '2 analyses per day', included: true },
      { text: 'PROMPT Score (6 dimensions)', included: true },
      { text: 'Basic improvement tips', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Auto-Rewrite suggestions', included: false },
      { text: 'Analysis history', included: false },
      { text: 'PDF export', included: false },
    ],
    cta: 'Start Analyzing',
  },
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    priceDetail: 'Sign up to unlock more',
    description: '10 bonus credits on sign-up + earn more with ads',
    features: [
      { text: '3 analyses per day (base)', included: true },
      { text: '10 bonus credits on sign-up', included: true },
      { text: 'Watch ads for extra analyses', included: true },
      { text: 'PROMPT Score (6 dimensions)', included: true },
      { text: 'Basic improvement tips', included: true },
      { text: 'Analysis history (last 30 days)', included: true },
      { text: 'Auto-Rewrite suggestions', included: false },
      { text: 'PDF export', included: false },
      { text: 'Bulk analysis', included: false },
    ],
    cta: 'Sign Up Free',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    priceDetail: '/month',
    introPrice: '$2.99',
    introMonths: 3,
    description: 'For power users — no ads, more analyses',
    highlighted: true,
    features: [
      { text: '33 analyses per day', included: true },
      { text: 'Zero ads', included: true },
      { text: 'Auto-Rewrite suggestions', included: true },
      { text: 'Full analysis history', included: true },
      { text: 'PDF export', included: true },
      { text: 'Bulk analysis (up to 5)', included: true },
      { text: 'Compare mode', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start with $2.99/mo',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does the free plan work?',
    answer: 'You get 3 free analyses every day. When you run out, watch a short ad (15 seconds) to earn 1 more analysis. It\'s free forever!',
  },
  {
    question: 'What are bonus credits?',
    answer: 'When you sign up, you receive 10 bonus credits that never expire. These are used after your daily 3 free analyses run out, before you need to watch ads.',
  },
  {
    question: 'Can I cancel Premium?',
    answer: 'Yes, cancel anytime. You\'ll keep Premium access until the end of your billing period, then revert to the Free plan.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe.',
  },
  {
    question: 'How does the introductory pricing work?',
    answer: 'New Premium subscribers pay just $2.99/month for the first 3 months. After that, it\'s $4.99/month. You can cancel anytime.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Premium comes with a 7-day free trial. No charge until the trial ends, then the $2.99/mo intro price kicks in.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'We offer a 30-day money-back guarantee. Contact support for a full refund if you\'re not satisfied.',
  },
];
