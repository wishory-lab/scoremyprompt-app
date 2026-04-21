/**
 * 앱 전체에서 일관된 마이크로카피를 위한 중앙 집중식 UI 메시지.
 * 모든 사용자 대면 문자열은 여기에서 참조해야 합니다.
 */

// ─── 유효성 검사 ─────────────────────────────────────────────────────
export const VALIDATION = {
  PROMPT_EMPTY: '분석할 프롬프트를 입력해 주세요.',
  PROMPT_TOO_SHORT: '프롬프트는 최소 10자 이상이어야 합니다.',
  EMAIL_EMPTY: '이메일 주소를 입력해 주세요.',
  EMAIL_INVALID: '올바른 이메일 주소를 입력해 주세요.',
  BOTH_PROMPTS_REQUIRED: '두 개의 프롬프트를 모두 입력해 주세요.',
  BOTH_PROMPTS_MIN_LENGTH: '두 프롬프트 모두 최소 10자 이상이어야 합니다.',
  BULK_MIN_PROMPT: '최소 하나의 프롬프트를 입력해 주세요 (각 최소 10자).',
} as const;

// ─── 에러 ─────────────────────────────────────────────────────────
export const ERRORS = {
  GENERIC: '문제가 발생했습니다. 다시 시도해 주세요.',
  RATE_LIMIT: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  ANALYZE_FAILED: '프롬프트 분석에 실패했습니다. 다시 시도해 주세요.',
  ANALYZE_GENERIC: '프롬프트 분석 중 오류가 발생했습니다. 다시 시도해 주세요.',
  COMPARE_FAILED: '프롬프트 분석에 실패했습니다. 다시 시도해 주세요.',
  COMPARE_GENERIC: '프롬프트 비교 중 오류가 발생했습니다. 다시 시도해 주세요.',
  BULK_FAILED: '분석에 실패했습니다. 다시 시도해 주세요.',
  BULK_GENERIC: '오류가 발생했습니다. 다시 시도해 주세요.',
  DASHBOARD_LOAD: '대시보드를 불러오지 못했습니다. 다시 시도해 주세요.',
  LEADERBOARD_LOAD: '리더보드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  AUTH_FAILED: '로그인에 실패했습니다. 다시 시도해 주세요.',
  AUTH_GOOGLE_FAILED: 'Google 로그인에 실패했습니다. 다시 시도해 주세요.',
  CHECKOUT_FAILED: '결제를 시작하지 못했습니다. 다시 시도해 주세요.',
  PORTAL_FAILED: '결제 포털을 열지 못했습니다. 다시 시도해 주세요.',
  SUBSCRIBE_FAILED: '구독에 실패했습니다. 다시 시도해 주세요.',
  EXPORT_FAILED: '보고서 내보내기에 실패했습니다. 다시 시도해 주세요.',
  SHARE_FAILED: '다시 시도해 주세요.',
} as const;

// ─── 로딩 상태 ─────────────────────────────────────────────────
export const LOADING = {
  ANALYZING: 'AI로 분석 중...',
  DASHBOARD: '대시보드 로딩 중...',
  DASHBOARD_DATA: '데이터 로딩 중...',
  HISTORY: '히스토리 로딩 중...',
  HISTORY_DATA: '분석 기록 로딩 중...',
  CHALLENGE: '챌린지 로딩 중...',
  AUTH_SENDING: '전송 중...',
  SUBSCRIBING: '구독 중...',
  JOINING: '참여 중...',
  EXPORTING: '내보내는 중...',
} as const;

// ─── 빈 상태 ───────────────────────────────────────────────────
export const EMPTY = {
  DASHBOARD_TITLE: '아직 분석 기록이 없습니다',
  DASHBOARD_DESC: '첫 번째 프롬프트를 채점하고 진행 상황을 추적해 보세요.',
  HISTORY_TITLE: '아직 분석 기록이 없습니다',
  HISTORY_DESC: '첫 번째 프롬프트를 채점하고 히스토리를 시작하세요.',
  LEADERBOARD_NO_ENTRIES: (role: string) => `${role}에 대한 항목이 없습니다.`,
  LEADERBOARD_CTA: '첫 번째로 프롬프트를 제출하고 1등을 차지하세요!',
} as const;

// ─── 인증 메시지 ──────────────────────────────────────────────────
export const AUTH = {
  SIGN_IN_FEATURES: '로그인하여 모든 기능을 이용하고 히스토리를 저장하세요.',
  SIGN_IN_DIMENSIONS: '무료 가입으로 6가지 차원 인사이트를 모두 확인하세요.',
  SIGN_IN_DASHBOARD: '로그인하여 대시보드를 확인하세요.',
  SIGN_IN_HISTORY: '로그인하여 분석 히스토리를 확인하세요.',
  SIGN_IN_BULK: '로그인하여 여러 프롬프트를 한 번에 분석하세요.',
  MAGIC_LINK_HINT: '비밀번호 불필요. 로그인 링크를 보내드립니다.',
  CHECK_EMAIL_TITLE: '이메일을 확인하세요!',
  CHECK_EMAIL_DESC: '로그인 링크를 보내드렸습니다. 링크를 클릭하여 ScoreMyPrompt에 로그인하세요.',
  SUBSCRIBED_SUCCESS: '등록 완료! 받은 편지함을 확인하세요.',
} as const;

// ─── 플레이스홀더 ───────────────────────────────────────────────────
export const PLACEHOLDERS = {
  PROMPT_INPUT: 'AI 프롬프트를 여기에 붙여넣어 무료 점수와 개선 팁을 받으세요...',
  PROMPT_BULK: '프롬프트를 입력하세요 (최소 10자)...',
  PROMPT_COMPARE_A: '첫 번째 프롬프트를 여기에 붙여넣으세요...',
  PROMPT_COMPARE_B: '두 번째 프롬프트를 여기에 붙여넣으세요...',
  EMAIL: 'your@email.com',
} as const;

// ─── 힌트 & 도움말 ────────────────────────────────────────────
export const HINTS = {
  PROMPT_MIN_CHARS: '최소 10자',
  NO_SPAM: '스팸 없음. 언제든 구독 취소 가능.',
  FREE_NO_SIGNUP: '무료, 가입 불필요.',
  BULK_LIMIT: '한 번에 최대 5개 프롬프트 분석.',
  PRO_REQUIRED_BULK: '이 기능은 프로 구독이 필요합니다.',
} as const;

// ─── CTA 버튼 라벨 ─────────────────────────────────────────────
export const CTA = {
  SCORE_PROMPT_FREE: '프롬프트 채점하기 — 무료',
  SCORE_FIRST_PROMPT: '첫 프롬프트 채점하기',
  ANALYZE_ANOTHER: '다른 프롬프트 분석하기',
  SCORE_A_PROMPT: '프롬프트 채점하기',
  TRY_AGAIN: '다시 시도',
  GO_HOME: '홈으로',
  SEND_MAGIC_LINK: '로그인 링크 보내기',
  SUBSCRIBE: '구독하기',
  START_FREE_TRIAL: '무료 체험 시작',
  VIEW_PLANS: '요금제 보기',
  LOAD_MORE: '더 보기',
} as const;
