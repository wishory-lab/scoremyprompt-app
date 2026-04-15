// app/types/harness.ts
import { z } from 'zod';

/** The six HARNES dimensions and their max scores */
export const HARNES_DIMENSIONS = {
  H: { name: 'Hierarchy', max: 15, label: 'Folder & file structure' },
  A: { name: 'Agents', max: 20, label: 'Sub-agent role separation' },
  R: { name: 'Routing', max: 15, label: 'Conditional routing rules' },
  N: { name: 'Norms', max: 15, label: 'Brand & tone guidelines' },
  E: { name: 'Extensions', max: 15, label: 'External tools & MCPs' },
  S: { name: 'SafeOps', max: 20, label: 'SOPs, permissions, failure loops' },
} as const;

export type HarnesDimKey = keyof typeof HARNES_DIMENSIONS;

export const HARNES_MAX_TOTAL = 100;

/** Tier thresholds */
export type HarnessTier = 'Elite' | 'Proficient' | 'Developing' | 'NeedsHarness';
export function computeTier(total: number): HarnessTier {
  if (total >= 85) return 'Elite';
  if (total >= 60) return 'Proficient';
  if (total >= 30) return 'Developing';
  return 'NeedsHarness';
}

/** Request: user pastes CLAUDE.md content or free-form description */
export const HarnessAnalyzeRequestSchema = z.object({
  input: z
    .string()
    .min(20, 'Setup description must be at least 20 characters')
    .max(20_000, 'Setup must be under 20,000 characters'),
  lang: z
    .enum(['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'hi'])
    .default('en'),
});
export type HarnessAnalyzeRequest = z.infer<typeof HarnessAnalyzeRequestSchema>;

/** Per-dimension score 0..max */
export const HarnessScoresSchema = z.object({
  H: z.number().int().min(0).max(15),
  A: z.number().int().min(0).max(20),
  R: z.number().int().min(0).max(15),
  N: z.number().int().min(0).max(15),
  E: z.number().int().min(0).max(15),
  S: z.number().int().min(0).max(20),
});
export type HarnessScores = z.infer<typeof HarnessScoresSchema>;

/** Feedback item returned per dimension */
export const HarnessFeedbackItemSchema = z.object({
  dim: z.enum(['H', 'A', 'R', 'N', 'E', 'S']),
  issue: z.string().min(1).max(300),
  fix: z.string().min(1).max(300),
});
export type HarnessFeedbackItem = z.infer<typeof HarnessFeedbackItemSchema>;

/** Full analyze response — what Claude returns + what we send to client */
export const HarnessAnalyzeResponseSchema = z.object({
  analysisId: z.string().uuid(),
  shareId: z.string().min(6).max(32),
  total: z.number().int().min(0).max(100),
  tier: z.enum(['Elite', 'Proficient', 'Developing', 'NeedsHarness']),
  scores: HarnessScoresSchema,
  feedback: z.array(HarnessFeedbackItemSchema).min(3).max(10),
  quickWins: z.array(z.string().min(1).max(200)).min(2).max(5),
  usage: z
    .object({
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
    })
    .optional(),
});
export type HarnessAnalyzeResponse = z.infer<typeof HarnessAnalyzeResponseSchema>;

/** Claude response shape — subset we parse */
export const HarnessClaudeOutputSchema = z.object({
  scores: HarnessScoresSchema,
  feedback: z.array(HarnessFeedbackItemSchema).min(3).max(10),
  quickWins: z.array(z.string().min(1).max(200)).min(2).max(5),
});
export type HarnessClaudeOutput = z.infer<typeof HarnessClaudeOutputSchema>;

/** Compute total from scores */
export function computeTotal(scores: HarnessScores): number {
  return scores.H + scores.A + scores.R + scores.N + scores.E + scores.S;
}
