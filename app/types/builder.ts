import { z } from 'zod';

export const ROLES = ['Marketer', 'Planner', 'PM', 'Designer', 'Sales', 'Other'] as const;
export const GOALS = [
  'weekly_research',
  'card_news_sns',
  'competitor_monitoring',
  'customer_replies',
  'data_summaries',
  'meeting_notes',
] as const;
export const TONE_STYLES = ['Professional', 'Friendly', 'Bold'] as const;
export const TOOLS = ['web_search', 'google_sheets', 'notion', 'slack', 'github', 'buffer'] as const;
export const AUTOMATION_LEVELS = ['semi_auto', 'full_auto'] as const;

export const BuilderAnswersSchema = z.object({
  role: z.enum(ROLES),
  goals: z.array(z.enum(GOALS)).min(1).max(6),
  tone: z.enum(TONE_STYLES),
  tools: z.array(z.enum(TOOLS)).max(6).default([]),
  automation: z.enum(AUTOMATION_LEVELS),
  lang: z
    .enum(['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'hi'])
    .default('en'),
});
export type BuilderAnswers = z.infer<typeof BuilderAnswersSchema>;

/**
 * Map of file path (relative to ZIP root) → UTF-8 text content.
 * Required keys (checked at runtime by builder-validate.ts):
 *   - "CLAUDE.md"
 *   - at least 2 files under "/agents/"
 *   - "README.md"
 */
export const BuilderFileMapSchema = z.record(z.string().min(1), z.string().min(1).max(50_000));
export type BuilderFileMap = z.infer<typeof BuilderFileMapSchema>;

export const BuilderGenerateResponseSchema = z.object({
  id: z.string().uuid(),
  files: BuilderFileMapSchema,
  expiresAt: z.string(),                    // ISO timestamp
  isProBuild: z.boolean(),
  quota: z.object({
    buildsUsed: z.number().int().nonnegative(),
    bonusFromShare: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),  // 1 for Free, effectively Infinity (1000) for Pro
  }),
});
export type BuilderGenerateResponse = z.infer<typeof BuilderGenerateResponseSchema>;

export const BuilderClaudeOutputSchema = z.object({
  files: BuilderFileMapSchema,
});
export type BuilderClaudeOutput = z.infer<typeof BuilderClaudeOutputSchema>;

export const BuilderQuotaResponseSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  buildsUsed: z.number().int().nonnegative(),
  bonusFromShare: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  canBuild: z.boolean(),
  tier: z.enum(['free', 'pro']),
});
export type BuilderQuotaResponse = z.infer<typeof BuilderQuotaResponseSchema>;

export const BuilderClaimShareRequestSchema = z.object({
  buildId: z.string().uuid(),
});
export type BuilderClaimShareRequest = z.infer<typeof BuilderClaimShareRequestSchema>;

/** Constants used by quota helper and validation. */
export const FREE_MONTHLY_BUILDS = 1;
export const PRO_MONTHLY_BUILDS = 1000;        // effectively unlimited; cap protects against abuse
export const MAX_SHARE_BONUS_PER_MONTH = 1;    // Free gets +1 per share, max 1 bonus / month
