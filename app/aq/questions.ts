/**
 * AQ 테스트 문제 뱅크
 * 영역: tool(도구 활용), ethics(윤리/편향), concept(개념 이해)
 * 프롬프트 영역은 기존 SMP 엔진 활용
 */
import type { AQQuestion } from './types';

// ─── 도구 활용 (Tool) ────────────────────────────
export const TOOL_QUESTIONS: AQQuestion[] = [
  {
    id: 'tool-1',
    domain: 'tool',
    type: 'scenario',
    difficulty: 1,
    question: '마케팅 팀에서 다음 분기 캠페인 이미지를 만들어야 합니다. 가장 적합한 AI 도구 조합은?',
    scenario: '예산은 제한적이고, 브랜드 가이드라인에 맞는 고품질 이미지 20장이 필요합니다.',
    options: [
      { text: 'Midjourney로 초안 생성 → Canva AI로 브랜드 가이드라인 적용 → 팀 리뷰', score: 10 },
      { text: 'ChatGPT에게 이미지 설명을 작성하게 한 후 직접 디자인', score: 4 },
      { text: 'DALL-E로 20장을 한 번에 생성하여 바로 사용', score: 3 },
      { text: '구글에서 무료 이미지를 검색하여 AI로 편집', score: 2 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '복잡한 크리에이티브 작업은 생성 AI + 편집 도구를 조합하고, 사람의 리뷰를 거치는 것이 최적입니다.',
  },
  {
    id: 'tool-2',
    domain: 'tool',
    type: 'multiple_choice',
    difficulty: 1,
    question: '100페이지 PDF 보고서의 핵심 내용을 빠르게 파악하려면 어떤 접근이 가장 효과적인가요?',
    options: [
      { text: 'Claude/ChatGPT에 PDF를 업로드하여 요약 요청', score: 10 },
      { text: '보고서 전체를 ChatGPT에 복사-붙여넣기', score: 4 },
      { text: 'AI에게 "보고서 요약해줘"라고만 말하기 (파일 없이)', score: 1 },
      { text: '직접 읽으면서 메모하기', score: 3 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '대용량 문서 분석에는 파일 업로드를 지원하는 AI 도구를 활용하는 것이 가장 효율적입니다.',
  },
  {
    id: 'tool-3',
    domain: 'tool',
    type: 'scenario',
    difficulty: 2,
    question: '다국어 고객 지원 챗봇을 구축해야 합니다. 어떤 전략이 가장 효과적인가요?',
    scenario: '한국어, 영어, 일본어 지원이 필요하고, 회사 제품 FAQ 300개가 있습니다.',
    options: [
      { text: 'RAG(검색 증강 생성) 기반 챗봇 — FAQ를 벡터 DB에 저장, GPT-4로 응답 생성', score: 10 },
      { text: 'ChatGPT API에 모든 FAQ를 시스템 프롬프트로 넣기', score: 4 },
      { text: '각 언어별로 별도 룰 기반 챗봇 3개 개발', score: 3 },
      { text: 'Google Translate API로 한국어 챗봇의 응답을 번역', score: 5 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'RAG 아키텍처는 대량 지식을 효율적으로 활용하면서도 자연스러운 다국어 응답을 생성할 수 있습니다.',
  },
  {
    id: 'tool-4',
    domain: 'tool',
    type: 'multiple_choice',
    difficulty: 2,
    question: '다음 중 "멀티모달 AI 활용"의 올바른 예시는?',
    options: [
      { text: '사진을 GPT-4 Vision에 올려서 텍스트 설명을 받고, 그걸 바탕으로 코드 생성', score: 10 },
      { text: 'ChatGPT에서 긴 대화를 이어가기', score: 1 },
      { text: '여러 AI 서비스에 같은 질문을 동시에 하기', score: 2 },
      { text: 'AI가 생성한 이미지를 다운로드하기', score: 3 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '멀티모달은 텍스트·이미지·음성 등 여러 형태의 데이터를 함께 처리하는 것을 의미합니다.',
  },
  {
    id: 'tool-5',
    domain: 'tool',
    type: 'scenario',
    difficulty: 3,
    question: '스타트업에서 AI를 활용한 데이터 분석 파이프라인을 설계해야 합니다. 가장 현실적인 접근은?',
    scenario: '월 1만 건의 고객 피드백을 분류·분석해야 하고, 개발 인력은 1명입니다.',
    options: [
      { text: 'OpenAI API로 감성 분석 + 자동 태깅 → 결과를 대시보드(Notion/Sheets)에 자동 적재', score: 10 },
      { text: '직접 ML 모델을 학습시켜 감성 분류기 구축', score: 3 },
      { text: 'ChatGPT 웹에서 매일 수동으로 분석', score: 2 },
      { text: 'AI 없이 키워드 기반 룰로 분류', score: 4 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '소규모 팀에서는 API 기반 자동화가 가장 현실적이고 확장 가능한 접근입니다.',
  },
];

// ─── 윤리/편향 (Ethics) ──────────────────────────
export const ETHICS_QUESTIONS: AQQuestion[] = [
  {
    id: 'ethics-1',
    domain: 'ethics',
    type: 'scenario',
    difficulty: 1,
    question: 'AI가 생성한 글을 회사 블로그에 게시하려 합니다. 가장 적절한 대응은?',
    scenario: 'AI가 작성한 초안이 매우 잘 쓰여져 있어 수정이 거의 필요 없습니다.',
    options: [
      { text: '팩트체크 후 게시하되, AI 활용 사실을 명시하거나 사내 정책에 따름', score: 10 },
      { text: '그대로 게시 — AI가 잘 썼으니 문제없음', score: 2 },
      { text: 'AI가 쓴 부분을 전부 삭제하고 직접 다시 작성', score: 4 },
      { text: '저자를 "AI"로 표기하고 게시', score: 6 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'AI 생성 콘텐츠는 반드시 사실 확인이 필요하고, 투명성 정책에 따라 공개하는 것이 바람직합니다.',
  },
  {
    id: 'ethics-2',
    domain: 'ethics',
    type: 'multiple_choice',
    difficulty: 1,
    question: 'AI 채용 시스템이 특정 성별을 불리하게 평가한다는 보고가 있습니다. 원인으로 가장 가능성이 높은 것은?',
    options: [
      { text: '학습 데이터에 과거의 성별 편향이 반영되어 있기 때문', score: 10 },
      { text: 'AI가 의도적으로 차별하도록 프로그래밍되었기 때문', score: 1 },
      { text: 'AI의 처리 속도가 느려서 발생하는 오류', score: 0 },
      { text: '특정 성별의 지원자가 더 적기 때문', score: 4 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'AI 편향의 주요 원인은 학습 데이터에 내재된 과거의 사회적 편향입니다.',
  },
  {
    id: 'ethics-3',
    domain: 'ethics',
    type: 'scenario',
    difficulty: 2,
    question: 'AI로 고객 데이터를 분석하려는데, 개인정보 보호 관점에서 가장 적절한 접근은?',
    scenario: '고객 이름, 이메일, 구매 이력이 포함된 10만 건의 데이터를 외부 AI API로 분석하려 합니다.',
    options: [
      { text: '개인 식별 정보를 익명화/가명화한 후 AI에 전송', score: 10 },
      { text: '고객에게 동의를 받았으니 그대로 전송', score: 4 },
      { text: 'AI가 데이터를 저장하지 않는다고 하니 그대로 전송', score: 2 },
      { text: 'AI 분석을 포기하고 수동으로 분석', score: 3 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '외부 AI 서비스에 데이터를 보낼 때는 반드시 개인 식별 정보를 익명화해야 합니다.',
  },
  {
    id: 'ethics-4',
    domain: 'ethics',
    type: 'multiple_choice',
    difficulty: 2,
    question: 'AI가 생성한 코드를 프로덕션에 사용할 때 가장 중요한 고려사항은?',
    options: [
      { text: '보안 취약점 검토 + 라이선스 확인 + 코드 리뷰', score: 10 },
      { text: 'AI가 생성했으니 버그가 없을 것이라 신뢰', score: 1 },
      { text: '단위 테스트만 통과하면 OK', score: 5 },
      { text: 'AI 생성 코드는 절대 프로덕션에 사용하면 안 됨', score: 2 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'AI 생성 코드도 보안 취약점, 라이선스 문제, 논리 오류가 있을 수 있으므로 철저한 검토가 필요합니다.',
  },
  {
    id: 'ethics-5',
    domain: 'ethics',
    type: 'scenario',
    difficulty: 3,
    question: 'AI 챗봇이 의료 상담에서 잘못된 정보를 제공하여 환자가 위험에 처할 뻔했습니다. 가장 근본적인 해결책은?',
    scenario: '회사의 의료 AI 챗봇이 "두통이 있으면 아스피린을 3배 복용하라"고 답변했습니다.',
    options: [
      { text: '의료 전문가 검수 체계 구축 + AI 응답에 "전문가 상담 권장" 면책 고지 + 위험 답변 필터링', score: 10 },
      { text: '프롬프트를 더 정교하게 수정', score: 4 },
      { text: '해당 질문 유형을 차단', score: 5 },
      { text: '의료 AI 챗봇 서비스를 즉시 중단', score: 3 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '고위험 영역에서의 AI는 전문가 검수, 면책 고지, 안전장치를 반드시 갖춰야 합니다.',
  },
];

// ─── 개념 이해 (Concept) ─────────────────────────
export const CONCEPT_QUESTIONS: AQQuestion[] = [
  {
    id: 'concept-1',
    domain: 'concept',
    type: 'multiple_choice',
    difficulty: 1,
    question: 'ChatGPT 같은 대규모 언어 모델(LLM)이 답변을 생성하는 원리는?',
    options: [
      { text: '학습된 패턴을 바탕으로 다음에 올 확률이 높은 토큰을 순차적으로 예측', score: 10 },
      { text: '인터넷을 실시간으로 검색하여 답변을 찾아냄', score: 2 },
      { text: '미리 저장된 답변 데이터베이스에서 가장 유사한 것을 찾아냄', score: 3 },
      { text: '사람처럼 의미를 이해하고 추론한 후 답변', score: 4 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'LLM은 토큰 예측 모델로, 학습 데이터의 패턴을 기반으로 다음 토큰을 순차 생성합니다.',
  },
  {
    id: 'concept-2',
    domain: 'concept',
    type: 'multiple_choice',
    difficulty: 1,
    question: 'AI "할루시네이션(Hallucination)"이란?',
    options: [
      { text: 'AI가 사실이 아닌 정보를 확신에 차서 생성하는 현상', score: 10 },
      { text: 'AI가 환각 이미지를 만들어내는 기능', score: 1 },
      { text: 'AI가 과부하로 오작동하는 현상', score: 2 },
      { text: 'AI가 사용자의 의도를 잘못 파악하는 것', score: 4 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '할루시네이션은 AI가 실제와 다른 정보를 마치 사실인 것처럼 자신 있게 생성하는 현상입니다.',
  },
  {
    id: 'concept-3',
    domain: 'concept',
    type: 'scenario',
    difficulty: 2,
    question: 'AI가 "지구는 평평하다"라고 매우 자신 있게 답변했습니다. 이 상황을 가장 정확하게 설명하는 것은?',
    scenario: '사용자가 "지구가 평평하다고 주장하는 글을 써줘"라고 요청했고, AI가 매우 설득력 있는 글을 작성했습니다.',
    options: [
      { text: 'AI는 진실 여부를 판단하지 않고, 요청된 패턴에 맞는 텍스트를 생성한 것', score: 10 },
      { text: 'AI가 지구가 평평하다고 믿고 있다', score: 0 },
      { text: 'AI의 학습 데이터에 평평한 지구 정보가 더 많았다', score: 3 },
      { text: 'AI에 버그가 있어서 잘못된 답변을 한 것', score: 2 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'AI는 "믿음"이 없으며, 프롬프트에 맞는 패턴의 텍스트를 생성할 뿐입니다.',
  },
  {
    id: 'concept-4',
    domain: 'concept',
    type: 'multiple_choice',
    difficulty: 2,
    question: '"파인튜닝(Fine-tuning)"과 "프롬프트 엔지니어링"의 차이를 가장 정확하게 설명한 것은?',
    options: [
      { text: '파인튜닝은 모델 자체를 추가 학습시키는 것, 프롬프트 엔지니어링은 입력을 최적화하는 것', score: 10 },
      { text: '파인튜닝이 항상 더 좋은 결과를 냄', score: 2 },
      { text: '프롬프트 엔지니어링은 파인튜닝의 한 종류', score: 3 },
      { text: '둘 다 같은 것의 다른 이름', score: 0 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: '파인튜닝은 모델 가중치를 업데이트하고, 프롬프트 엔지니어링은 모델은 그대로 두고 입력을 최적화합니다.',
  },
  {
    id: 'concept-5',
    domain: 'concept',
    type: 'scenario',
    difficulty: 3,
    question: 'AI의 "컨텍스트 윈도우(Context Window)" 제한을 극복하기 위한 가장 효과적인 전략은?',
    scenario: '10만 단어 분량의 법률 문서를 AI로 분석해야 하지만, 모델의 컨텍스트 윈도우는 8,000토큰입니다.',
    options: [
      { text: '문서를 의미 단위로 분할(청킹) → 각 청크를 벡터 임베딩 → 질문과 관련된 청크만 검색하여 AI에 전달(RAG)', score: 10 },
      { text: '문서를 8,000토큰씩 잘라서 순서대로 요약', score: 5 },
      { text: '더 큰 컨텍스트 윈도우를 가진 모델을 사용', score: 6 },
      { text: '핵심 부분만 수동으로 골라서 AI에 입력', score: 3 },
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'RAG(검색 증강 생성)는 대용량 문서를 효율적으로 처리하는 가장 검증된 방법입니다.',
  },
];

// ─── 전체 문제 합치기 ────────────────────────────
export const ALL_QUESTIONS: AQQuestion[] = [
  ...TOOL_QUESTIONS,
  ...ETHICS_QUESTIONS,
  ...CONCEPT_QUESTIONS,
];

/** 도메인별 문제 가져오기 */
export function getQuestionsByDomain(domain: AQQuestion['domain']): AQQuestion[] {
  return ALL_QUESTIONS.filter(q => q.domain === domain);
}
