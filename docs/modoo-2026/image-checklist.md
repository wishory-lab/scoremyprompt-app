# 제출 이미지 5장 체크리스트

공고상 jpg/png/gif 최대 5장 제출 가능 (선택사항이지만 필수로 채울 것).

## 목록

| # | 파일명 | 설명 | 캡처 방법 |
|---|--------|------|-----------|
| 1 | hero-screenshot.png | 랜딩 히어로 — 수치 교체 후 버전 | scoremyprompt.app 상단 캡처 |
| 2 | input-screen.png | 직무 선택 + 한국어 프롬프트 입력 | Product 선택 + "모두의창업 지원" 샘플 입력 |
| 3 | score-result.png | 평가 결과 — 점수·등급·퍼센타일 | 42점 D등급 화면 |
| 4 | dimension-breakdown.png | PROMPT 6차원 브레이크다운 | 결과 페이지 하단 6차원 바 차트 |
| 5 | ecosystem-diagram.png | Luke 5개 서비스 생태계 | 별도 제작 (Figma/Canva) |

## 주의사항

- 모든 스크린샷은 **랜딩 수치 교체 후** 캡처할 것 — 허위 5,000+ / 92% 수치가 남아있으면 안 됨
- 모바일 스크린샷 권장 (PWA 설치 가능한 모습이 강점으로 부각)
- 파일명은 영문·소문자로 통일
- 저장 위치: `docs/modoo-2026/assets/`

## 캡처 팁

### 1. hero-screenshot.png
- 1440×900 또는 1920×1080 데스크탑 뷰
- Dark theme이므로 그대로 캡처 — 브랜드 일관성 유지
- "Daily 10 · PROMPT · ⚡ 5s" 3개 팩트가 보이게

### 2. input-screen.png
- 추천 샘플 프롬프트 (모두의창업 맥락):
  ```
  모두의창업 2026 신속심사에 AI 프롬프트 평가 SaaS를 지원하려 합니다.
  문제인식 500자를 도와주세요.
  ```
- 이런 단순한 프롬프트 → 일부러 낮은 점수 나오게 유도 → 개선 전/후 대비 효과

### 3. score-result.png
- 점수 + 등급 + 퍼센타일 3개 요소가 모두 보이는 상단부만 크롭
- 추천: 42점 D등급 (개선 여지가 명확해 보이는 점수대)

### 4. dimension-breakdown.png
- PROMPT 6차원 막대 차트 부분만 크롭
- 각 차원별 점수와 개선 제안 일부가 보이게

### 5. ecosystem-diagram.png (별도 제작)
- Figma 또는 Canva에서 제작
- 구성안:
  ```
       [ScoreMyPrompt]
       scoremyprompt.app
      "AI 프롬프트 품질"
              |
      ────────┴────────
     |        |        |
  [BIZ360] [도파민]  [산단맵]
   biz360   mydopa   sandanmap
   제조HR   레트로미디어 전국121산단
     |        |        |
  [InfoHub]         [예약지킴]
  today.biz360       yyjk.kr
   산업정보         노쇼방지
  ```
- 1920×1080 PNG export
- 각 서비스의 URL 명시 (심사위원이 실제 접속 확인 가능)

## 제출 전 최종 확인

- [ ] 5장 모두 `docs/modoo-2026/assets/`에 저장됨
- [ ] 모든 스크린샷에서 수치 교체본이 반영됐는지 확인
- [ ] 각 파일 2MB 이하 (modoo.or.kr 업로드 제한 대응)
- [ ] PNG > JPG 우선 (선명도 우위)
