/**
 * 스킬 1: Advanced Prompt Evaluation Engine
 * 프롬프트를 다차원으로 분석하여 점수, 보안 위험, 개선안을 제공
 */

export interface AdvancedEvaluation {
  // 기존 PROMPT 점수에 추가되는 확장 평가
  clarity: { score: number; details: string };
  specificity: { score: number; details: string };
  contextRichness: { score: number; details: string };
  constraintQuality: { score: number; details: string };
  outputGuidance: { score: number; details: string };
  // 보안 평가 (스킬 9)
  security: SecurityEvaluation;
  // 개선 제안
  suggestions: PromptSuggestion[];
  // 메타 분석
  meta: PromptMeta;
}

export interface SecurityEvaluation {
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  passed: boolean;
}

export interface SecurityVulnerability {
  type: 'injection' | 'jailbreak' | 'pii_leak' | 'harmful_content' | 'role_manipulation' | 'data_exfiltration';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string; // 문제가 되는 텍스트 부분
}

export interface PromptSuggestion {
  category: 'structure' | 'clarity' | 'context' | 'constraint' | 'output' | 'security';
  priority: 'high' | 'medium' | 'low';
  original?: string;
  suggested: string;
  reason: string;
}

export interface PromptMeta {
  wordCount: number;
  sentenceCount: number;
  hasRole: boolean;
  hasOutputFormat: boolean;
  hasConstraints: boolean;
  hasExamples: boolean;
  hasContext: boolean;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  estimatedTokens: number;
  language: string;
}

// ─── 보안 패턴 (스킬 9: Red Teaming) ───
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(all\s+)?prior\s+(instructions|rules)/i,
  /you\s+are\s+now\s+(a|an)\s+(?:unrestricted|jailbroken)/i,
  /DAN\s+mode/i,
  /pretend\s+you\s+(have\s+)?no\s+(restrictions|limitations|rules)/i,
  /bypass\s+(safety|content)\s+(filter|policy)/i,
  /act\s+as\s+if\s+you\s+have\s+no\s+ethical/i,
  /system\s*:\s*you\s+are/i,
  /\]\]\s*>\s*<\s*\[?\[?system/i,
];

const PII_PATTERNS = [
  /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // credit card
  /\b[A-Z]{2}\d{6,9}\b/, // passport
  /password\s*[:=]\s*\S+/i,
  /api[_-]?key\s*[:=]\s*\S+/i,
  /secret[_-]?key\s*[:=]\s*\S+/i,
];

const HARMFUL_PATTERNS = [
  /how\s+to\s+(make|create|build)\s+(a\s+)?(bomb|weapon|explosive)/i,
  /synthesize\s+(illegal|controlled)\s+substance/i,
];

/**
 * 프롬프트 보안 평가 (스킬 9)
 */
export function evaluatePromptSecurity(prompt: string): SecurityEvaluation {
  const vulnerabilities: SecurityVulnerability[] = [];

  // Injection 검사
  INJECTION_PATTERNS.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) {
      vulnerabilities.push({
        type: 'injection',
        severity: 'high',
        description: `Prompt injection pattern detected: "${match[0]}"`,
        location: match[0],
      });
    }
  });

  // PII 검사
  PII_PATTERNS.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) {
      vulnerabilities.push({
        type: 'pii_leak',
        severity: 'critical',
        description: `Possible PII/credential exposure detected`,
        location: match[0].substring(0, 20) + '...',
      });
    }
  });

  // Harmful content 검사
  HARMFUL_PATTERNS.forEach(pattern => {
    const match = prompt.match(pattern);
    if (match) {
      vulnerabilities.push({
        type: 'harmful_content',
        severity: 'critical',
        description: `Potentially harmful request detected`,
        location: match[0],
      });
    }
  });

  // Role manipulation 검사
  const roleManipulation = /you\s+(must|should|will)\s+(always|never)\s+(agree|comply|obey|follow)/i;
  const roleMatch = prompt.match(roleManipulation);
  if (roleMatch) {
    vulnerabilities.push({
      type: 'role_manipulation',
      severity: 'medium',
      description: `Attempt to override AI behavior constraints`,
      location: roleMatch[0],
    });
  }

  const riskScore = vulnerabilities.reduce((sum, v) => {
    const weights = { info: 5, low: 15, medium: 30, high: 50, critical: 80 };
    return sum + weights[v.severity];
  }, 0);

  const riskLevel: SecurityEvaluation['riskLevel'] =
    riskScore === 0 ? 'safe' :
    riskScore < 20 ? 'low' :
    riskScore < 40 ? 'medium' :
    riskScore < 70 ? 'high' : 'critical';

  return {
    riskLevel,
    riskScore: Math.min(100, riskScore),
    vulnerabilities,
    passed: riskScore < 40,
  };
}

/**
 * 프롬프트 메타 분석
 */
