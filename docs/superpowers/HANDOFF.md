# 세션 핸드오프 — Sprint 4 실행 중 (38% 완료)

**다음 Claude Code 세션에서 이 파일을 먼저 읽고 이어서 진행하세요.**

## 현재 상태

- **브랜치**: `claude/peaceful-hodgkin` (워크트리)
- **워크트리 경로**: `C:\Users\wisho\scoremyprompt-app\.claude\worktrees\peaceful-hodgkin`
- **PR**: https://github.com/wishory-lab/scoremyprompt-app/pull/1
- **마지막 커밋**: `b743070` (T5 analytics)
- **실행 중인 플랜**: `docs/superpowers/plans/2026-04-17-sprint-4-beta-korea-techdebt.md`

## Sprint 4 진행 상황

| # | Task | 상태 | 커밋 |
|---|---|---|---|
| T1 | DB 006 beta_quota columns | ✅ | `657e1cb` |
| T2 | BETA_MODE feature flag | ✅ | `bac3a1a` |
| T3 | beta-quota helper (9 tests pass) | ✅ | `dc95600` |
| T4 | Wire beta quota → analyze + harness + builder | ✅ | `bb81b05` |
| T5 | analytics trackBetaQuotaHit | ✅ | `b743070` |
| **T6** | **Pricing page beta UI** | ⏳ 다음 | — |
| T7 | Pricing metadata (dynamic) | ⏳ | — |
| T8 | Middleware i18n rewrite (/ko/, /ja/) | ⏳ | — |
| T9 | Provider cookie + useLocalizedHref hook | ⏳ | — |
| T10 | hreflang sitemap 복원 | ⏳ | — |
| T11 | Stripe webhook tests (3) | ⏳ | — |
| T12 | OG cache + Builder self-score | ⏳ | — |
| T13 | Middleware i18n tests (4) | ⏳ | — |

**테스트 상태**: 20/20 pass (harness + builder + analyze 회귀 클린).

## 다음 세션 시작 프롬프트

새 Claude Code 세션에서 이렇게 말씀하시면 됩니다:

```
docs/superpowers/HANDOFF.md 읽고 Sprint 4 T6부터 이어서 진행해줘.
Subagent-Driven 모드.
```

Claude가 핸드오프 문서 읽고 → 플랜 파일 읽고 → T6부터 실행.

## 세션 최적화 팁 (다음에 참고)

**컨텍스트 절약 체크리스트:**

1. **긴 파일 읽지 말고 `Grep`/`head`로 범위 좁히기** — 파일 전체 Read는 해당 task에 필요할 때만
2. **서브에이전트에 작업 위임** — controller(본 세션) 컨텍스트를 경량으로 유지. 긴 코드 블록은 서브에이전트가 생성/검토하고 요약만 반환
3. **플랜 주도 개발** — 플랜 파일이 있으면 session 간 이어서 작업 가능. 신규 요청을 바로 구현하지 말고 플랜부터 만들기
4. **Task 단위로 커밋** — 각 task 끝에 즉시 commit+push. 세션 중단되어도 손실 0
5. **한 세션 = 하나의 스프린트** 권장 — 3-4개 스프린트를 한 세션에 넣으면 반드시 컨텍스트 한계 도달
6. **`/clear` 또는 새 세션** — 75% 넘으면 지체 없이 전환. 핸드오프 문서만 있으면 문제없음

**현재 이 프로젝트 적정 세션 분할:**

```
세션 1: Sprint 1 (Harness Score)           ✅ 완료
세션 2: Sprint 2 (Harness Builder)         ✅ 완료  
세션 3: Sprint 3 (Pricing + SEO + Launch)  ✅ 완료
세션 4: 시스템 감사 + 업그레이드            ✅ 완료
세션 5: Modoo 제출 패키지                    ✅ 완료
세션 6: Sprint 4 (현재 — T1~T5 완료)         ⏳ T6부터 새 세션
```

Sprint 4를 독립 세션으로 시작했으면 완주 가능했을 것. 앞으로 Sprint 5+는 각각 새 세션으로.

## Sprint 4 남은 범위 요약

**3개 그룹으로 묶어서 처리 가능:**

### Group A — Pricing beta UI (T6 + T7)
- `app/pricing/PricingClient.tsx`에서 `isFeatureEnabled(FEATURES.BETA_MODE)` 분기
- Beta 시: "Start Free Beta" 버튼 + "50 uses/account · 300/week" 뱃지
- Korean locale → ₩4,900 표시
- `app/pricing/page.tsx` metadata를 동적으로

### Group B — Path-based i18n (T8 + T9 + T10 + T13)
- `middleware.ts` 상단에 `/ko/...` 패턴 매치 → rewrite + cookie
- `app/i18n/provider.tsx` 초기화 로직에서 `smp_locale` 쿠키 최우선 읽기
- `app/hooks/useLocalizedHref.ts` 신규 생성
- `app/sitemap.ts` hreflang 복원 (path 기반)
- `__tests__/middleware.test.ts` (4 tests)

### Group C — Tech debt (T11 + T12)
- `__tests__/api/stripe-webhook.test.ts` (3 tests)
- OG 이미지 Cache-Control 헤더 추가
- Builder 자가점수 (HARNES 평가 → 응답에 selfScore)
- `BuilderResultClient`에 점수 뱃지

## 배포 전 수동 액션 (Luke)

Sprint 4 완료 후 추가되는 것:
- `supabase/migrations/006_beta_quota_columns.sql` 적용 (또는 `docs/deploy/supabase-combined.sql` 재실행)
- Vercel env에 `BETA_MODE` 추가 → `NEXT_PUBLIC_FEATURES=...,BETA_MODE`

## Modoo 2026 일정 리마인더

- 오늘 (4/17): 이미지 5장 캡처
- 4/18: 숏폼 45초 촬영 + YouTube 업로드
- 4/19–21: modoo.or.kr 폼 입력
- **4/22 (화) 최종 제출**

Sprint 4 T6~T13은 Modoo 제출과 무관하게 병렬로 진행 가능. Modoo가 우선이면 T6-T13은 Modoo 제출 후로 미뤄도 무방.
