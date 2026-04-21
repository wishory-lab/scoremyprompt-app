/**
 * 스킬 5: 마케팅 프롬프트 템플릿 라이브러리
 * 카테고리별 검증된 프롬프트 템플릿 라이브러리
 */

export interface PromptTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  description: string;
  template: string;
  variables: TemplateVariable[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedScore: number; // 예상 PROMPT 점수
  usageCount: number;
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  description: string;
  required: boolean;
  examples: string[];
}

export type TemplateCategory =
  | 'seo'
  | 'content_marketing'
  | 'social_media'
  | 'email_campaign'
  | 'product_copy'
  | 'ux_writing'
  | 'data_analysis'
  | 'strategy'
  | 'customer_research'
  | 'brand_voice';

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; icon: string; description: string }> = {
  seo: { label: 'SEO & 검색', icon: '🔍', description: '검색 엔진 최적화와 키워드 전략' },
  content_marketing: { label: '콘텐츠 마케팅', icon: '📝', description: '블로그 포스트, 아티클, 사고 리더십' },
  social_media: { label: '소셜 미디어', icon: '📱', description: '포스트, 캡션, 소셜 캠페인' },
  email_campaign: { label: '이메일 캠페인', icon: '📧', description: '뉴스레터, 드립 캠페인, 아웃리치' },
  product_copy: { label: '제품 카피', icon: '🏷️', description: '제품 설명, 랜딩 페이지, CTA' },
  ux_writing: { label: 'UX 라이팅', icon: '✏️', description: '마이크로카피, 에러 메시지, 온보딩 플로우' },
  data_analysis: { label: '데이터 분석', icon: '📊', description: '보고서, 인사이트, 데이터 해석' },
  strategy: { label: '전략 & 기획', icon: '🎯', description: 'GTM 전략, 경쟁 분석, 로드맵' },
  customer_research: { label: '고객 리서치', icon: '🔬', description: '설문조사, 페르소나, 사용자 인터뷰' },
  brand_voice: { label: '브랜드 보이스', icon: '🎙️', description: '톤 가이드, 브랜드 메시지, 스타일' },
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ─── SEO ───
  {
    id: 'seo-keyword-cluster',
    category: 'seo',
    title: 'SEO 키워드 클러스터 전략',
    description: '검색 의도 매핑이 포함된 포괄적 키워드 클러스터 전략을 생성합니다',
    template: `당신은 {{industry}} 분야에서 10년 이상 경력의 SEO 전문가입니다.

과제: {{target_audience}}를 타겟으로 "{{target_keyword}}"에 대한 키워드 클러스터 전략을 만들어 주세요.

요구사항:
1. 주요 키워드 클러스터(5-7개 키워드) — 예상 월간 검색량 포함
2. 롱테일 변형(10-15개 키워드)을 검색 의도별로 그룹화:
   - 정보형 (방법, ~란 무엇)
   - 상업형 (최고, 리뷰, 비교)
   - 거래형 (구매, 가격, 무료 체험)
3. 콘텐츠 갭 분석: 경쟁사가 다루지만 우리가 다루지 않는 주제
4. 각 클러스터에 적합한 콘텐츠 유형 추천 (블로그, 랜딩 페이지, FAQ)

출력 형식: 구조화된 테이블 — 열: 키워드 | 검색량 | 난이도 | 의도 | 콘텐츠 유형 | 우선순위

제약:
- 난이도 60 이하 키워드에 집중
- 명확한 상업적 의도가 있는 키워드 우선
- 추천 스니펫용 질문형 키워드 최소 3개 포함`,
    variables: [
      { name: 'industry', placeholder: '예: SaaS, 이커머스, 핀테크', description: '업종', required: true, examples: ['B2B SaaS', 'DTC 이커머스', '헬스케어 테크'] },
      { name: 'target_keyword', placeholder: '예: 프로젝트 관리 소프트웨어', description: '클러스터 기반 메인 키워드', required: true, examples: ['AI 글쓰기 도구', '프롬프트 엔지니어링 강좌'] },
      { name: 'target_audience', placeholder: '예: 소규모 사업자', description: '도달하려는 대상', required: true, examples: ['마케팅 매니저', '스타트업 창업자', '프리랜서 디자이너'] },
    ],
    difficulty: 'advanced',
    expectedScore: 92,
    usageCount: 3420,
    tags: ['seo', '키워드', '콘텐츠 전략', '검색 의도'],
  },

  // ─── 콘텐츠 마케팅 ───
  {
    id: 'content-thought-leadership',
    category: 'content_marketing',
    title: '사고 리더십 아티클',
    description: '브랜드를 업계 전문가로 포지셔닝하는 매력적인 사고 리더십 글을 작성합니다',
    template: `당신은 {{company_description}}인 {{company_name}}의 시니어 콘텐츠 전략가입니다.

과제: {{target_publication}}에 "{{topic}}"에 대한 사고 리더십 아티클을 작성해 주세요.

대상 독자: {{audience_description}}

구조:
1. 훅: 도발적 인사이트나 반대 의견으로 시작 (2-3문장)
2. 문제 제기: 왜 지금 중요한지 (1단락)
3. 핵심 주장: 3가지 근거가 있는 독자적 관점
4. 증거: 업계 데이터, 트렌드, 사례 연구 참조
5. 실행 가능한 시사점: 독자가 다음에 해야 할 것 (3-5개 항목)
6. 마무리: 전문성을 강화하는 미래 지향적 선언

톤: {{tone}} — 권위 있지만 접근 가능, 업계 표준이 아닌 한 전문 용어 피하기
글자 수: {{word_count}}자
형식: H2/H3 헤더가 있는 마크다운

제약:
- AI스러운 일반적 표현 금지 ("빠르게 변화하는 오늘날의 세계에서...")
- 구체적 데이터 포인트나 통계 2-3개 포함
- 모든 주장은 근거가 있어야 함
- 명확하고 기억에 남는 한 줄로 마무리`,
    variables: [
      { name: 'company_name', placeholder: '예: 에이코프', description: '회사명', required: true, examples: ['ScoreMyPrompt', 'TechFlow'] },
      { name: 'company_description', placeholder: '예: AI 기반 생산성 플랫폼', description: '간략한 회사 설명', required: true, examples: ['AI 프롬프트 평가 SaaS'] },
      { name: 'topic', placeholder: '예: 마케팅에서 AI의 미래', description: '아티클 주제', required: true, examples: ['프롬프트 엔지니어링이 새로운 리터러시인 이유'] },
      { name: 'target_publication', placeholder: '예: TechCrunch, LinkedIn', description: '게재할 곳', required: false, examples: ['Medium', '회사 블로그', 'HBR'] },
      { name: 'audience_description', placeholder: '예: CMO와 마케팅 디렉터', description: '읽을 사람', required: true, examples: ['테크에 밝은 마케터', 'C-레벨 임원'] },
      { name: 'tone', placeholder: '예: 전문적이지만 대화체', description: '글의 톤', required: false, examples: ['대담하고 주관적', '데이터 중심의 분석적'] },
      { name: 'word_count', placeholder: '예: 1500', description: '목표 글자 수', required: false, examples: ['1200', '2000', '800'] },
    ],
    difficulty: 'advanced',
    expectedScore: 95,
    usageCount: 2890,
    tags: ['콘텐츠', '사고 리더십', '블로그', '브랜드 권위'],
  },

  // ─── 소셜 미디어 ───
  {
    id: 'social-campaign-series',
    category: 'social_media',
    title: '소셜 미디어 캠페인 시리즈',
    description: '플랫폼별 콘텐츠가 포함된 1주일 소셜 미디어 캠페인을 생성합니다',
    template: `당신은 {{brand_name}}의 크로스 플랫폼 소셜 미디어 전략가입니다.

과제: {{campaign_goal}}을 위한 7일 소셜 미디어 캠페인을 만들어 주세요.

캠페인 상세:
- 제품/서비스: {{product}}
- 타겟 오디언스: {{audience}}
- 핵심 메시지: {{key_message}}
- 캠페인 해시태그: {{hashtag}}

산출물 (매일):
1. LinkedIn 포스트 (전문적 톤, 150-200자, 훅 질문 포함)
2. Twitter/X 스레드 (5-7개 트윗, 각 280자 이내, 번호 부여)
3. Instagram 캡션 (캐주얼 톤, 100-150자, 관련 해시태그 5-10개 포함)

요구사항:
- 1일차: 인지도 — 문제 소개
- 2-3일차: 교육 — 인사이트와 데이터 공유
- 4일차: 소셜 프루프 — 고객 사례나 후기
- 5일차: 비하인드 — 과정 보여주기
- 6일차: 참여 — 설문, 질문, 챌린지
- 7일차: CTA — 전환 유도

형식: 일별 정리, 그 안에 플랫폼별. 이모지 제안과 최적 발행 시간(KST) 포함.

제약:
- 클릭베이트나 허위 주장 금지
- 각 포스트는 독립적이면서 캠페인 내러티브와 연결
- 매일 최소 하나의 데이터 포인트 포함`,
    variables: [
      { name: 'brand_name', placeholder: '예: ScoreMyPrompt', description: '브랜드명', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'campaign_goal', placeholder: '예: 제품 출시 인지도', description: '달성하고자 하는 것', required: true, examples: ['새 기능 출시', '브랜드 인지도', '리드 생성'] },
      { name: 'product', placeholder: '예: AI 프롬프트 채점 도구', description: '홍보할 것', required: true, examples: ['AI 프롬프트 평가 플랫폼'] },
      { name: 'audience', placeholder: '예: 마케팅 전문가', description: '타겟 오디언스', required: true, examples: ['AI 열정가', '프롬프트 엔지니어', '콘텐츠 크리에이터'] },
      { name: 'key_message', placeholder: '예: 더 나은 프롬프트, 더 나은 결과', description: '핵심 캠페인 메시지', required: true, examples: ['30초 만에 프롬프트를 채점하세요'] },
      { name: 'hashtag', placeholder: '예: #ScoreMyPrompt', description: '캠페인 해시태그', required: true, examples: ['#PromptScore', '#더나은프롬프트'] },
    ],
    difficulty: 'intermediate',
    expectedScore: 90,
    usageCount: 4150,
    tags: ['소셜 미디어', '캠페인', '멀티 플랫폼', '콘텐츠 캘린더'],
  },

  // ─── 이메일 캠페인 ───
  {
    id: 'email-drip-sequence',
    category: 'email_campaign',
    title: '이메일 드립 캠페인 시퀀스',
    description: '무료 사용자를 유료로 전환시키는 5통 온보딩 시퀀스를 생성합니다',
    template: `당신은 {{product_description}}인 {{company_name}}의 이메일 마케팅 전문가입니다.

과제: 무료 체험 사용자를 유료 고객으로 전환하는 5통 이메일 드립 캠페인을 설계해 주세요.

사용자 맥락:
- {{product}} 무료 체험에 방금 가입
- 핵심 페인 포인트: {{pain_point}}
- 경쟁 대안: {{competitors}}

이메일 시퀀스:
이메일 1 (0일차 - 환영):
  - 제목줄 (A/B: 2가지 옵션, 50자 이내)
  - 미리보기 텍스트 (90자 이내)
  - 본문: 환영, 빠른 시작 가이드, 핵심 행동 1가지
  - CTA: "첫 {{action}} 시작하기"

이메일 2 (2일차 - 빠른 성과):
  - 첫 번째 성공 경험 도달 지원
  - 구체적 하우투 단계 포함
  - CTA: 고급 기능 시도

이메일 3 (5일차 - 소셜 프루프):
  - 사례 연구나 후기
  - 지표 중심: "X를 한 사용자는 Y% 개선을 경험"
  - CTA: 결과 대시보드 보기

이메일 4 (8일차 - 가치 해제):
  - 놓치고 있는 프리미엄 기능 보여주기
  - 무료 vs 프로 기능 비교
  - CTA: {{offer}}으로 업그레이드

이메일 5 (12일차 - 긴급감):
  - 체험 종료 알림
  - 지금까지의 성과 요약
  - 한정 혜택 제공
  - CTA: 지금 업그레이드

형식: 각 이메일에 제공: 제목(A/B 2가지) | 미리보기 텍스트 | 본문(150-250자) | CTA 버튼 텍스트 | 발송 시간 추천

제약:
- 제목줄은 호기심을 유발하되 클릭베이트 금지
- 각 이메일은 독립적(모든 사람이 모든 이메일을 열지 않음)
- 모바일 친화적 포맷(짧은 단락, 명확한 CTA)
- 구독 취소 규정 준수 안내 포함`,
    variables: [
      { name: 'company_name', placeholder: '예: ScoreMyPrompt', description: '회사명', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'product_description', placeholder: '예: AI 프롬프트 평가 도구', description: '간략한 제품 설명', required: true, examples: ['AI 기반 프롬프트 채점 플랫폼'] },
      { name: 'product', placeholder: '예: 프롬프트 채점', description: '제품명', required: true, examples: ['ScoreMyPrompt 프로'] },
      { name: 'pain_point', placeholder: '예: 일반적인 AI 출력 받기', description: '주요 사용자 페인 포인트', required: true, examples: ['비효과적 프롬프트에 시간 낭비'] },
      { name: 'competitors', placeholder: '예: PromptPerfect, ChatGPT 팁 블로그', description: '주요 대안', required: true, examples: ['수동 프롬프트 테스트', '프롬프트 엔지니어링 강좌'] },
      { name: 'action', placeholder: '예: 프롬프트 분석', description: '핵심 제품 행동', required: true, examples: ['프롬프트 채점', 'AI 평가'] },
      { name: 'offer', placeholder: '예: 연간 플랜 30% 할인', description: '업그레이드 인센티브', required: false, examples: ['첫 달 20% 할인', '체험 연장'] },
    ],
    difficulty: 'advanced',
    expectedScore: 94,
    usageCount: 2340,
    tags: ['이메일', '드립 캠페인', '전환', '온보딩', 'saas'],
  },

  // ─── UX 라이팅 ───
  {
    id: 'ux-microcopy-system',
    category: 'ux_writing',
    title: 'UX 마이크로카피 시스템',
    description: '에러, 빈 상태, CTA를 포함한 일관된 제품 마이크로카피를 생성합니다',
    template: `당신은 {{product_type}}인 {{company_name}}의 UX 라이터입니다.

브랜드 보이스: {{brand_voice}}
대상: {{audience}}

과제: 다음 UI 상태에 대한 포괄적 마이크로카피 가이드를 만들어 주세요:

1. 빈 상태 (5가지 변형):
   - 첫 사용자 (데이터 없음)
   - 결과 없는 검색
   - 일치하지 않는 필터 뷰
   - 콘텐츠 로딩 에러
   - 현재 플랜에서 사용 불가 기능

2. 에러 메시지 (5가지 유형):
   - 폼 유효성 검사 에러
   - 네트워크/연결 에러
   - 서버 에러 (500)
   - 권한 거부
   - 요청 횟수 제한 초과

3. 성공 메시지 (4가지 유형):
   - 행동 완료
   - 항목 저장/생성됨
   - 설정 업데이트됨
   - 업그레이드 성공

4. CTA 버튼 (6가지 변형):
   - 주요 행동
   - 보조 행동
   - 삭제 행동
   - 업그레이드 유도
   - 공유/초대
   - 더 알아보기

5. 툴팁 & 온보딩 (4단계):
   - 기능 소개
   - 첫 행동 안내
   - 프로 팁
   - 키보드 단축키 힌트

형식: 각 항목에 대해:
- 카피 텍스트 (UI 요소는 120자 이내)
- 대안 버전
- 톤/의도 노트

제약:
- 도움을 주되 비난하지 않기 ("찾을 수 없습니다"가 아닌 "검색 결과가 없습니다")
- 능동태 사용
- 기술 전문 용어 금지
- 에러 메시지에 행동 지향적 복구 단계 포함
- 일관된 대문자 사용 (본문은 문장형, 버튼은 제목형)`,
    variables: [
      { name: 'company_name', placeholder: '예: ScoreMyPrompt', description: '제품명', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'product_type', placeholder: '예: AI 분석 대시보드', description: '제품 유형', required: true, examples: ['AI 프롬프트 평가 플랫폼', 'SaaS 대시보드'] },
      { name: 'brand_voice', placeholder: '예: 친절하고, 전문적이며, 약간 위트 있는', description: '브랜드 보이스 특성', required: true, examples: ['전문적이지만 친근한', '기술적이지만 명확한'] },
      { name: 'audience', placeholder: '예: 마케팅 전문가', description: '주 사용자', required: true, examples: ['개발자와 마케터', '비기술 전문가'] },
    ],
    difficulty: 'intermediate',
    expectedScore: 91,
    usageCount: 1890,
    tags: ['ux 라이팅', '마이크로카피', '제품', 'ui 텍스트'],
  },

  // ─── 전략 ───
  {
    id: 'gtm-strategy',
    category: 'strategy',
    title: 'GTM(시장 진입) 전략',
    description: '신제품 또는 기능 출시를 위한 포괄적 GTM 전략을 생성합니다',
    template: `당신은 {{industry}} 제품 출시 경험이 있는 VP of Growth입니다.

과제: {{product_name}}을 위한 90일 시장 진입 전략을 만들어 주세요.

제품: {{product_description}}
타겟 시장: {{target_market}}
가격: {{pricing_model}}
경쟁 우위: {{differentiator}}

산출물:

1. 경영진 요약 (200자 이내)

2. 타겟 고객 프로필:
   - 주요 페르소나 (인구통계, 행동, 페인 포인트)
   - 보조 페르소나
   - 안티 페르소나 (우리 고객이 아닌 사람)

3. 포지셔닝:
   - 포지셔닝 선언문 (클래식 형식)
   - 태그라인 옵션 (3가지)
   - 핵심 메시지 필러 (3개)

4. 채널 전략:
   - 예상 ROI 순으로 정렬된 획득 채널
   - 각 채널: 전술, 예산 배분 %, 타임라인, KPI

5. 90일 마일스톤 계획:
   - 1-30일: 기반 (빌드/준비할 것)
   - 31-60일: 런칭 (모멘텀 만드는 법)
   - 61-90일: 스케일 (가속하는 법)

6. 지표 & KPI:
   - 핵심 지표
   - 선행 지표 (5개)
   - 후행 지표 (3개)
   - 주간/월간 목표

형식: 명확한 헤더와 적절한 테이블이 있는 구조화된 문서.

제약:
- 스타트업 예산 가정 (엔터프라이즈 마케팅 비용 아님)
- 유기적/저비용 채널 우선
- 모든 추천에 예상 타임라인과 측정 가능한 결과 포함
- 구체적으로: "소셜 미디어 활용"이 아닌 "LinkedIn에 주 3회 포스팅"`,
    variables: [
      { name: 'industry', placeholder: '예: AI/SaaS', description: '업종', required: true, examples: ['AI SaaS', '에듀테크', '핀테크'] },
      { name: 'product_name', placeholder: '예: ScoreMyPrompt 프로', description: '제품명', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'product_description', placeholder: '예: AI 기반 프롬프트 평가 도구', description: '간략한 제품 설명', required: true, examples: ['6가지 차원으로 프롬프트를 채점하는 AI 도구'] },
      { name: 'target_market', placeholder: '예: SMB 마케팅 팀', description: '타겟 시장', required: true, examples: ['AI에 능숙한 전문가', '마케팅 팀'] },
      { name: 'pricing_model', placeholder: '예: 프리미엄 + 월 $19 프로 티어', description: '가격 구조', required: true, examples: ['무료 티어 + 월 $19 프로'] },
      { name: 'differentiator', placeholder: '예: 유일한 6차원 채점 도구', description: '핵심 경쟁 우위', required: true, examples: ['실시간 멀티 모델 프롬프트 채점'] },
    ],
    difficulty: 'advanced',
    expectedScore: 96,
    usageCount: 5200,
    tags: ['전략', 'gtm', '런칭', '마케팅 계획'],
  },
];

/**
 * 템플릿 검색
 */
export function searchTemplates(query: string, category?: TemplateCategory): PromptTemplate[] {
  const q = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(t => {
    const matchesCategory = !category || t.category === category;
    const matchesQuery = !query ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.includes(q));
    return matchesCategory && matchesQuery;
  });
}

/**
 * 템플릿에 변수 적용
 */
export function applyTemplate(template: PromptTemplate, values: Record<string, string>): string {
  let result = template.template;
  template.variables.forEach(v => {
    const value = values[v.name] || v.placeholder;
    result = result.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), value);
  });
  return result;
}

/**
 * 카테고리별 인기 템플릿
 */
export function getPopularTemplates(limit = 5): PromptTemplate[] {
  return [...PROMPT_TEMPLATES]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
