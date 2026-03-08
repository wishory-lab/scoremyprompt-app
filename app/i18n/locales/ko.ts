/**
 * Korean locale — 한국어 번역 파일.
 * Structure must match en.ts exactly.
 * TODO: Complete all translations before enabling Korean locale.
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
} as const;

export default ko;
