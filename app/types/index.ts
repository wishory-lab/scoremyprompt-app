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

export type Tier = 'guest' | 'free' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  email?: string;
  tier: Tier;
  stripe_customer_id?: string;
  analyses_today: number;
  last_analysis_date?: string;
  best_score: number;
}

export interface GateCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  message: string;
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
