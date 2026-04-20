/**
 * 스킬 8: Multi-Model Prompt Battleground
 * 하나의 프롬프트를 여러 AI 모델에 동시 전송하고 결과를 비교
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  version: string;
  color: string;
  icon: string;
  costPer1kTokens: { input: number; output: number };
  maxTokens: number;
  strengths: string[];
}

export interface ModelResponse {
  modelId: string;
  response: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  timestamp: string;
}

export interface BattlegroundResult {
  prompt: string;
  models: ModelResponse[];
  comparison: ModelComparison;
  winner: string | null;
  timestamp: string;
}

export interface ModelComparison {
  fastest: string;
  cheapest: string;
  mostVerbose: string;
  mostConcise: string;
  qualityScores: Record<string, number>;
}

// 지원 모델 목록 (2026년 3월 기준)
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gpt-5.4-thinking',
    name: 'GPT-5.4 Thinking',
    provider: 'OpenAI',
    version: '5.4',
    color: '#10A37F',
    icon: '🟢',
    costPer1kTokens: { input: 0.015, output: 0.06 },
    maxTokens: 128000,
    strengths: ['Reasoning', 'Code generation', 'Complex analysis'],
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    version: '3.1',
    color: '#4285F4',
    icon: '🔵',
    costPer1kTokens: { input: 0.002, output: 0.008 },
    maxTokens: 2000000,
    strengths: ['Long context', 'Multimodal', 'Cost efficiency'],
  },
  {
    id: 'claude-opus-4.6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    version: '4.6',
    color: '#D97706',
    icon: '🟠',
    costPer1kTokens: { input: 0.015, output: 0.075 },
    maxTokens: 200000,
    strengths: ['Nuanced writing', 'Safety', 'Instruction following'],
  },
  {
    id: 'claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    version: '4.6',
    color: '#F59E0B',
    icon: '🟡',
    costPer1kTokens: { input: 0.003, output: 0.015 },
    maxTokens: 200000,
    strengths: ['Balance of speed/quality', 'Coding', 'Analysis'],
  },
  {
    id: 'grok-4.20',
    name: 'Grok 4.20',
    provider: 'xAI',
    version: '4.20',
    color: '#1DA1F2',
    icon: '🔷',
    costPer1kTokens: { input: 0.005, output: 0.015 },
    maxTokens: 131072,
    strengths: ['Real-time data', 'Conversational', 'Humor'],
  },
];

/**
 * 모델 비용 계산
 */
export function estimateCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1000) * model.costPer1kTokens.input +
         (outputTokens / 1000) * model.costPer1kTokens.output;
}

/**
 * 비교 분석 실행 (시뮬레이션 — 실제로는 각 모델 API 호출)
 */
export function compareModels(responses: ModelResponse[]): ModelComparison {
  if (responses.length === 0) {
    return { fastest: '', cheapest: '', mostVerbose: '', mostConcise: '', qualityScores: {} };
  }

  const fastest = responses.reduce((a, b) => a.latencyMs < b.latencyMs ? a : b).modelId;
  const cheapest = responses.reduce((a, b) => a.estimatedCost < b.estimatedCost ? a : b).modelId;
  const mostVerbose = responses.reduce((a, b) => a.outputTokens > b.outputTokens ? a : b).modelId;
  const mostConcise = responses.reduce((a, b) => a.outputTokens < b.outputTokens ? a : b).modelId;

  // 품질 점수 (실제로는 자동 평가 모델이나 rubric 기반)
  const qualityScores: Record<string, number> = {};
  responses.forEach(r => {
    // 간이 품질 점수: 응답 길이, 구조, 키워드 기반
    const lengthScore = Math.min(40, r.outputTokens * 0.05);
    const structureScore = (r.response.includes('\n') ? 20 : 0) +
                           (r.response.includes('1.') || r.response.includes('-') ? 15 : 0);
    const depthScore = Math.min(25, r.response.split(/[.!?]/).length * 2);
    qualityScores[r.modelId] = Math.min(100, Math.round(lengthScore + structureScore + depthScore));
  });

  return { fastest, cheapest, mostVerbose, mostConcise, qualityScores };
}

/**
 * 모델별 적합성 추천 (프롬프트 특성 기반)
 */
export function recommendModels(promptLength: number, taskType: string): ModelConfig[] {
  const allModels = [...AVAILABLE_MODELS];

  if (taskType === 'coding' || taskType === 'analysis') {
    return allModels.sort((a, b) => {
      const aScore = a.strengths.includes('Code generation') || a.strengths.includes('Complex analysis') ? 1 : 0;
      const bScore = b.strengths.includes('Code generation') || b.strengths.includes('Complex analysis') ? 1 : 0;
      return bScore - aScore;
    });
  }

  if (taskType === 'writing' || taskType === 'creative') {
    return allModels.sort((a, b) => {
      const aScore = a.strengths.includes('Nuanced writing') || a.strengths.includes('Conversational') ? 1 : 0;
      const bScore = b.strengths.includes('Nuanced writing') || b.strengths.includes('Conversational') ? 1 : 0;
      return bScore - aScore;
    });
  }

  // 긴 프롬프트인 경우 컨텍스트 윈도우 고려
  if (promptLength > 50000) {
    return allModels.sort((a, b) => b.maxTokens - a.maxTokens);
  }

  // 비용 효율 기본 정렬
  return allModels.sort((a, b) => a.costPer1kTokens.input - b.costPer1kTokens.input);
}

/**
 * 모델 비용 비교 테이블 데이터 생성
 */
export function generateCostComparison(inputTokens: number, outputTokens: number) {
  return AVAILABLE_MODELS.map(model => ({
    model: model.name,
    provider: model.provider,
    color: model.color,
    inputCost: ((inputTokens / 1000) * model.costPer1kTokens.input).toFixed(4),
    outputCost: ((outputTokens / 1000) * model.costPer1kTokens.output).toFixed(4),
    totalCost: estimateCost(model, inputTokens, outputTokens).toFixed(4),
    maxContext: `${(model.maxTokens / 1000).toFixed(0)}K`,
  }));
}
