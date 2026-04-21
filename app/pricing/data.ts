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
    name: '게스트',
    price: '무료',
    priceDetail: '가입 불필요',
    description: '계정 없이 바로 사용해 보세요',
    features: [
      { text: '하루 2회 분석', included: true },
      { text: 'PROMPT 점수 (6가지 차원)', included: true },
      { text: '기본 개선 팁', included: true },
      { text: '광고 없는 경험', included: true },
      { text: '자동 리라이트 제안', included: false },
      { text: '분석 히스토리', included: false },
      { text: 'HTML 리포트 내보내기', included: false },
    ],
    cta: '분석 시작하기',
  },
  {
    id: 'free',
    name: '무료',
    price: '무료',
    priceDetail: '가입하면 더 많은 기능',
    description: '가입 시 보너스 크레딧 10개 + 광고 시청으로 추가 분석',
    features: [
      { text: '하루 3회 분석 (기본)', included: true },
      { text: '가입 시 보너스 크레딧 10개', included: true },
      { text: '광고 시청으로 추가 분석', included: true },
      { text: 'PROMPT 점수 (6가지 차원)', included: true },
      { text: '기본 개선 팁', included: true },
      { text: '분석 히스토리 (최근 30일)', included: true },
      { text: 'HTML 리포트 내보내기', included: true },
      { text: '자동 리라이트 제안', included: false },
      { text: '대량 분석', included: false },
    ],
    cta: '무료 가입하기',
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: '$4.99',
    priceDetail: '/월',
    introPrice: '$2.99',
    introMonths: 3,
    description: '파워 유저를 위한 — 광고 없음, 더 많은 분석',
    highlighted: true,
    features: [
      { text: '하루 33회 분석', included: true },
      { text: '광고 완전 제거', included: true },
      { text: '자동 리라이트 제안', included: true },
      { text: '전체 분석 히스토리', included: true },
      { text: 'HTML 리포트 내보내기', included: true },
      { text: '대량 분석 (최대 5개)', included: true },
      { text: '비교 모드', included: true },
      { text: '우선 지원', included: true },
    ],
    cta: '$2.99/월로 시작하기',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '무료 플랜은 어떻게 작동하나요?',
    answer: '매일 3회 무료 분석이 제공됩니다. 다 쓰면 짧은 광고(15초)를 시청하여 추가 분석 1회를 획득할 수 있습니다. 영원히 무료입니다!',
  },
  {
    question: '보너스 크레딧이 무엇인가요?',
    answer: '가입 시 만료 없는 보너스 크레딧 10개를 받습니다. 매일 제공되는 3회 무료 분석이 소진된 후, 광고를 보기 전에 보너스 크레딧이 먼저 사용됩니다.',
  },
  {
    question: '프리미엄을 해지할 수 있나요?',
    answer: '네, 언제든 해지 가능합니다. 결제 기간이 끝날 때까지 프리미엄을 이용하고, 이후 무료 플랜으로 전환됩니다.',
  },
  {
    question: '어떤 결제 수단을 지원하나요?',
    answer: 'Stripe를 통해 주요 신용카드(Visa, Mastercard, American Express)를 모두 지원합니다.',
  },
  {
    question: '할인 가격은 어떻게 적용되나요?',
    answer: '신규 프리미엄 가입자는 처음 3개월간 월 $2.99에 이용할 수 있습니다. 이후 월 $4.99가 적용됩니다. 언제든 해지 가능합니다.',
  },
  {
    question: '무료 체험이 있나요?',
    answer: '네! 프리미엄에는 7일 무료 체험이 포함됩니다. 체험 기간이 끝날 때까지 요금이 청구되지 않으며, 이후 $2.99/월 할인 가격이 적용됩니다.',
  },
  {
    question: '환불 정책이 있나요?',
    answer: '30일 환불 보장을 제공합니다. 만족하지 못하시면 고객 지원에 연락하여 전액 환불을 받으실 수 있습니다.',
  },
];
