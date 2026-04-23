import type { Grade, GradeConfig, DimensionMeta, JobRole } from '../types';

export const GRADE_COLORS: Record<Grade, string> = Object.fromEntries(
  Object.entries({
    S: '#10B981', A: '#3B82F6', B: '#8B5CF6', C: '#F59E0B', D: '#EF4444',
  })
) as Record<Grade, string>;

export const GRADE_CONFIG: Record<Grade, GradeConfig> = {
  S: { min: 90, color: '#10B981', label: 'S-Tier', emoji: '\u{1F3C6}', message: 'Prompt Master! Exceptional quality.' },
  A: { min: 80, color: '#3B82F6', label: 'A-Tier', emoji: '\u{2B50}', message: 'Great job! Minor tweaks possible.' },
  B: { min: 65, color: '#8B5CF6', label: 'B-Tier', emoji: '\u{1F44D}', message: 'Good foundation. Room to grow.' },
  C: { min: 50, color: '#F59E0B', label: 'C-Tier', emoji: '\u{1F4A1}', message: 'Has potential. Key areas need work.' },
  D: { min: 0,  color: '#EF4444', label: 'D-Tier', emoji: '\u{1F4DD}', message: 'Just getting started. Let\'s improve!' },
};

export const DIMENSION_META: Record<string, DimensionMeta> = {
  precision:       { label: 'Precision(정밀도)',         letter: 'P', maxScore: 20 },
  role:            { label: 'Role(역할)',               letter: 'R', maxScore: 15 },
  outputFormat:    { label: 'Output Format(출력 형식)', letter: 'O', maxScore: 15 },
  missionContext:  { label: 'Mission Context(미션)',    letter: 'M', maxScore: 20 },
  promptStructure: { label: 'Prompt Structure(구조)',   letter: 'P', maxScore: 15 },
  tailoring:       { label: 'Tailoring(맞춤화)',        letter: 'T', maxScore: 15 },
} as const;

export const JOB_ROLES: JobRole[] = ['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other'];

/**
 * SMP Credit System
 * ─────────────────────────────────────────────
 * 🎉 오픈 이벤트 (~2025.05.31)
 * Guest (비로그인):     5회/일
 * Free  (무료 회원):    50회/일 기본 + 광고 시청으로 추가 획득
 *                       회원가입 시 보너스 10크레딧 지급
 * Premium (월 구독):    무제한 — 광고 없음
 * ─────────────────────────────────────────────
 * 이벤트 종료 후 원래 값: guest=2, free=3, premium=33
 */

/** 오픈 이벤트 마감일 (KST 2025-05-31 23:59:59) */
export const EVENT_END_DATE = new Date('2025-06-01T00:00:00+09:00');

/** 이벤트 기간인지 확인 */
export function isEventActive(): boolean {
  return new Date() < EVENT_END_DATE;
}

const EVENT_LIMITS: Record<string, number> = {
  guest: 5,
  free: 50,
  premium: 999999, // 사실상 무제한
};

const NORMAL_LIMITS: Record<string, number> = {
  guest: 2,
  free: 3,
  premium: 33,
};

export const TIER_LIMITS: Record<string, number> = isEventActive() ? EVENT_LIMITS : NORMAL_LIMITS;

/** Bonus credits given on sign-up */
export const SIGNUP_BONUS_CREDITS = 10;

/** Max ad-rewarded credits per day for free users */
export const MAX_AD_CREDITS_PER_DAY = 30;

/** Seconds user must watch the ad before closing */
export const AD_WATCH_SECONDS = 15;

/** Premium pricing in USD */
export const PREMIUM_PRICE_USD = 4.99;
export const PREMIUM_INTRO_PRICE_USD = 2.99;
export const PREMIUM_INTRO_MONTHS = 3;

/** Pro Trial (맛보기) — 24 hours, one-time per user */
export const TRIAL_DURATION_HOURS = 24;
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;

export const JOB_ROLE_LABELS: Record<string, string> = {
  Marketing: 'Marketing',
  Design: 'Design',
  Product: 'Product Management',
  Finance: 'Finance',
  Freelance: 'Freelance',
  Engineering: 'Engineering',
  Other: 'General',
};

export const DIMENSION_FEEDBACK: Record<string, { low: string; high: string }> = {
  precision:       { low: '원하는 것을 더 구체적으로 명시하세요.', high: '매우 명확한 지시입니다!' },
  role:            { low: '역할을 추가해보세요 (예: "당신은...").', high: '훌륭한 역할 정의!' },
  outputFormat:    { low: '원하는 출력 형식을 지정하세요.', high: '출력 형식이 잘 정의되어 있습니다!' },
  missionContext:  { low: '목표에 대한 컨텍스트를 추가하세요.', high: '훌륭한 컨텍스트 제공!' },
  promptStructure: { low: '명확한 섹션으로 프롬프트를 구조화하세요.', high: '잘 구조화된 프롬프트!' },
  tailoring:       { low: '특정 사용 목적에 맞게 맞춤화하세요.', high: '완벽하게 맞춤화되었습니다!' },
};

export const ROLE_BENCHMARKS: Record<string, { average: number; excellent: number }> = {
  Marketing:   { average: 62, excellent: 85 },
  Design:      { average: 58, excellent: 82 },
  Product:     { average: 65, excellent: 88 },
  Finance:     { average: 55, excellent: 80 },
  Freelance:   { average: 60, excellent: 83 },
  Engineering: { average: 63, excellent: 86 },
  Other:       { average: 58, excellent: 82 },
};
