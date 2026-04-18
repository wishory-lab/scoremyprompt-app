# Sprint 4 — Free Beta + Korean Market + Tech Debt

**Date:** 2026-04-17
**Status:** Draft
**Author:** Claude + Luke

---

## 0. Executive Summary

Shift ScoreMyPrompt from an unpaid Pro paywall to a **free beta model** with generous usage limits (50/account lifetime, 300/week global). Pricing is displayed but no payment is collected — users get full Pro features for free during beta. Simultaneously, add path-based i18n for Korean SEO, complete all 10-language translations, fix critical test gaps, and ship performance improvements.

**Why now:** Luke is 예비창업자 (pre-entrepreneur, no business registration). Payment processing requires 사업자등록 which comes after Modoo 2026 selection. The beta model lets judges and early users experience the full product while pricing intent is communicated.

---

## 1. Beta Quota System

### Strategy

```
Before Sprint 4:
  Free tier: 10 prompts/day, limited features
  Pro tier: $4.99/month, unlimited (but Stripe not activated)

After Sprint 4:
  Beta tier: ALL Pro features free, with limits:
    · 50 total uses per account (lifetime during beta)
    · 300 uses per week (global, across all accounts — prevents abuse)
    · Covers: /api/analyze + /api/harness/analyze + /api/builder/generate
  Pricing page: shows ₩4,900 / $4.99 pricing but CTA = "Start Free Beta"
```

### Database

Add columns to `user_profiles`:

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS beta_uses_total int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS beta_week_start timestamptz,
  ADD COLUMN IF NOT EXISTS beta_uses_week int DEFAULT 0;
```

### API Changes

New helper `app/lib/beta-quota.ts`:
- `checkBetaQuota(userId)` — returns `{ allowed, remaining, reason? }`
- `incrementBetaUse(userId)` — bumps counters, resets week if needed
- Constants: `BETA_PER_ACCOUNT = 50`, `BETA_PER_WEEK = 300`

Modified routes (3):
- `app/api/analyze/route.ts` — add beta quota check after rate-limit, before Claude call
- `app/api/harness/analyze/route.ts` — same pattern
- `app/api/builder/generate/route.ts` — same pattern (already has per-month quota; beta quota is additional)

On quota exhaustion: return `402` with:
```json
{
  "error": "Beta limit reached",
  "code": "BETA_QUOTA_EXHAUSTED",
  "message": "You've used all 50 beta analyses. Full access coming soon at ₩4,900/mo.",
  "remaining": { "account": 0, "weeklyGlobal": 187 }
}
```

### Feature Flag

New flag: `BETA_MODE` in `DEV_ONLY` → promote to `DEFAULT_ENABLED` when ready.

When `BETA_MODE` is ON:
- All authenticated users get Pro-level access (bypass Stripe tier check)
- Beta quota enforced instead of daily free-tier limit
- Pricing page shows beta CTA instead of Stripe checkout

When `BETA_MODE` is OFF:
- Reverts to standard Free/Pro with Stripe (Sprint 5+)

### Anonymous Users

Anonymous (not signed in) users keep the existing rate: 10/day prompt scoring only, no harness/builder access. Beta quota only applies to signed-in users — this incentivizes sign-up.

---

## 2. Pricing Page — Beta Mode

### UI Changes

When `BETA_MODE` is on:

```
┌─────────────────────────────┐
│  🚀 PRE-LAUNCH BETA         │
│  모든 Pro 기능 무료 체험      │
│                              │
│  정식 출시 시 ₩4,900/월      │
│  ($4.99 for international)   │
│                              │
│  [무료 베타 시작하기]          │  ← sign-up/sign-in CTA
│                              │
│  계정당 50회 · 주간 300회     │
│  가입만 하면 즉시 Pro 접근     │
└─────────────────────────────┘
```

**Pro card keeps all features listed** — user sees what they'll get. Price is shown as "future price" not "current price". CTA triggers sign-up modal, not Stripe checkout.

**Legacy Pro badge logic**: stays intact but dormant (no Legacy users during beta). Will activate when `BETA_MODE` turns OFF and `PRICING_V2` turns ON.

---

## 3. Path-Based i18n

### Architecture

Middleware URL rewrite — **zero folder restructure**.

```
Request: GET /ko/pricing
  → middleware extracts locale 'ko' from path
  → sets cookie 'smp_locale=ko' + header 'x-locale=ko'
  → rewrites URL to /pricing (Next.js sees original route)
  → provider.tsx reads cookie on mount → loads ko.ts
  → <html lang="ko"> set via document.documentElement.lang
