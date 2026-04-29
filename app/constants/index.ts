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

export const TIER_LIMITS: Record<string, number> = {
  guest: 3,
  free: 100,
  pro: Infinity,
};

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

export const TRIAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const AQ_DAILY_LIMIT = 5; // AQ 테스트 1일 최대 횟수 (Free tier)

export const ROLE_BENCHMARKS: Record<string, { average: number; excellent: number }> = {
  Marketing:   { average: 62, excellent: 85 },
  Design:      { average: 58, excellent: 82 },
  Product:     { average: 65, excellent: 88 },
  Finance:     { average: 55, excellent: 80 },
  Freelance:   { average: 60, excellent: 83 },
  Engineering: { average: 63, excellent: 86 },
  Other:       { average: 58, excellent: 82 },
};
