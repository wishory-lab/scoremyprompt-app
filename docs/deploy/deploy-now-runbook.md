# Deploy Now — Sprint 1+2+3 프로덕션 활성화 런북

**소요 시간**: 약 60–90분 (Luke 수동 작업)
**목표**: 모두의창업 심사위원이 scoremyprompt.app 방문 시 Sprint 1+2+3 기능이 전부 작동하도록.

---

## ⏱ 순서 요약

```
1. Supabase 마이그레이션 (15분)
2. Stripe $4.99 가격 생성 (5분)
3. Vercel env 업데이트 (10분)
4. PR #1 merge + Vercel redeploy (5분)
5. Smoke test (15분)
6. (선택) Grandfathering 이메일 발송
7. (선택) AdSense 신청 시작 (승인 2-4주)
```

---

## 1️⃣ Supabase 마이그레이션

**파일**: `docs/deploy/supabase-combined.sql`

**절차**:
1. https://app.supabase.com → ScoreMyPrompt 프로젝트
2. 좌측 SQL Editor 클릭 → "New query"
3. `docs/deploy/supabase-combined.sql` 전체 복사 → 붙여넣기
4. "Run" 버튼 (Ctrl/Cmd + Enter)
5. 출력 검증 (맨 아래 SELECT 3개 쿼리 결과):
   - `harness_scores`: exists=1, policies=3
   - `builder_outputs`: exists=1, policies=3
   - `builder_quota`: exists=1, policies=3
   - `user_profiles.pricing_plan`: exists=1
   - 기존 Pro 유저 수만큼 `legacy_999` 행 존재 확인

**pg_cron 실패 시**:
- Supabase Free 플랜은 pg_cron 미지원. Pro/Team 플랜 필요.
- 임시 대안: Vercel Cron 라우트 (`app/api/cron/builder-ttl/route.ts`) 구현 — Sprint 4 작업으로 이연.

---

## 2️⃣ Stripe $4.99 가격 생성

1. https://dashboard.stripe.com → Products
2. "ScoreMyPrompt Pro" 제품 선택 (또는 신규 생성)
3. "Add a price" → Recurring, Monthly, USD 4.99
4. Save → 생성된 `price_...` ID 복사
5. Vercel env `STRIPE_PRICE_ID_499`에 붙여넣기 (다음 단계)

**중요**:
- 기존 `STRIPE_PRICE_ID` (9.99)는 **절대 삭제/archive 하지 말 것**. Legacy 구독자 결제에 계속 사용됨.
- Stripe Tax + Adaptive Pricing 토글 (Settings → Tax / International) — Sprint 3 스펙에 포함된 글로벌 결제 준비.

---

## 3️⃣ Vercel 환경변수

**파일**: `docs/deploy/vercel-env.txt` (복붙용)

**절차**:
1. https://vercel.com → ScoreMyPrompt 프로젝트 → Settings → Environment Variables
2. vercel-env.txt 에 명시된 3개 신규 추가:
   - `NEXT_PUBLIC_FEATURES` (플래그 12개 쉼표 구분)
   - `STRIPE_PRICE_ID_499` (2단계에서 복사한 price id)
   - `NEXT_PUBLIC_PRODUCTHUNT_POST_ID` (선택, PH 포스트 생성 전엔 비워둠)
   - `ADMIN_API_TOKEN` (openssl rand -base64 32로 생성한 시크릿)
3. Scope: **Production + Preview** 둘 다 선택
4. Save

---

## 4️⃣ PR #1 merge + 재배포

1. https://github.com/wishory-lab/scoremyprompt-app/pull/1
2. "Merge pull request" → main 브랜치로 머지
3. Vercel이 자동 감지 → 배포 시작 (~3분)
4. https://vercel.com/...  에서 배포 상태 확인
5. ✅ "Ready" 확인

---

## 5️⃣ Smoke Test

**scoremyprompt.app 방문 후 체크**:

