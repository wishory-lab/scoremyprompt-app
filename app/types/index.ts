// PROMPT Score dimension scores
export interface DimensionScore {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface DimensionScores {
  precision: DimensionScore;
  role: DimensionScore;
  outputFormat: DimensionScore;
  missionContext: DimensionScore;
  promptStructure: DimensionScore;
  tailoring: DimensionScore;
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface AnalysisResult {
  overallScore: number;
  grade: Grade;
  dimensions: DimensionScores;
  strengths: string[];
  improvements: string[];
  rewriteSuggestion?: string;
  jobRole: string;
  scoreLevel?: string;
  benchmarks?: {
    average: number;
    excellent: number;
    percentile: number;
  };
  usage?: { inputTokens: number; outputTokens: number };
  analysisId?: string;
  shareId?: string;
}

/** 'pro' is legacy — kept for backward compatibility with existing DB records */
export type Tier = 'guest' | 'free' | 'premium' | 'pro';

export interface UserProfile {
  id: string;
  email?: string;
  tier: Tier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  analyses_today: number;
  last_analysis_date?: string;
  best_score: number;
  /** One-time bonus credits (e.g., 10 on sign-up) */
  bonus_credits: number;
  /** Credits earned from watching rewarded ads today */
  ad_credits_today: number;
  grace_period_end?: string | null;
}

export interface GateCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  message: string;
  /** If true, user should be shown a rewarded ad to continue */
  showAdPrompt?: boolean;
  /** How many ad-credits used today */
  adCreditsUsed?: number;
}

export type JobRole = 'Marketing' | 'Design' | 'Product' | 'Finance' | 'Freelance' | 'Engineering' | 'Other';

export interface APIErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface GradeConfig {
  min: number;
  color: string;
  label: string;
  emoji: string;
  message: string;
}

export interface DimensionMeta {
  label: string;
  letter: string;
  maxScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  score: number;
  grade: Grade;
  job_role: string;
  prompt_preview: string;
}
