/**
 * AQ (AI Quotient) — 타입 정의
 * IQ/EQ처럼 AI를 다루는 능력을 수치화하는 종합 지표
 */

// ─── 4대 측정 영역 ───────────────────────────────
export type AQDomain = 'prompt' | 'tool' | 'ethics' | 'concept';

export interface AQDomainScore {
  domain: AQDomain;
  /** 0~100 원점수 */
  rawScore: number;
  /** 가중치 적용 후 점수 */
  weightedScore: number;
  /** 등급 */
  grade: AQGrade;
  /** 영역별 피드백 */
  feedback: string;
  /** 세부 항목 점수 (영역마다 다름) */
  details: AQDomainDetail[];
}

export interface AQDomainDetail {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

// ─── AQ 등급 ─────────────────────────────────────
export type AQGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface AQGradeConfig {
  min: number;
  color: string;
  label: string;
  emoji: string;
  title: string;
  description: string;
}

// ─── 테스트 문제 ─────────────────────────────────
export interface AQQuestion {
  id: string;
  domain: AQDomain;
  /** 문제 유형 */
  type: 'multiple_choice' | 'scenario' | 'prompt_write';
  /** 난이도 1~3 */
  difficulty: 1 | 2 | 3;
  question: string;
  /** 시나리오 설명 (scenario 유형일 때) */
  scenario?: string;
  options?: AQOption[];
  /** 정답 인덱스 (객관식) */
  correctIndex?: number;
  /** 배점 */
  points: number;
  /** 해설 */
  explanation: string;
}

export interface AQOption {
  text: string;
  /** 이 옵션의 부분 점수 (0~points) */
  score: number;
}

// ─── 테스트 진행 상태 ────────────────────────────
export type AQTestPhase = 'intro' | 'prompt' | 'tool' | 'ethics' | 'concept' | 'analyzing' | 'result';

export interface AQTestState {
  phase: AQTestPhase;
  currentQuestionIndex: number;
  answers: Record<string, number>; // questionId -> selectedIndex or score
  /** 프롬프트 영역: SMP 분석 결과 점수 (0~100) */
  promptScore?: number;
  startedAt: number;
  completedAt?: number;
}

// ─── 종합 결과 ───────────────────────────────────
export interface AQResult {
  /** AQ 종합 점수 (0~200) */
  totalScore: number;
  /** AQ 등급 */
  grade: AQGrade;
  /** 백분위 (상위 N%) */
  percentile: number;
  /** 4대 영역별 점수 */
  domains: AQDomainScore[];
  /** AI가 생성한 종합 피드백 */
  summary: string;
  /** 강점 영역 */
  strengths: string[];
  /** 개선 추천 */
  improvements: string[];
  /** 추천 학습 자료 */
  recommendations: string[];
  /** 소요 시간 (초) */
  durationSeconds: number;
  /** 테스트 날짜 */
  testedAt: string;
  /** 결과 공유 ID */
  shareId?: string;
}

// ─── 인증서 ──────────────────────────────────────
export interface AQCertificate {
  id: string;
  userId: string;
  userName: string;
  totalScore: number;
  grade: AQGrade;
  percentile: number;
  domains: { domain: AQDomain; score: number; grade: AQGrade }[];
  issuedAt: string;
  /** 인증서 고유 검증 코드 */
  verificationCode: string;
}
