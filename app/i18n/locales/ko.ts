/**
 * Korean locale — 한국어 번역 파일.
 * Structure must match en.ts exactly.
 */
import type { PartialLocale } from './en';

const ko: PartialLocale = {
  common: {
    appName: 'ScoreMyPrompt',
    tagline: '30초만에 AI 프롬프트 점수 받기',
  },

  nav: {
    home: '홈',
    templates: '템플릿',
    pricing: '요금제',
    dashboard: '대시보드',
    history: '히스토리',
    bulk: '대량 분석',
    signIn: '로그인',
    signOut: '로그아웃',
    upgradePremium: '프리미엄으로 업그레이드',
    premiumPlan: '프리미엄 플랜',
    freePlan: '무료 플랜',
    articles: '아티클',
    changelog: '변경 이력',
  },

  hero: {
    title: '더 나은 프롬프트를 작성하세요.',
    titleHighlight: '더 나은 AI 결과',
    titleEnd: '를 얻으세요.',
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
    promptPlaceholder: 'AI 프롬프트를 붙여넣고 무료 점수와 개선 팁을 받으세요...',
    minChars: '최소 10자',
    scoreFree: '무료로 점수 받기',
    analyzing: 'AI 분석 중...',
    frameworkHint: '6가지 차원: 정확성 · 역할 · 출력 형식 · 미션 컨텍스트 · 구조 · 맞춤화',
    waitMessage: '{seconds}초 대기 중...',
    leftToday: '오늘 {count}회 남음',
  },

  // ─── Job Roles ──────────────────────────────────
  jobRoles: {
    Marketing: '마케팅',
    Design: '디자인',
    Product: '기획',
    Finance: '재무',
    Freelance: '프리랜서',
    Engineering: '개발',
    Other: '기타',
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
    percentileText: '당신의 프롬프트는 다른 {role} 전문가 대비 상위 {percentile}%에 해당합니다.',
    signUpDimensions: '무료 가입으로 6가지 차원 모두 보기',
    wantToImprove: '개선하고 싶으신가요?',
    wantToImproveDesc: '점수 기반으로 가장 약한 차원을 강화할 수 있는 가이드입니다.',
    improveDimension: '{dimension} 개선하기',
    readGuide: '가이드 읽기',
    aiRewriteSuggestion: 'AI 리라이트 제안',
    hideRewrite: '숨기기',
    showRewrite: '리라이트 보기',
    copyToClipboard: '클립보드에 복사',
    rewriteHint: 'AI 기반 제안으로 프롬프트를 개선하는 방법을 확인하세요.',
    unlockWithPro: 'Pro로 잠금 해제',
    bulkAnalysis: '대량 분석',
    exporting: '내보내는 중...',
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
    signInTitle: 'ScoreMyPrompt 로그인',
    sending: '전송 중...',
    sendMagicLink: '매직 링크 보내기',
    or: '또는',
    continueWithGoogle: 'Google로 계속하기',
    close: '닫기',
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

  // ─── Demo ────────────────────────────────────────
  demo: {
    title: '직접 확인해 보세요',
    subtitle: '예시를 클릭하면 PROMPT 점수가 어떻게 작동하는지 볼 수 있습니다',
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
    analysisResult: '분석 결과',
    promptDimensions: 'PROMPT 차원',
    tryYourOwn: '내 프롬프트 분석하기',
    wantToAnalyze: '내 프롬프트를 분석해 보시겠어요?',
    clickExample: '위의 예시를 클릭하거나 위로 스크롤하여 직접 분석해 보세요',
    grade: '등급 {grade}',
  },

  // ─── Waitlist / Newsletter ──────────────────────
  waitlist: {
    title: '매주 AI 활용 능력을 높이세요',
    subtitle: '주간 최고 프롬프트, 새 AI 도구, 실용적인 팁을 보내드립니다.',
    subscribing: '구독 중...',
    subscribe: '구독하기',
    noSpam: '스팸 없음. 언제든 구독 취소 가능.',
    successTitle: '구독 완료!',
    successDesc: '이번 주 최고 프롬프트를 확인하고 AI 활용 능력을 향상시켜 보세요.',
    watchEmail: '다음 이메일에서 확인하세요:',
    weeklyTips: '매주 월요일 새로운 프롬프트 레시피와 팁',
    joinCommunity: '커뮤니티 참여',
    subscribers: '구독자',
    weeklyPrompts: '주간 프롬프트',
    spamFree: '스팸 없음',
    emailEmpty: '이메일 주소를 입력해 주세요',
    emailInvalid: '유효한 이메일 주소를 입력해 주세요',
    subscribeFailed: '구독에 실패했습니다. 다시 시도해 주세요.',
    genericError: '문제가 발생했습니다. 다시 시도해 주세요.',
  },

  // ─── Leaderboard ──────────────────────────────────
  leaderboard: {
    title: '주간 리더보드',
    subtitle: '이번 주 최고 프롬프트 점수',
    yourBestScore: '내 최고 점수',
    signInRanking: '로그인하여 순위를 확인하세요',
    loading: '리더보드 로딩 중...',
    loadFailed: '리더보드를 불러오지 못했습니다',
    loadFailedDesc: '리더보드를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.',
    retry: '다시 시도',
    noEntries: '아직 항목이 없습니다.',
    noEntriesDesc: '첫 번째로 프롬프트를 제출하고 1위를 차지하세요!',
    viewRecipe: '레시피 보기',
    comingSoon: '곧 공개',
    communityTitle: '최고의 프롬프트를 공유하는 커뮤니티에 참여하세요',
    communitySubtitle: '리더보드에 이름을 올리고 싶으신가요?',
    startAnalyzing: '프롬프트 분석 시작하기',
    pageTitle: '프롬프트 리더보드',
    pageSubtitle: '커뮤니티와 프롬프트 실력을 비교해 보세요. 최고 점수자는 배지와 인정을 받습니다.',
    ctaTitle: '여기에 이름을 올리고 싶으신가요?',
    ctaSubtitle: '프롬프트를 채점하고 리더보드에 참여하세요. 무료, 가입 불필요.',
    ctaButton: '프롬프트 채점하기',
    all: '전체',
  },

  // ─── Footer ───────────────────────────────────────
  footer: {
    privacy: '개인정보처리방침',
    terms: '이용약관',
    pricing: '요금제',
    guides: '가이드',
    articles: '아티클',
    changelog: '변경 이력',
    security: '보안 정책',
    copyright: '© {year} ScoreMyPrompt. All rights reserved.',
  },

  // ─── Analysis Loading ─────────────────────────────
  analysisLoading: {
    step1Label: '프롬프트 읽는 중',
    step1Detail: '핵심 요소와 구조 파악 중',
    step2Label: '6가지 PROMPT 차원 분석 중',
    step2Detail: '정확성 · 역할 · 출력 · 미션 · 구조 · 맞춤화',
    step3Label: '점수 계산 중',
    step3Detail: '백분위 및 등급 산출 중',
    step4Label: '맞춤 피드백 생성 중',
    step4Detail: '실행 가능한 개선 제안 생성 중',
    tip1Text: '상위 점수 프롬프트의 85%가 구체적인 역할(Role)을 포함합니다.',
    tip1Category: '알고 계셨나요?',
    tip2Text: '출력 형식을 추가하면 점수가 15점 올라갈 수 있습니다.',
    tip2Category: '프로 팁',
    tip3Text: '프롬프트 평균 점수는 62점입니다. 이길 수 있나요?',
    tip3Category: '재미있는 사실',
    tip4Text: '컨텍스트가 풍부한 프롬프트는 미션 컨텍스트 점수가 2배 높습니다.',
    tip4Category: '프로 팁',
    tip5Text: '구조가 명확한 프롬프트는 AI가 따르기 3배 쉽습니다.',
    tip5Category: '리서치',
  },

  // ─── Onboarding Tour ──────────────────────────────
  onboarding: {
    step1Title: '프롬프트를 붙여넣으세요',
    step1Desc: 'ChatGPT, Claude, Gemini 등 어떤 AI 프롬프트든 여기에 넣으세요. 6가지 차원으로 점수를 매겨 드립니다.',
    step2Title: '직무를 선택하세요',
    step2Desc: '같은 분야 전문가들과 프롬프트를 벤치마크하기 위해 직무를 선택해 주세요.',
    step3Title: '점수를 확인하세요',
    step3Desc: '이 버튼을 누르면 5초 이내에 PROMPT 점수를 받을 수 있습니다 — 완전 무료, 가입 불필요.',
    skipTour: '투어 건너뛰기',
    next: '다음',
    gotIt: '알겠어요!',
  },

  // ─── Dashboard ────────────────────────────────────
  dashboard: {
    title: '대시보드',
    tryAgain: '다시 시도',
    totalAnalyses: '총 분석 횟수',
    bestScore: '최고 점수',
    averageScore: '평균 점수',
    mostUsedRole: '가장 많이 사용한 직무',
    scoreTrend: '점수 추이 (최근 14일)',
    recentAnalyses: '최근 분석',
    viewAll: '전체 보기 →',
    scored: '{score}/100점',
    proSubscription: 'Pro 구독',
    proSubscriptionDesc: '구독 및 결제 설정을 관리하세요.',
    manageSubscription: '구독 관리',
    apiKey: 'API 키',
    apiKeyDesc: 'API 접근은 곧 제공됩니다. ScoreMyPrompt를 앱에 통합할 수 있게 됩니다.',
    upgradeToPro: 'Pro로 업그레이드',
    upgradeToProDesc: '무제한 분석, AI 리라이트 제안 등을 이용하세요.',
    viewPlans: '요금제 보기',
    scoreAPrompt: '프롬프트 채점하기',
  },

  // ─── History ──────────────────────────────────────
  history: {
    title: '분석 히스토리',
    totalAnalyses: '{total}건 분석',
    jobRole: '직무',
    grade: '등급',
    sortBy: '정렬',
    newest: '최신순',
    oldest: '오래된순',
    highestScore: '높은 점수순',
    lowestScore: '낮은 점수순',
    gradeLabel: '등급 {grade}',
    promptDimensions: 'PROMPT 차원',
    reAnalyze: '다시 분석',
    loadMore: '더 보기',
    all: '전체',
  },

  // ─── Pricing Detail ───────────────────────────────
  pricingDetail: {
    heroTitle: '심플한',
    heroTitleHighlight: '요금제',
    heroSubtitle: '프롬프트 엔지니어링에 완벽한 플랜을 선택하세요. 숨겨진 비용 없음, 언제든 해지 가능.',
    home: '홈',
    community: '커뮤니티 →',
    freeName: '무료',
    freePrice: '$0',
    freePeriod: '/영구',
    freeCta: '첫 프롬프트 채점하기',
    freeFeature1: '하루 최대 10개 프롬프트 채점',
    freeFeature2: '6가지 PROMPT 차원 모두 확인',
    freeFeature3: '리더보드에서 동료와 비교',
    freeFeature4: 'SNS에 점수 공유',
    freeFeature5: '섹션 사이 광고 표시',
    freeFeature6: '히스토리 저장 불가',
    freeFeature7: 'AI 리라이트 제안 불가',
    proName: 'Pro',
    proPrice: '$9.99',
    proPeriod: '/월',
    proBadge: '가장 인기',
    proTrial: '7일 무료 체험',
    proCta: '무료 체험 시작',
    proFeature1: '무제한 채점 — 일일 한도 없음',
    proFeature2: 'AI가 더 높은 점수를 위해 프롬프트를 리라이트',
    proFeature3: '진행 상황 추적 및 과거 분석 재확인',
    proFeature4: '대량 모드로 한 번에 5개 프롬프트 채점',
    proFeature5: '광고 없는 깔끔한 경험',
    proFeature6: '고객용 HTML 리포트 내보내기',
    proFeature7: '필요할 때 우선 지원',
    proFeature8: 'API 접근 (2026년 2분기 예정)',
    faqTitle: '자주 묻는 질문',
  },

  // ─── Compare ──────────────────────────────────────
  compareDetail: {
    heroSubtitle: '두 프롬프트를 나란히 붙여넣어 어떤 것이 더 높은 점수를 받는지 확인하세요',
    jobRoleLabel: '직무 (두 프롬프트 공통)',
    prompt1: '프롬프트 1',
    prompt2: '프롬프트 2',
    placeholder1: '첫 번째 프롬프트를 붙여넣으세요...',
    placeholder2: '두 번째 프롬프트를 붙여넣으세요...',
    charLimit: ' / 5,000',
    comparing: '비교 중...',
    compare: '비교하기',
    winner: '✓ 승자',
    scoreDifference: '점수 차이',
    pointsPlus: '+{delta}점',
    pointsMinus: '-{delta}점',
    tied: '동점',
    dimensions: '차원 비교',
    wantDeeper: '더 깊은 분석을 원하시나요?',
    wantDeeperDesc: '전체 분석기를 사용하여 개별 프롬프트에 대한 상세 피드백과 리라이트 제안을 받으세요.',
    tryFullAnalyzer: '전체 분석기 사용 →',
  },

  // ─── Challenge ────────────────────────────────────
  challengeDetail: {
    title: '챌린지 모드',
    points: '점',
    gradeLabel: '등급 {grade} — {label}',
    canYouBeat: '{score}점을 이길 수 있나요?',
    scoreDisplay: '{score}/100',
    subtitle: '최고의 프롬프트를 붙여넣고 더 높은 점수를 차지해 보세요.',
    takeChallenge: '챌린지 도전하기',
    scoringDimensions: '6가지 채점 차원',
    aiPoweredAnalysis: 'AI 기반 분석',
    noSignupRequired: '가입 불필요',
    loadingChallenge: '챌린지 로딩 중...',
  },

  // ─── Bulk ─────────────────────────────────────────
  bulkDetail: {
    signInMessage: '여러 프롬프트를 한 번에 분석하려면 로그인하세요.',
    signIn: '로그인',
    proRequired: '이 기능은 Pro 구독이 필요합니다.',
    upgradeToPro: 'Pro로 업그레이드',
    subtitle: '최대 5개 프롬프트를 한 번에 분석하세요',
    promptN: '프롬프트 {n}',
    remove: '삭제',
    placeholder: '프롬프트를 입력하세요 (최소 10자)...',
    addPrompt: '+ 프롬프트 추가',
    analyzing: '{count}개 프롬프트 분석 중...',
    analyzeCount: '{count}개 프롬프트 분석',
    results: '결과',
    strengths: '강점',
    improvements: '개선 영역',
  },

  // ─── Cookie Consent ───────────────────────────────
  cookie: {
    message: '쿠키와 분석을 사용하여 경험을 개선하고 도구 사용 방식을 파악합니다. 필수 쿠키는 항상 활성화됩니다. 분석을 허용하거나 필수 쿠키만 사용할 수 있습니다.',
    acceptAll: '모두 수락',
    essentialOnly: '필수만',
    privacyPolicy: '개인정보처리방침',
  },

  // ─── Upgrade Banner ───────────────────────────────
  upgrade: {
    usedAll: '오늘의 분석 횟수를 모두 사용하셨습니다.',
    usedSome: '오늘 {limit}회 중 {used}회를 사용하셨습니다.',
    signUpBonus: '무료 가입으로 10 보너스 크레딧 + 광고 시청으로 추가 획득!',
    watchAdGuest: '광고를 시청하여 1회 추가 분석을 받거나, 업그레이드하여 광고 없이 이용하세요.',
    upgradeHint: '🎉 5월 이벤트: 프리미엄 업그레이드 시 무제한 분석! 광고 없이 이용하세요.',
    signUpFree: '무료 가입 (+10 크레딧)',
    watchAd: '광고 시청 (+1 크레딧)',
    upgradePremium: '프리미엄으로 업그레이드',
  },

  // ─── Rewarded Ad ──────────────────────────────────
  rewardedAd: {
    watchTitle: '광고 시청으로 +1 분석',
    loadingAd: '광고 로딩 중...',
    supportMessage: '이 광고를 시청하여 SMP를 응원해 주세요',
    granting: '크레딧 지급 중...',
    claimCredit: '+1 분석 크레딧 받기',
    waitClaim: '{countdown}초 후 크레딧 받기',
    skipReward: '보상 건너뛰기',
    cancel: '취소',
  },

  // ─── Ad Banner ────────────────────────────────────
  ad: {
    removeAds: '광고 제거 → Pro 이용',
  },
} as const;

export default ko;
