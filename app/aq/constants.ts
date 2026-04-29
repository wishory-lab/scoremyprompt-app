/**
 * AQ (AI Quotient) — 상수 & 설정
 */
import type { AQDomain, AQGrade, AQGradeConfig } from './types';

// ─── 영역별 가중치 (합 = 100) ───────────────────
export const AQ_DOMAIN_WEIGHTS: Record<AQDomain, number> = {
  prompt: 40,
  tool: 25,
  ethics: 20,
  concept: 15,
};

// ─── 영역 메타데이터 ────────────────────────────
export const AQ_DOMAIN_META: Record<AQDomain, {
  label: string;
  letter: string;
  color: string;
  icon: string;
  description: string;
}> = {
  prompt: {
    label: '프롬프트 엔지니어링',
    letter: 'P',
    color: '#8B5CF6',
    icon: '✏️',
    description: 'AI에게 정확한 지시를 전달하는 능력',
  },
  tool: {
    label: 'AI 도구 활용',
    letter: 'T',
    color: '#3B82F6',
    icon: '🛠️',
    description: '상황에 맞는 AI 도구를 선택하고 조합하는 능력',
  },
  ethics: {
    label: 'AI 윤리 & 편향',
    letter: 'E',
    color: '#10B981',
    icon: '⚖️',
    description: 'AI의 윤리적 사용과 편향을 인식하는 능력',
  },
  concept: {
    label: 'AI 개념 이해',
    letter: 'C',
    color: '#F59E0B',
    icon: '🧠',
    description: 'AI의 원리, 한계, 가능성을 이해하는 능력',
  },
};

// ─── AQ 등급 기준 (총점 0~200) ──────────────────
// 톤: "모든 등급은 성장 가능한 출발점" — IQ는 고정, AQ는 성장.
// description은 모두 다음 액션을 자연스럽게 가리키도록 작성.
export const AQ_GRADE_CONFIG: Record<AQGrade, AQGradeConfig> = {
  S: {
    min: 170,
    color: '#10B981',
    label: 'S',
    emoji: '🏆',
    title: 'AI 마스터',
    description: '4영역 모두 상위권. 워크플로우를 체계화하고 팀에 전수할 단계입니다.',
  },
  A: {
    min: 140,
    color: '#3B82F6',
    label: 'A',
    emoji: '⭐',
    title: 'AI 전문가',
    description: '현장에서 바로 통하는 실력. 한 영역만 더 깊게 가면 마스터에 닿습니다.',
  },
  B: {
    min: 110,
    color: '#8B5CF6',
    label: 'B',
    emoji: '👍',
    title: 'AI 실무자',
    description: '기본기가 단단합니다. 약점 영역을 채우면 전문가 단계가 보입니다.',
  },
  C: {
    min: 70,
    color: '#F59E0B',
    label: 'C',
    emoji: '💡',
    title: 'AI 입문자',
    description: '출발선을 넘었습니다. 약점 한두 영역만 보완하면 빠르게 올라갑니다.',
  },
  D: {
    min: 0,
    color: '#EF4444',
    label: 'D',
    emoji: '🧭',
    title: 'AI 탐험가',
    description: '지금이 가장 큰 성장 여지를 가진 시점. 흥미로운 영역부터 차근차근 시작해보세요.',
  },
};

// ─── 점수 → 등급 변환 ──────────────────────────
export function getAQGrade(score: number): AQGrade {
  if (score >= AQ_GRADE_CONFIG.S.min) return 'S';
  if (score >= AQ_GRADE_CONFIG.A.min) return 'A';
  if (score >= AQ_GRADE_CONFIG.B.min) return 'B';
  if (score >= AQ_GRADE_CONFIG.C.min) return 'C';
  return 'D';
}

// ─── 영역 원점수(0~100) → 가중 점수 ────────────
export function calculateWeightedScore(domain: AQDomain, rawScore: number): number {
  const weight = AQ_DOMAIN_WEIGHTS[domain];
  // 가중 점수 = (rawScore / 100) * weight * 2  → 총합이 0~200 범위
  return Math.round((rawScore / 100) * weight * 2);
}

// ─── 총점 계산 ──────────────────────────────────
export function calculateTotalAQ(domainScores: Record<AQDomain, number>): number {
  let total = 0;
  for (const domain of Object.keys(AQ_DOMAIN_WEIGHTS) as AQDomain[]) {
    total += calculateWeightedScore(domain, domainScores[domain] || 0);
  }
  return Math.min(200, Math.max(0, total));
}

// ─── 인증서 발급 기준 ───────────────────────────
export const AQ_CERTIFICATE_MIN_SCORE = 110; // B등급 이상부터 인증서 발급
export const AQ_MAX_SCORE = 200;

// ─── 백분위 추정 (초기 데이터 없을 때 정규분포 기반) ──
export function estimatePercentile(score: number): number {
  // 평균 100, 표준편차 30 가정
  const mean = 100;
  const stdDev = 30;
  const z = (score - mean) / stdDev;
  // 정규분포 CDF 근사 (Abramowitz & Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422802 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const cdf = z > 0 ? 1 - p : p;
  return Math.max(1, Math.min(99, Math.round(cdf * 100)));
}
