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
  precision:       { label: 'Precision',        letter: 'P', maxScore: 20 },
  role:            { label: 'Role',             letter: 'R', maxScore: 15 },
  outputFormat:    { label: 'Output Format',    letter: 'O', maxScore: 15 },
  missionContext:  { label: 'Mission Context',  letter: 'M', maxScore: 20 },
  promptStructure: { label: 'Prompt Structure', letter: 'P', maxScore: 15 },
  tailoring:       { label: 'Tailoring',        letter: 'T', maxScore: 15 },
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
  precision:       { low: 'Be more specific about what you want.', high: 'Crystal clear instructions!' },
  role:            { low: 'Try adding a specific role (e.g., "Act as a...").', high: 'Great role definition!' },
  outputFormat:    { low: 'Specify the desired output format.', high: 'Output format is well defined!' },
  missionContext:  { low: 'Add more context about your goal.', high: 'Excellent context provided!' },
  promptStructure: { low: 'Structure your prompt with clear sections.', high: 'Well-structured prompt!' },
  tailoring:       { low: 'Customize for your specific use case.', high: 'Perfectly tailored!' },
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
