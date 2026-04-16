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

  // ─── Home Entry ───────────────────────────────────
  homeEntry: {
    tagline: 'AI를 평가하고 직접 만들어 보세요',
    scorePrompt: { title: '프롬프트 채점', subtitle: '30초 · 무료', cta: '시작하기' },
    scoreSetup: { title: 'AI 설정 채점', subtitle: '신규 · 무료', cta: '시작하기' },
    buildSetup: { title: 'AI 설정 구축', subtitle: 'Pro · 2분', cta: '시작하기' },
  },

  // ─── Harness (AI Setup Scoring) ──────────────────
  harness: {
    pageTitle: 'AI 설정 점수 받기',
    pageSubtitle: 'CLAUDE.md 파일을 붙여넣거나 AI 에이전트 설정을 설명해 주세요. 6가지 차원으로 HARNES 점수를 확인할 수 있습니다.',
    inputLabel: 'AI 설정 내용 (CLAUDE.md 또는 설명)',
    inputPlaceholder: 'CLAUDE.md 파일을 붙여넣거나 현재 AI 설정을 설명해 주세요…',
    minChars: '최소 20자',
    submitCta: '내 설정 채점하기 — 무료',
    submitting: 'HARNES로 분석 중…',
    learnMoreTitle: 'HARNES란?',
    dimensions: {
      H: 'Hierarchy — 폴더 구조',
      A: 'Agents — 서브 에이전트 역할',
      R: 'Routing — 조건부 라우팅 규칙',
      N: 'Norms — 브랜드 및 톤앤매너',
      E: 'Extensions — 외부 도구 연동',
      S: 'SafeOps — 운영 절차 및 권한',
    },
    result: {
      tier: {
        Elite: 'Elite',
        Proficient: 'Proficient',
        Developing: 'Developing',
        NeedsHarness: 'Needs a Harness',
      },
      tierMsg: {
        Elite: '실제 업무에 바로 투입 가능한 수준입니다.',
        Proficient: '기본기는 탄탄합니다. 확장 기능을 보강해 보세요.',
        Developing: 'Harness Builder로 한 단계 더 발전시켜 보세요.',
        NeedsHarness: 'Builder에서 첫 설정부터 차근차근 만들어 보세요.',
      },
      feedbackTitle: '개선이 필요한 영역',
      quickWinsTitle: '바로 적용할 수 있는 개선안',
      shareCta: '점수 공유하기',
      buildCta: 'Pro로 더 나은 설정 만들기 →',
      rescoreCta: '다른 설정 채점하기',
    },
    promptCta: '이제 AI 설정도 채점해 보세요 →',
  },

  // ─── Builder ─────────────────────────────────────
  builder: {
    pageTitle: 'AI 설정 직접 만들기',
    nextCta: '다음 →',
    backCta: '← 이전',
    generateCta: '내 harness 생성하기',
    generating: '생성 중…',
    result: {
      title: 'harness가 준비되었습니다',
      expiresNotice: '{min}분 안에 다운로드해 주세요 — 개인정보 보호를 위해 링크가 만료됩니다.',
      downloadCta: 'ZIP 다운로드',
      vscodeCta: 'VS Code에서 열기',
      videoGuideCta: '60초 영상 가이드',
      previewTitle: '파일 미리보기',
      shareBonusTitle: '이번 달 무료 빌드를 한 번 더 받고 싶으신가요?',
      shareBonusBody: '어떤 SNS에든 harness 링크를 공유해 주시면 이번 달 빌드 1회가 추가로 적립됩니다.',
      shareCta: '공유하고 +1 빌드 받기',
      shareClaimed: '✓ 보너스 적립 완료',
      shareError: '공유 내역을 확인하지 못했습니다 — 다시 시도해 주세요.',
      buildAnotherCta: '새로 만들기',
      scoreItCta: '이 설정 채점하기',
    },
  },
} as const;

export default ko;