export function analyzePromptMeta(prompt: string): PromptMeta {
  const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = prompt.split(/\s+/).filter(w => w.length > 0);

  const hasRole = /(?:you are|act as|role:|persona:)/i.test(prompt);
  const hasOutputFormat = /(?:format|output|respond|return|provide).{0,30}(?:as|in|with|using)\s+(?:json|table|list|bullet|markdown|csv|html|xml)/i.test(prompt) ||
    /(?:in|as)\s+(?:json|table|list|bullet|markdown|csv|html|xml)\s+(?:format|output)/i.test(prompt) ||
    /(?:json|table|markdown|csv|xml)\s+format/i.test(prompt);
  const hasConstraints = /(?:must|should|do not|don't|never|always|limit|maximum|minimum|at least|no more than)/i.test(prompt);
  const hasExamples = /(?:example|for instance|such as|e\.g\.|like this|here is)/i.test(prompt);
  const hasContext = /(?:context|background|given|assuming|scenario|situation)/i.test(prompt);

  const featureCount = [hasRole, hasOutputFormat, hasConstraints, hasExamples, hasContext].filter(Boolean).length;
  const complexity: PromptMeta['complexity'] =
    featureCount >= 4 ? 'expert' :
    featureCount >= 3 ? 'advanced' :
    featureCount >= 2 ? 'intermediate' : 'basic';

  // 간단한 언어 감지
  const koreanChars = (prompt.match(/[\uAC00-\uD7AF]/g) || []).length;
  const language = koreanChars > prompt.length * 0.1 ? 'ko' : 'en';

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    hasRole,
    hasOutputFormat,
    hasConstraints,
    hasExamples,
    hasContext,
    complexity,
    estimatedTokens: Math.ceil(words.length * 1.3),
    language,
  };
}

/**
 * 개선 제안 생성
 */
export function generateSuggestions(prompt: string, meta: PromptMeta): PromptSuggestion[] {
  const suggestions: PromptSuggestion[] = [];

  if (!meta.hasRole) {
    suggestions.push({
      category: 'structure',
      priority: 'high',
      suggested: 'Add a clear role definition (e.g., "You are a senior marketing strategist...")',
      reason: 'Role-based prompts produce 40% more relevant outputs according to prompt engineering research.',
    });
  }

  if (!meta.hasOutputFormat) {
    suggestions.push({
      category: 'output',
      priority: 'high',
      suggested: 'Specify desired output format (e.g., "Format as JSON with keys: title, summary, recommendations")',
      reason: 'Explicit output formats reduce ambiguity and make results immediately actionable.',
    });
  }

  if (!meta.hasConstraints) {
    suggestions.push({
      category: 'constraint',
      priority: 'medium',
      suggested: 'Add constraints (e.g., word limits, tone, audience, or what to avoid)',
      reason: 'Constraints help AI focus and produce more targeted, usable responses.',
    });
  }

  if (!meta.hasExamples) {
    suggestions.push({
      category: 'clarity',
      priority: 'medium',
      suggested: 'Include 1-2 examples of desired output (few-shot prompting)',
      reason: 'Examples are the single most effective technique for improving output quality.',
    });
  }

  if (!meta.hasContext) {
    suggestions.push({
      category: 'context',
      priority: 'medium',
      suggested: 'Provide relevant context or background information',
      reason: 'Context helps the AI understand the situation and provide more relevant responses.',
    });
  }

  if (meta.wordCount < 20) {
    suggestions.push({
      category: 'clarity',
      priority: 'high',
      suggested: 'Expand your prompt with more specific details about what you need',
      reason: 'Short prompts often produce generic responses. Aim for at least 30-50 words.',
    });
  }

  if (meta.wordCount > 500) {
    suggestions.push({
      category: 'structure',
      priority: 'low',
      suggested: 'Consider breaking into numbered sections or using markdown headers',
      reason: 'Structured long prompts are easier for AI to parse and follow accurately.',
    });
  }

  return suggestions;
}

/**
 * 전체 고급 평가 실행
 */
export function runAdvancedEvaluation(prompt: string): AdvancedEvaluation {
  const meta = analyzePromptMeta(prompt);
  const security = evaluatePromptSecurity(prompt);
  const suggestions = generateSuggestions(prompt, meta);

  // 차원별 점수 계산
  const clarity = {
    score: meta.sentenceCount > 0 && meta.wordCount > 15 ? Math.min(100, 50 + meta.wordCount * 0.5) : Math.min(100, meta.wordCount * 3),
    details: meta.wordCount < 20 ? 'Too brief — add specific details' : meta.wordCount > 500 ? 'Very detailed — consider structuring' : 'Good length for clarity',
  };

  const specificity = {
    score: Math.min(100, (meta.hasConstraints ? 30 : 0) + (meta.hasExamples ? 30 : 0) + (meta.wordCount > 30 ? 20 : 10) + (meta.hasOutputFormat ? 20 : 0)),
    details: meta.hasExamples ? 'Includes examples — great for specificity' : 'Add examples to improve specificity',
  };

  const contextRichness = {
    score: Math.min(100, (meta.hasContext ? 40 : 0) + (meta.hasRole ? 30 : 0) + (meta.sentenceCount >= 3 ? 30 : meta.sentenceCount * 10)),
    details: meta.hasContext && meta.hasRole ? 'Rich context with role' : 'Add more context and define a role',
  };

  const constraintQuality = {
    score: Math.min(100, (meta.hasConstraints ? 50 : 0) + (meta.hasOutputFormat ? 30 : 0) + (meta.wordCount > 50 ? 20 : 10)),
    details: meta.hasConstraints ? 'Constraints detected' : 'No constraints found — output may be unpredictable',
  };

  const outputGuidance = {
    score: Math.min(100, (meta.hasOutputFormat ? 50 : 0) + (meta.hasExamples ? 30 : 0) + (meta.hasConstraints ? 20 : 0)),
    details: meta.hasOutputFormat ? 'Output format specified' : 'No output format specified',
  };

  return {
    clarity,
    specificity,
    contextRichness,
    constraintQuality,
    outputGuidance,
    security,
    suggestions,
    meta,
  };
}