```

### URL Pattern

```
/                → English (default, no prefix)
/ko/             → Korean
/ja/             → Japanese
/zh-CN/          → Simplified Chinese
... etc for all 10 SUPPORTED_LOCALES
```

### Middleware Changes

In `middleware.ts`, before existing logic:

```typescript
// Extract locale prefix from path
const localeMatch = pathname.match(/^\/(ko|ja|zh-CN|zh-TW|es|fr|de|pt|hi)(\/|$)/);
if (localeMatch) {
  const locale = localeMatch[1];
  const strippedPath = pathname.replace(`/${locale}`, '') || '/';
  const response = NextResponse.rewrite(new URL(strippedPath, request.url));
  response.cookies.set('smp_locale', locale, { path: '/' });
  response.headers.set('x-locale', locale);
  response.headers.set('Content-Language', locale);
  return response;
}
```

### Internal Links

Existing `<Link href="/pricing">` stays as-is — they work for English users. For locale-aware linking, add a `useLocalizedHref(path)` hook:

```typescript
function useLocalizedHref(path: string): string {
  const { locale } = useLocale();
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}
```

Usage is opt-in, not forced. The middleware handles incoming locale-prefixed URLs; internal navigation doesn't require prefixes but CAN use them for SEO-friendly crawling.

---

## 4. hreflang SEO Restoration

After path-based i18n is live, re-add hreflang alternates to `sitemap.ts`:

```typescript
function hreflangMap(path: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    m[loc] = loc === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${loc}${path}`;
  }
  m['x-default'] = `${baseUrl}${path}`;
  return m;
}
```

Apply to: home, pricing, guides, harness, builder, launch.

---

## 5. 8-Language Translation Completion

Script `scripts/translate-harness-keys.ts` already handles `homeEntry`, `harness`, `builder` namespaces. Run it with `ANTHROPIC_API_KEY` to populate the 8 remaining locales (de, es, fr, hi, ja, pt, zh-CN, zh-TW). Korean is already done via Opus.

**No code changes needed** — just script execution. Listed here as a deployment action.

---

## 6. Auth + Stripe Webhook Tests

### New Test Suites

**`__tests__/api/stripe-webhook.test.ts`**
- Valid signature → user tier updated to 'pro'
- Invalid signature → 401 rejected
- Missing webhook secret → 200 (graceful degradation)
- checkout.session.completed with pricingPlan metadata → pricing_plan column set
- customer.subscription.deleted → tier reverted to 'free', pricing_plan cleared

**`__tests__/lib/beta-quota.test.ts`**
- Fresh user → allowed, 50 remaining
- User at limit → denied with correct error
- Week reset logic → counter resets after 7 days
- Increment → counter increases by 1

**`__tests__/middleware.test.ts`**
- `/ko/pricing` → rewrite to `/pricing` with locale cookie
- `/pricing` (no prefix) → pass through unchanged
- Protected API route without auth → 401
- CSRF check on POST without valid origin → 403

---

## 7. OG/Badge ISR + Builder Self-Score

### OG Image Caching

`/api/og/harness` currently recomputes on every request. Add `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` header so Vercel CDN caches the response for 1 hour.

### Builder Self-Score

After the builder generates a file map, run the HARNES evaluator on the generated `CLAUDE.md` content internally (same Haiku call pattern as `/api/harness/analyze`). Return the score alongside the file preview.

Add to `BuilderGenerateResponse`:
```typescript
selfScore?: {
  total: number;
  tier: string;
  scores: { H: number; A: number; R: number; N: number; E: number; S: number };
};
```

Display on `/builder/result/[id]` as a badge: "Your generated setup scored 82/100 (Proficient)".

---

## 8. Feature Flags Summary

| Flag | Default | When ON |
|---|---|---|
| `BETA_MODE` | `DEV_ONLY` → promote to `DEFAULT_ENABLED` | Free beta active, Stripe checkout hidden, beta quota enforced |
| `TOSS_PAYMENTS` | `DEV_ONLY` (future Sprint 5+) | Toss Payments checkout visible for Korean users |
| Existing flags | Unchanged | `HARNESS_SCORE`, `BUILDER`, `PRICING_V2`, `SEO_HUB_EXT` |

---

## 9. Out of Scope

- Toss Payments actual integration (Sprint 5, post-사업자등록)
- Stripe payment activation (Sprint 5)
- Team plan dashboard
- Template marketplace
- API access for Pro
- console.log / PostHog event cleanup (minor, defer)

---

## 10. Rollback Plan

```
BETA_MODE OFF → reverts to Free 10/day + Pro paywall (Sprint 3 behavior)
Path i18n: /ko/ URLs → middleware skips, returns 404 naturally
```

---

## 11. Success Metrics

| Metric | Target |
|---|---|
| Beta sign-ups (7 days post-launch) | 100+ |
| Korean organic sessions /ko/ | +200% vs pre-i18n |
| Beta→quota-exhaustion conversion | >5% (validates demand) |
| Test coverage (new suites) | +3 suites, +20 tests |
| Build time | No regression |

---

**End of Sprint 4 Spec**
