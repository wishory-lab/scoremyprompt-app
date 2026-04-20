/**
 * Korean locale — 한국어 번역 파일.
 * Structure must match en.ts exactly.
 */
import type { Locale } from './en';

const ko: Locale = {
  common: {
    appName: 'ScoreMyPrompt',
    tagline: '30초만에 AI 프롬프트 점수 받기',
  },

  nav: {
    templates: '템플릿',
    pricing: '요금제',
    dashboard: '대시보드',
    bulk: '대량 분석',
    signIn: '로그인',
    signOut: '로그아웃',
  },

  hero: {
    title: '더 나은 프롬프트를 작성하세요.',
    titleHighlight: '더 나은 AI 결과',
    subtitle: '프롬프트를 붙여넣으세요. 개선 방안과 함께 즉시 점수를 받으세요.',
    subtitleLine2: '무료, 가입 불필요.',
  },

  socialProof: {
    promptsScored: '분석된 프롬프트',
    findItHelpful: '유용하다고 답변',
    aiDimensions: 'AI 차원 분석',
  },

  form: {
    jobRoleLabel: '직무',
    promptLabel: '프롬프트',
    minChars: '최소 10자',
    scoreFree: '무료로 점수 받기',
    analyzing: 'AI 분석 중...',
    frameworkHint: '6가지 차원: 정확성 · 역할 · 출력 형식 · 미션 컨텍스트 · 구조 · 맞춤화',
  },

  examples: {
    title: '예시 프롬프트',
    marketingStrategy: '마케팅 전략',
    productDesign: '제품 디자인',
    financeAnalysis: '재무 분석',
  },

  trust: {
    instantResults: '즉시 결과',
    instantResultsDesc: '5초 이내에 상세한 AI 분석과 함께 점수를 받으세요',
    actionableFixes: '실행 가능한 개선안',
    actionableFixesDesc: '단순 점수가 아닌, 프롬프트를 강화할 구체적 개선 방안',
    benchmarkYourself: '벤치마크 비교',
    benchmarkYourselfDesc: '같은 분야 전문가들과 프롬프트 실력을 비교해 보세요',
  },

  result: {
    promptDimensions: 'PROMPT 차원 분석',
    dimensionSubtitle: 'PROMPT의 각 글자는 프롬프트 품질의 핵심 요소를 측정합니다.',
    yourScore: '내 점수',
    average: '{role} 평균',
    excellentThreshold: '우수 기준',
    strengths: '강점',
    improvements: '개선 영역',
    quickFix: '빠른 수정',
    quickFixSubtitle: '점수를 높이기 위해 지금 바로 할 수 있는 #1 개선:',
    fixAndRescore: '수정하고 다시 채점',
    moreFixesPro: '+{count}개 추가 개선안 (전체 분석)',
    shareYourScore: '점수 공유하기',
    shareSubtitle: '프롬프트 엔지니어링 실력을 보여주고 다른 전문가와 비교해 보세요.',
    analyzeAnother: '다른 프롬프트 분석',
    exportReport: '리포트 내보내기',
    downloadBadge: '배지 다운로드',
    challengeFriend: '친구에게 도전하기',
    linkCopied: '링크 복사됨!',
    copied: '복사됨!',
    downloadShareCard: '공유 카드 다운로드',
    signUpDimensions: '무료 가입으로 6가지 차원 모두 보기',
    wantToImprove: '개선하고 싶으신가요?',
    wantToImproveDesc: '점수 기반으로 가장 약한 차원을 강화할 수 있는 가이드입니다.',
    readGuide: '가이드 읽기',
  },

  validation: {
    promptEmpty: '분석할 프롬프트를 입력해 주세요.',
    promptTooShort: '프롬프트는 최소 10자 이상이어야 합니다.',
    emailEmpty: '이메일 주소를 입력해 주세요.',
    emailInvalid: '유효한 이메일 주소를 입력해 주세요.',
  },

  errors: {
    generic: '문제가 발생했습니다. 다시 시도해 주세요.',
    rateLimit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    analyzeFailed: '프롬프트 분석에 실패했습니다. 다시 시도해 주세요.',
    analyzeGeneric: '프롬프트 분석 중 오류가 발생했습니다. 다시 시도해 주세요.',
  },

  loading: {
    analyzing: 'AI 분석 중...',
    dashboard: '대시보드 로딩 중...',
    history: '히스토리 로딩 중...',
  },

  empty: {
    dashboardTitle: '아직 분석 결과가 없습니다',
    dashboardDesc: '첫 번째 프롬프트를 채점하여 진행 상황을 추적하세요.',
    historyTitle: '아직 분석 결과가 없습니다',
    historyDesc: '첫 번째 프롬프트를 채점하여 히스토리를 쌓아보세요.',
  },

  auth: {
    signInFeatures: '로그인하여 모든 기능을 해제하고 히스토리를 저장하세요.',
    signInDimensions: '무료 가입으로 6가지 차원 인사이트를 모두 확인하세요.',
    signInDashboard: '대시보드를 보려면 로그인하세요.',
    signInHistory: '분석 히스토리를 보려면 로그인하세요.',
    magicLinkHint: '비밀번호 불필요. 로그인 링크를 보내드립니다.',
    checkEmailTitle: '이메일을 확인하세요!',
    checkEmailDesc: '로그인 링크를 보내드렸습니다. 링크를 클릭하여 로그인하세요.',
  },

  exitIntent: {
    title: '잠깐 — 아직 가지 마세요!',
    subtitle: '아직 프롬프트를 채점하지 않으셨어요. 30초면 됩니다. 완전 무료입니다. 다른 전문가들과 AI 실력을 비교해 보세요.',
    promptsScored: '분석된 프롬프트',
    averageTime: '평균 소요 시간',
    noCardNeeded: '카드 불필요',
    noThanks: '괜찮습니다, 다음에',
  },

  community: {
    joinTitle: '커뮤니티에 참여하세요',
    joinSubtitle: '수천 명의 프롬프트 엔지니어와 연결하세요. 템플릿 공유, 베스트 프랙티스 학습, 최신 소식을 받아보세요.',
    follow: '@ScoreMyPrompt 팔로우',
  },

  // ─── Compare Page ─────────────────────────────────
  compare: {
    title: '프롬프트 비교',
    subtitle: '두 프롬프트를 나란히 분석하여 어떤 것이 더 높은 점수를 받는지 확인하세요.',
    promptA: '프롬프트 A',
    promptB: '프롬프트 B',
    compareButton: '비교하기',
    winner: '승자',
    tie: '무승부!',
    jobRoleLabel: '직무',
  },

  // ─── Bulk Analysis ────────────────────────────────
  bulk: {
    title: '대량 프롬프트 분석',
    subtitle: '여러 프롬프트를 한 번에 분석하세요. Pro 기능입니다.',
    addPrompt: '프롬프트 추가',
    analyzeAll: '전체 분석',
    promptCount: '{count}개 프롬프트',
    proRequired: '대량 분석을 사용하려면 Pro 구독이 필요합니다.',
  },

  // ─── Pricing Page ─────────────────────────────────
  pricing: {
    title: '심플하고 투명한 요금제',
    subtitle: '무료로 시작하세요. 더 필요할 때 업그레이드하세요.',
    free: '무료',
    pro: 'Pro',
    enterprise: 'Enterprise',
    perMonth: '/월',
    startTrial: '무료 체험 시작',
    currentPlan: '현재 플랜',
    faq: '자주 묻는 질문',
    navHome: '홈',
    navCommunity: '커뮤니티 →',
    heroTitle: '간단한',
    heroTitleHighlight: '요금제',
    heroSubtitle: '프롬프트 엔지니어링에 딱 맞는 플랜을 선택하세요. 숨겨진 비용 없음, 언제든 취소 가능합니다.',
    freePeriod: '/영구 무료',
    freeCta: '첫 프롬프트 채점하기',
    proPeriod: '/월',
    proTrial: '7일 무료 체험',
    proCta: '무료 체험 시작',
    badgeMostPopular: '가장 인기',
    freeFeature1: '하루 최대 10개 프롬프트 채점',
    freeFeature2: '6가지 PROMPT 차원 모두 확인',
    freeFeature3: '리더보드에서 동료와 비교',
    freeFeature4: '점수를 소셜 미디어에 공유',
    freeFeature5: '섹션 사이 광고 표시',
    freeFeature6: '히스토리 저장 불가',
    freeFeature7: 'AI 재작성 제안 불가',
    proFeature1: '무제한 채점 — 일일 한도 없음',
    proFeature2: 'AI가 더 높은 점수를 위해 프롬프트 재작성',
    proFeature3: '진행 상황 추적 및 과거 분석 재검토',
    proFeature4: '대량 모드로 한 번에 5개 프롬프트 채점',
    proFeature5: '깔끔하고 방해 없는 경험',
    proFeature6: '클라이언트용 세련된 HTML 리포트 내보내기',
    proFeature7: '필요할 때 우선 지원',
    proFeature8: 'API 접근 (2026년 2분기 출시 예정)',
    faq1Q: '취소할 수 있나요?',
    faq1A: '네, 언제든 구독을 취소하실 수 있습니다. 다음 결제 주기에는 청구되지 않습니다.',
    faq2Q: '어떤 결제 수단을 지원하나요?',
    faq2A: '주요 신용카드(Visa, Mastercard, American Express)와 Stripe를 통한 PayPal을 지원합니다.',
    faq3Q: '무료 체험이 끝나면 어떻게 되나요?',
    faq3A: '7일 후 구독이 자동으로 시작됩니다. 체험이 끝나기 전 언제든 취소하여 청구를 피할 수 있습니다.',
    faq4Q: '환불 정책이 있나요?',
    faq4A: '30일 환불 보장을 제공합니다. 만족하지 않으시면 지원팀에 문의해 전액 환불을 받으실 수 있습니다.',
  },

  // ─── Guide Page ───────────────────────────────────
  guide: {
    beginnerTag: '초보자 가이드',
    howToUse: '사용 방법',
    heroSubtitle: 'AI 프롬프트를 붙여넣으면 6가지 차원으로 분석해 점수와 개선 팁을 제공합니다. 처음이신 분도 30초면 시작할 수 있어요.',
    stepsHeading: '프롬프트 채점 4단계',
    stepLabel: '단계',
    step1Title: '프롬프트 작성 또는 붙여넣기',
    step1Desc: '채점하고 싶은 AI 프롬프트를 입력하세요. ChatGPT, Claude, Gemini 등 어떤 AI 모델이든 괜찮습니다.',
    step1Tip: '더 정확한 채점을 위해 직무를 선택하세요.',
    step2Title: 'PROMPT 점수 받기',
    step2Desc: 'AI가 6가지 차원에서 프롬프트를 분석해 0-100점 점수와 등급(S/A/B/C/D)을 제공합니다.',
    step2Tip: '각 차원은 프롬프트의 강점과 약점을 정확히 보여줍니다.',
    step3Title: '개선 팁 읽기',
    step3Desc: '프롬프트의 약점을 보완할 구체적이고 실행 가능한 제안을 받으세요.',
    step3Tip: '팁은 직무와 활용 사례에 맞게 맞춤 제공됩니다.',
    step4Title: '공유 또는 재시도',
    step4Desc: '점수 카드를 공유하거나 리더보드와 비교하고, 프롬프트를 수정해 더 높은 점수에 도전하세요.',
    step4Tip: 'Pro 사용자는 프롬프트를 대량으로 분석할 수 있습니다.',
    frameworkHeading: 'PROMPT 점수 프레임워크',
    frameworkDesc: '프롬프트는 6가지 차원으로 분석됩니다. "PROMPT"의 각 글자가 하나의 차원을 나타냅니다.',
    dimPrecisionName: '정확성',
    dimPrecisionDesc: '요청이 얼마나 구체적이고 명확한가요?',
    dimRoleName: '역할',
    dimRoleDesc: 'AI가 누구여야 하는지 프롬프트에 정의되어 있나요?',
    dimOutputName: '출력 형식',
    dimOutputDesc: '원하는 형식을 명시했나요?',
    dimMissionName: '미션 컨텍스트',
    dimMissionDesc: '배경과 목적이 명확한가요?',
    dimStructureName: '구조',
    dimStructureDesc: '논리적으로 잘 정리되어 있나요?',
    dimTailoringName: '맞춤화',
    dimTailoringDesc: '특정 대상에 맞게 맞춤화되어 있나요?',
    featuresHeading: '모든 기능',
    featuresSubtitle: 'ScoreMyPrompt에서 이용할 수 있는 모든 기능 한눈에 보기',
    featFreeBadge: '무료',
    featProBadge: 'Pro',
    featPromptAnalysisTitle: '프롬프트 분석',
    featPromptAnalysisDesc: 'AI 기반 채점으로 30초 안에 프롬프트 채점.',
    featTemplatesTitle: '템플릿',
    featTemplatesDesc: '직군별 고득점 프롬프트 템플릿.',
    featGuidesTitle: '가이드',
    featGuidesDesc: '프롬프트 엔지니어링 모범 사례에 대한 심층 아티클.',
    featLeaderboardTitle: '리더보드',
    featLeaderboardDesc: '내 프롬프트 순위를 다른 사람과 비교해 보세요.',
    featShareCardTitle: '공유 카드',
    featShareCardDesc: '소셜 미디어용 아름다운 공유 카드.',
    featDashboardTitle: '대시보드',
    featDashboardDesc: '시간에 따른 프롬프트 점수를 추적합니다.',
    featBulkTitle: '대량 분석',
    featBulkDesc: '여러 프롬프트를 한 번에 분석. (Pro)',
    featChallengeTitle: '챌린지 모드',
    featChallengeDesc: '다른 사람에게 내 점수를 이겨보라고 도전하세요.',
    featCompareTitle: '비교 모드',
    featCompareDesc: '두 프롬프트를 나란히 비교합니다.',
    gradeScaleHeading: '등급 기준',
    gradeSLabel: '탁월',
    gradeALabel: '우수',
    gradeBLabel: '양호',
    gradeCLabel: '보통',
    gradeDLabel: '개선 필요',
    gradePtsSuffix: '점',
    faqHeading: '자주 묻는 질문',
    faq1Q: '정말 무료인가요?',
    faq1A: '네! 기본 프롬프트 채점은 가입 없이 무료입니다. 대량 분석과 대시보드 같은 Pro 기능은 구독이 필요합니다.',
    faq2Q: '어떤 AI 모델에 사용할 수 있나요?',
    faq2A: 'ScoreMyPrompt는 모든 AI를 공통으로 평가합니다 — PROMPT 점수 프레임워크는 ChatGPT, Claude, Gemini, Copilot 등 어떤 AI에도 적용됩니다.',
    faq3Q: '점수는 어떻게 계산되나요?',
    faq3A: 'AI가 6가지 차원(정확성, 역할, 출력 형식, 미션 컨텍스트, 구조, 맞춤화)으로 평가합니다. 각 차원은 0-100점으로 채점되며, 이를 합산해 총점과 등급이 산출됩니다.',
    faq4Q: '제 프롬프트가 저장되나요?',
    faq4A: '프롬프트는 분석을 위해서만 처리됩니다. 비로그인 사용자의 프롬프트는 영구 저장되지 않습니다.',
    faq5Q: '한국어로 사용할 수 있나요?',
    faq5A: '네! ScoreMyPrompt는 한국어를 포함한 다양한 언어를 지원합니다. 상단 내비게이션에서 언어를 변경할 수 있습니다.',
    ctaReadyTitle: '시작할 준비 되셨나요?',
    ctaReadySubtitle: '무료, 회원가입 없이, 30초면 끝.',
    ctaButton: '내 프롬프트 채점하기',
  },

  // ─── Templates Page ───────────────────────────────
  templatesPage: {
    heroTitle: '80점 이상을 받는',
    heroTitleHighlight: '프롬프트 템플릿',
    heroSubtitle: '7가지 직무에 걸친 전문가가 엄선한 21개의 프롬프트 템플릿. 복사하고 맞춤화해 내 프롬프트를 채점해 보세요.',
    navGuides: '가이드',
    navScorePrompt: '프롬프트 채점하기 →',
    filterAll: '전체',
    templatesSuffix: '개 템플릿',
    useTemplate: '이 템플릿 사용하기',
    scoreIt: '채점하기',
    bottomCtaTitle: '내 프롬프트가 있나요?',
    bottomCtaSubtitle: '어떤 프롬프트든 붙여넣으면 몇 초 만에 6가지 차원의 PROMPT 점수를 받을 수 있습니다.',
    bottomCtaButton: '내 프롬프트 채점하기 →',
  },

  // ─── Result Page (additional) ─────────────────────
  resultPage: {
    percentileText: '이 프롬프트는 동일 {role} 직군 중 상위 {percentile}%에 해당합니다.',
  },

  // ─── Home Client (additional) ─────────────────────
  home: {
    examplesTitle: '예시 프롬프트',
    promptLabel: '프롬프트',
    scoreAriaLabel: '내 프롬프트 무료로 채점하기',
    pleaseWaitSeconds: '{seconds}초 기다려 주세요...',
    leftToday: '오늘 {count}회 남음',
    tooManyRequests: '요청이 너무 많습니다. {seconds}초 후 다시 시도해 주세요.',
  },

  // ─── Challenge Page ───────────────────────────────
  challenge: {
    title: '프롬프트 챌린지',
    subtitle: '이 점수를 이길 수 있나요?',
    acceptChallenge: '챌린지 수락',
    yourTurn: '당신 차례',
    beatScore: '{score}점을 넘어보세요!',
  },

  // ─── Quality Indicator ────────────────────────────
  quality: {
    weak: '기본',
    moderate: '양호',
    strong: '상세',
    tipContext: '컨텍스트 또는 역할을 추가하세요',
    tipOutput: '출력 형식을 지정하세요',
    tipDetail: '더 자세히 작성하세요 (100자 이상)',
    tipObjective: '명확한 목표를 명시하세요',
  },

  // ─── Rate Limit ───────────────────────────────────
  rateLimit: {
    remaining: '오늘 {count}회 남음',
    waitMessage: '{seconds}초 대기 중...',
    countdown: '{time} 후 다시 시도',
  },

  // ─── CTA ─────────────────────────────────────────
  cta: {
    title: '더 나은 프롬프트를 작성할 준비가 되셨나요?',
    subtitle: 'ScoreMyPrompt로 AI 활용 능력을 향상시키는 수천 명의 전문가와 함께하세요.',
    button: '프롬프트 채점하기 — 무료',
  },

  // ─── Footer ───────────────────────────────────────
  footer: {
    privacy: '개인정보처리방침',
    terms: '이용약관',
    pricing: '요금제',
    guides: '가이드',
    copyright: '© {year} ScoreMyPrompt. All rights reserved.',
  },
} as const;

export default ko;