### 데스크탑
- [ ] 홈: 3-카드 (Score a Prompt · Score a Setup · Build a Setup) 표시
- [ ] 홈 stats: "Daily 10 · PROMPT · ⚡ 5s" (허위 5,000+ 사라짐)
- [ ] `/harness`: 랜딩 로드, 폼 입력 후 결과 페이지 리다이렉트
- [ ] `/builder`: 로그인 유도 → 로그인 후 5-step wizard 진입
- [ ] `/launch?ref=producthunt`: PH 뱃지 표시 (env 설정 시)
- [ ] `/pricing`: Pro 가격 $4.99 표시

### 모바일 (Chrome DevTools 375×812 또는 실제 폰)
- [ ] 3-카드 stack 정상
- [ ] Builder wizard 버튼 터치 크기 충분
- [ ] FooterSticky 광고 슬롯 (consent 전엔 placeholder)

### 한국어
- [ ] `?lang=ko` 쿼리 or 브라우저 locale=ko → 3-카드 한국어로 렌더
- [ ] `/harness` 한국어
- [ ] `/builder` 한국어

### 쿠키 동의
- [ ] 첫 방문 시 1.5초 후 배너 표시
- [ ] "Essential Only" → AdSense 스크립트 로드 안 됨 (DevTools Network 확인)
- [ ] "Accept All" → AdSense 로드

### API
- [ ] `POST /api/harness/analyze` 200 (Postman or curl)
- [ ] `GET /api/og/harness?id=nonexistent` → 이미지 응답 (1200x630)

---

## 6️⃣ Grandfathering 이메일 (선택, 플래그 활성화 72h 전)

Legacy Pro 사용자에게 "$9.99 유지" 안내.

```bash
# Supabase SQL Editor:
SELECT email FROM user_profiles
INNER JOIN auth.users ON user_profiles.id = auth.users.id
WHERE user_profiles.pricing_plan = 'legacy_999';
# → 이메일 리스트 확보

# 로컬 또는 curl:
curl -X POST https://scoremyprompt.app/api/account/grandfathering-email \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_API_TOKEN" \
  -d '{"recipients":["email1@example.com","email2@example.com"]}'
# → { scheduled: 2, delivered: 2, errors: 0 } 기대
```

---

## 7️⃣ AdSense 신청 (선택, 승인 2-4주)

1. https://adsense.google.com → New property → scoremyprompt.app
2. 승인 대기
3. 승인 후:
   - Ad Units: Leaderboard + Rectangle 생성
   - Vercel env에 `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD`, `NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE` 추가
   - 재배포

---

## 🚨 롤백 플랜

문제 발생 시:

```
증상: 결제 안 됨 / 유저 tier 인식 안 됨
→ Vercel env에서 STRIPE_PRICE_ID_499 제거 + NEXT_PUBLIC_FEATURES에서 PRICING_V2 제거
→ 재배포. 기존 $9.99 가격으로 fallback.

증상: /harness, /builder 500 에러
→ NEXT_PUBLIC_FEATURES에서 HARNESS_SCORE, BUILDER 제거
→ 재배포. 해당 라우트가 404로 전환됨.

증상: 광고 안 나옴
→ 정상. AdSense는 별도 승인 필요. 런칭엔 영향 없음.
```

---

## ⏳ 완료 후 다음 작업 (Modoo 2026 제출)

1. ✅ 5개 스크린샷 캡처 (`docs/modoo-2026/image-checklist.md`)
2. ✅ 45초 숏폼 촬영 + YouTube Shorts 업로드 (`docs/modoo-2026/shortform-script.md`)
3. ✅ modoo.or.kr 폼에 9개 필드 입력 (`docs/modoo-2026/application-fields.md`)
4. ✅ 4/22 (화) 최종 제출 + 알림톡 수령 확인

---

**이 런북 따라서 완료 시점에 scoremyprompt.app이 Sprint 1+2+3 전체 기능 live 상태가 됩니다.**
