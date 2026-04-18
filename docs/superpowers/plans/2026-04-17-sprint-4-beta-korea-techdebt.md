# Sprint 4 — Free Beta + Korean i18n + Tech Debt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inactive Pro paywall with a free beta model (50/account, 300/week), add path-based i18n for Korean SEO (`/ko/pricing`), restore hreflang in sitemap, add 3 missing test suites, and ship OG caching + Builder self-score.

**Architecture:** New `beta-quota.ts` helper checks per-account + weekly counters stored in `user_profiles` columns. Middleware extracts locale prefixes from URL paths and rewrites to the base route, injecting a cookie that the i18n provider reads on mount. All new surfaces gated by `BETA_MODE` feature flag so Sprint 3 behavior is preserved when flag is off. Tests use the existing Jest + `@jest-environment node` pattern with mock headers.

**Tech Stack:** Next.js 14 App Router · TypeScript · Zod · Supabase · Jest · Tailwind

---

## Out of Scope

- Toss Payments (Sprint 5, post-사업자등록)
- Stripe payment activation
- Team plan / template marketplace / API access
- 8-language translation script run (deferred manual action — script already ready)

---

## Task Execution Order

```
1 → 2 → 3 → 4 → 5 → 10 (analytics) → 6 → 7 → 8 → 9 → 11 → 12 → 13
```

Tasks 6-7 (pricing page) import from Task 10 (analytics). Task 8-9 (i18n) are independent but should come before Task 11 (hreflang which depends on locale paths existing).

---

## File Structure

**Create:**
- `supabase/migrations/006_beta_quota_columns.sql`
- `app/lib/beta-quota.ts`
- `__tests__/lib/beta-quota.test.ts`
- `__tests__/api/stripe-webhook.test.ts`
- `__tests__/middleware.test.ts`
- `app/hooks/useLocalizedHref.ts`

**Modify:**
- `app/lib/features.ts` — add `BETA_MODE` flag
- `app/api/analyze/route.ts` — add beta quota check
- `app/api/harness/analyze/route.ts` — add beta quota check
- `app/api/builder/generate/route.ts` — add beta quota check
- `app/pricing/PricingClient.tsx` — beta mode UI
- `middleware.ts` — locale prefix extraction + rewrite
- `app/i18n/provider.tsx` — read locale from cookie (server-set)
- `app/sitemap.ts` — restore hreflang with path-based URLs
- `app/api/og/harness/route.tsx` — add Cache-Control header
- `app/api/builder/generate/route.ts` — add self-score call
- `app/builder/result/[id]/BuilderResultClient.tsx` — display self-score badge
- `app/types/builder.ts` — add `selfScore` to response schema
- `app/lib/analytics.ts` — add `trackBetaQuotaHit` wrapper

---

## Task 1: DB Migration — Beta Quota Columns

**Files:**
- Create: `supabase/migrations/006_beta_quota_columns.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Migration 006: Beta quota tracking columns on user_profiles.
-- Tracks per-account lifetime usage + weekly rolling window.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS beta_uses_total int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS beta_week_start timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS beta_uses_week int DEFAULT 0;

COMMENT ON COLUMN user_profiles.beta_uses_total IS
  'Lifetime beta analysis count (resets when beta ends and paid tier begins)';
COMMENT ON COLUMN user_profiles.beta_uses_week IS
  'Rolling weekly beta analysis count (resets when beta_week_start + 7d < now())';
```

- [ ] **Step 2: Verify**

Run: `grep -c "ALTER TABLE\|COMMENT" supabase/migrations/006_beta_quota_columns.sql` → expect 5.

- [ ] **Step 3: Add to combined SQL**

Append the migration to `docs/deploy/supabase-combined.sql` for one-paste deployment.

- [ ] **Step 4: Commit (push deferred)**

```bash
git add supabase/migrations/006_beta_quota_columns.sql docs/deploy/supabase-combined.sql
git commit -m "feat(db): add beta quota columns to user_profiles (006)"
```

---

## Task 2: Feature Flag `BETA_MODE`

**Files:**
- Modify: `app/lib/features.ts`

- [ ] **Step 1: Add flag**

In `FEATURES` object after `SEO_HUB_EXT`:

```typescript
  /** Free beta mode — all users get Pro features with usage limits (Sprint 4) */
  BETA_MODE: 'BETA_MODE',
```

In `DEV_ONLY` set:

```typescript
  FEATURES.BETA_MODE,
```

- [ ] **Step 2: Typecheck + commit**

```bash
npx tsc --noEmit 2>&1 | grep features.ts
git add app/lib/features.ts
git commit -m "feat(flags): add BETA_MODE feature flag"
```

---

## Task 3: Beta Quota Helper (TDD)

**Files:**
- Create: `__tests__/lib/beta-quota.test.ts`
- Create: `app/lib/beta-quota.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/beta-quota.test.ts
import {
  checkBetaQuota,
  BETA_PER_ACCOUNT,
  BETA_PER_WEEK,
  shouldResetWeek,
} from '@/app/lib/beta-quota';

describe('beta-quota', () => {
  describe('shouldResetWeek', () => {
    it('returns true if week start is more than 7 days ago', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      expect(shouldResetWeek(eightDaysAgo)).toBe(true);
    });
    it('returns false if week start is within 7 days', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      expect(shouldResetWeek(twoDaysAgo)).toBe(false);
    });
    it('returns true if week start is null', () => {
      expect(shouldResetWeek(null)).toBe(true);
    });
  });

  describe('checkBetaQuota (pure logic)', () => {
    it('allows a fresh user', () => {
      const result = checkBetaQuota({ betaUsesTotal: 0, betaUsesWeek: 0, weekNeedsReset: false });
      expect(result.allowed).toBe(true);
      expect(result.remainingAccount).toBe(BETA_PER_ACCOUNT);
    });
    it('denies when account limit reached', () => {
      const result = checkBetaQuota({ betaUsesTotal: BETA_PER_ACCOUNT, betaUsesWeek: 0, weekNeedsReset: false });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/account/i);
    });
    it('denies when weekly limit reached', () => {
      const result = checkBetaQuota({ betaUsesTotal: 10, betaUsesWeek: BETA_PER_WEEK, weekNeedsReset: false });
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/week/i);
    });
    it('allows when week needs reset (resets weekly counter)', () => {
      const result = checkBetaQuota({ betaUsesTotal: 10, betaUsesWeek: 300, weekNeedsReset: true });
      expect(result.allowed).toBe(true);
      expect(result.remainingWeek).toBe(BETA_PER_WEEK);
    });
  });

  describe('constants', () => {
    it('BETA_PER_ACCOUNT is 50', () => expect(BETA_PER_ACCOUNT).toBe(50));
    it('BETA_PER_WEEK is 300', () => expect(BETA_PER_WEEK).toBe(300));
  });
});
```

- [ ] **Step 2: Run test, confirm FAIL**

Run: `npx jest __tests__/lib/beta-quota.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: "Cannot find module".

- [ ] **Step 3: Write the implementation**

```typescript
// app/lib/beta-quota.ts
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';

export const BETA_PER_ACCOUNT = 50;
export const BETA_PER_WEEK = 300;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function shouldResetWeek(weekStart: string | null): boolean {
  if (!weekStart) return true;
  return Date.now() - new Date(weekStart).getTime() > WEEK_MS;
}

export interface BetaQuotaInput {
  betaUsesTotal: number;
  betaUsesWeek: number;
  weekNeedsReset: boolean;
}

export interface BetaQuotaResult {
  allowed: boolean;
  remainingAccount: number;
  remainingWeek: number;
  reason?: string;
}

/** Pure logic — no DB calls. Testable independently. */
export function checkBetaQuota(input: BetaQuotaInput): BetaQuotaResult {
  const effectiveWeek = input.weekNeedsReset ? 0 : input.betaUsesWeek;
  const remainingAccount = Math.max(0, BETA_PER_ACCOUNT - input.betaUsesTotal);
  const remainingWeek = Math.max(0, BETA_PER_WEEK - effectiveWeek);

  if (input.betaUsesTotal >= BETA_PER_ACCOUNT) {
    return {
      allowed: false,
      remainingAccount: 0,
      remainingWeek,
      reason: `Beta account limit reached (${BETA_PER_ACCOUNT} total uses). Full access coming soon.`,
    };
  }
  if (!input.weekNeedsReset && input.betaUsesWeek >= BETA_PER_WEEK) {
    return {
      allowed: false,
      remainingAccount,
      remainingWeek: 0,
      reason: `Weekly beta limit reached (${BETA_PER_WEEK}/week). Try again next week.`,
    };
  }
  return { allowed: true, remainingAccount, remainingWeek };
}

/** Read quota state from DB, check, and return result. */
export async function getBetaQuotaForUser(userId: string): Promise<BetaQuotaResult> {
  const supa = getSupabaseAdmin();
  if (!supa) return { allowed: true, remainingAccount: BETA_PER_ACCOUNT, remainingWeek: BETA_PER_WEEK };

  const { data, error } = await supa
    .from('user_profiles')
    .select('beta_uses_total, beta_week_start, beta_uses_week')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logger.warn('beta quota read failed', { error: error.message });
    return { allowed: true, remainingAccount: BETA_PER_ACCOUNT, remainingWeek: BETA_PER_WEEK };
  }

  const betaUsesTotal = (data?.beta_uses_total as number) ?? 0;
  const betaUsesWeek = (data?.beta_uses_week as number) ?? 0;
  const weekStart = (data?.beta_week_start as string) ?? null;
  const weekNeedsReset = shouldResetWeek(weekStart);

  return checkBetaQuota({ betaUsesTotal, betaUsesWeek, weekNeedsReset });
}

/** Increment counters after a successful analysis. */
export async function incrementBetaUse(userId: string): Promise<void> {
  const supa = getSupabaseAdmin();
  if (!supa) return;

  const { data } = await supa
    .from('user_profiles')
    .select('beta_uses_total, beta_week_start, beta_uses_week')
    .eq('id', userId)
    .maybeSingle();

  const weekStart = (data?.beta_week_start as string) ?? null;
  const needsReset = shouldResetWeek(weekStart);

  const update: Record<string, unknown> = {
    beta_uses_total: ((data?.beta_uses_total as number) ?? 0) + 1,
  };

  if (needsReset) {
    update.beta_week_start = new Date().toISOString();
    update.beta_uses_week = 1;
  } else {
    update.beta_uses_week = ((data?.beta_uses_week as number) ?? 0) + 1;
  }

  await supa.from('user_profiles').update(update).eq('id', userId);
}
```

- [ ] **Step 4: Run test, confirm PASS**

Run: `npx jest __tests__/lib/beta-quota.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: "Tests: 7 passed, 7 total".

- [ ] **Step 5: Commit**

```bash
git add app/lib/beta-quota.ts __tests__/lib/beta-quota.test.ts
git commit -m "feat(beta): add beta quota helper with 7 tests (50/account, 300/week)"
```

---

## Task 4: Wire Beta Quota into 3 API Routes

**Files:**
- Modify: `app/api/analyze/route.ts`
- Modify: `app/api/harness/analyze/route.ts`
- Modify: `app/api/builder/generate/route.ts`

- [ ] **Step 1: Read existing rate-limit insertion point in each route**

Each route has `const rl = rateLimit(req, LIMITS.ANALYZE); if (!rl.ok) return rl.response;` near the top. The beta quota check goes AFTER rate-limit and AFTER auth (for routes that have auth).

- [ ] **Step 2: Add beta quota to `/api/analyze`**

After the existing rate-limit block and before the Zod parse, add:

```typescript
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import { getBetaQuotaForUser, incrementBetaUse } from '@/app/lib/beta-quota';

// Inside POST handler, after rate-limit check:
  // Beta quota (Sprint 4) — check if user has remaining beta uses
  if (isFeatureEnabled(FEATURES.BETA_MODE)) {
    // For analyze, the user may be anonymous (IP-based). Beta quota requires sign-in.
    // Anonymous users keep the existing DAILY_LIMIT (20/day).
    // Signed-in users get beta quota (50/account, 300/week) and bypass DAILY_LIMIT.
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supa = getSupabaseAdmin();
      if (supa) {
        const { data: { user: authUser } } = await supa.auth.getUser(token);
        if (authUser) {
          const quota = await getBetaQuotaForUser(authUser.id);
          if (!quota.allowed) {
            return Response.json(
              { error: quota.reason, code: 'BETA_QUOTA_EXHAUSTED', remaining: { account: quota.remainingAccount, week: quota.remainingWeek } },
              { status: 402 },
            );
          }
          // Will call incrementBetaUse() after successful analysis (at the end of the handler)
        }
      }
    }
  }
```

And at the end of the successful response path (before `return Response.json(enrichedResult)`), add:

```typescript
  // Increment beta quota for signed-in users
  if (isFeatureEnabled(FEATURES.BETA_MODE)) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supa = getSupabaseAdmin();
      if (supa) {
        const { data: { user: authUser } } = await supa.auth.getUser(token);
        if (authUser) await incrementBetaUse(authUser.id);
      }
    }
  }
```

- [ ] **Step 3: Add beta quota to `/api/harness/analyze`**

Same pattern as Step 2. The harness route already imports `getSupabaseAdmin`. Add `isFeatureEnabled`, `getBetaQuotaForUser`, `incrementBetaUse` imports and the same check+increment blocks.

The harness route is currently anonymous-friendly (no auth required). When BETA_MODE is on and user provides a Bearer token, check beta quota. When anonymous, fall through to existing rate-limit only.

- [ ] **Step 4: Add beta quota to `/api/builder/generate`**

The builder route already has auth (resolveUser). After the auth check and before the quota check (builder-quota), add:

```typescript
  if (isFeatureEnabled(FEATURES.BETA_MODE)) {
    const betaQuota = await getBetaQuotaForUser(user.id);
    if (!betaQuota.allowed) {
      return Response.json(
        { error: betaQuota.reason, code: 'BETA_QUOTA_EXHAUSTED', remaining: { account: betaQuota.remainingAccount, week: betaQuota.remainingWeek } },
        { status: 402 },
      );
    }
  }
```

And after successful generation (before the final `return Response.json(response)`):

```typescript
  if (isFeatureEnabled(FEATURES.BETA_MODE)) {
    await incrementBetaUse(user.id);
  }
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "api/analyze\|api/harness\|api/builder/generate"` — expect empty.

- [ ] **Step 6: Commit**

```bash
git add app/api/analyze/route.ts app/api/harness/analyze/route.ts app/api/builder/generate/route.ts
git commit -m "feat(beta): wire beta quota into analyze + harness + builder routes"
```

---

## Task 5: Analytics Wrapper — `trackBetaQuotaHit`

**Files:**
- Modify: `app/lib/analytics.ts`

- [ ] **Step 1: Append wrapper**

```typescript
// ─── Sprint 4 (Beta) ────────────────────────────────────────
interface BetaQuotaHitEvent {
  route: 'analyze' | 'harness' | 'builder';
  remainingAccount: number;
  remainingWeek: number;
}

export function trackBetaQuotaHit({ route, remainingAccount, remainingWeek }: BetaQuotaHitEvent): void {
  if (typeof window === 'undefined') return;
  const event = { route, remainingAccount, remainingWeek, timestamp: new Date().toISOString() };
  window.posthog?.capture('beta_quota_hit', event);
  if (!isProd) console.log('[Analytics] beta_quota_hit', event);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/analytics.ts
git commit -m "feat(analytics): add trackBetaQuotaHit for beta quota monitoring"
```

---

## Task 6: Pricing Page — Beta Mode UI

**Files:**
- Modify: `app/pricing/PricingClient.tsx`

- [ ] **Step 1: Read current PricingClient**

Check the existing structure: PRICING_PLANS object, handleProPlan (Stripe checkout), handleFreePlan, Legacy badge.

- [ ] **Step 2: Add BETA_MODE conditional rendering**

At the top of the component, import and check the flag:

```typescript
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';

// Inside the component:
const isBeta = isFeatureEnabled(FEATURES.BETA_MODE);
```

Replace the Pro card's CTA button section:

```tsx
{/* Button */}
{isBeta ? (
  <>
    <div className="mb-4 rounded-lg bg-primary/10 border border-primary/30 p-3 text-center">
      <div className="text-xs text-primary font-semibold uppercase tracking-wider">Pre-Launch Beta</div>
      <div className="text-sm text-gray-300 mt-1">All Pro features free during beta</div>
      <div className="text-xs text-gray-500 mt-1">50 uses/account · 300/week</div>
    </div>
    <button
      onClick={() => router.push('/?auth=1')}
      className="btn-primary w-full font-semibold"
    >
      Start Free Beta
    </button>
    <p className="mt-2 text-xs text-center text-gray-500">
      Launching at {displayedProPrice}/mo · sign up now for beta access
    </p>
  </>
) : isLegacy ? (
  // ... existing Legacy button (unchanged)
) : (
  // ... existing Stripe button (unchanged)
)}
```

- [ ] **Step 3: Update the Pro price display for Korean locale**

Add a locale-aware price display:

```typescript
import { useLocale } from '@/app/i18n';

const { locale } = useLocale();
const proPrice = locale === 'ko' ? '₩4,900' : PRICING_PLANS.pro.price;
```

Use `proPrice` instead of `PRICING_PLANS.pro.price` in the price display.

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit 2>&1 | grep PricingClient
git add app/pricing/PricingClient.tsx
git commit -m "feat(pricing): beta mode UI — free beta CTA with quota limits + KRW price for Korean"
```

---

## Task 7: Pricing Page Server Wrapper — Beta Metadata

**Files:**
- Modify: `app/pricing/page.tsx`

- [ ] **Step 1: Update metadata for beta mode**

```typescript
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';

const isBeta = isFeatureEnabled(FEATURES.BETA_MODE);

export const metadata = {
  title: isBeta
    ? 'Free Beta — ScoreMyPrompt'
    : 'Pricing — ScoreMyPrompt',
  description: isBeta
    ? 'All Pro features free during beta. 50 uses per account. Sign up now.'
    : 'Free forever, Pro $4.99/month. Unlimited scoring, Builder, and no ads.',
};
```

- [ ] **Step 2: Commit**

```bash
git add app/pricing/page.tsx
git commit -m "feat(pricing): dynamic metadata for beta vs paid mode"
```

---

## Task 8: Path-Based i18n — Middleware

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Read current middleware structure**

The middleware processes: maintenance mode → CSRF → protected API auth → protected page auth → request ID for API routes → pass through. The locale extraction goes at the VERY TOP, before all other checks.

- [ ] **Step 2: Add locale prefix extraction at the top of `middleware()`**

After `const { pathname } = request.nextUrl;` and before `const isApiRoute = ...`:

```typescript
  // ── Path-based i18n: extract locale prefix and rewrite ──
  // /ko/pricing → rewrite to /pricing, set locale cookie + header
  const localeMatch = pathname.match(/^\/(ko|ja|zh-CN|zh-TW|es|fr|de|pt|hi)(\/.*)?$/);
  if (localeMatch) {
    const locale = localeMatch[1]!;
    const strippedPath = localeMatch[2] || '/';
    const url = new URL(strippedPath, request.url);
    // Preserve query string
    url.search = request.nextUrl.search;
    const response = NextResponse.rewrite(url);
    response.cookies.set('smp_locale', locale, { path: '/', maxAge: 365 * 24 * 60 * 60 });
    response.headers.set('Content-Language', locale);
    return response;
  }
```

This intercepts `/ko/pricing?foo=bar` → rewrites to `/pricing?foo=bar` with the cookie set.

- [ ] **Step 3: Update matcher config to include locale prefixes**

At the bottom of `middleware.ts`, ensure the matcher includes locale-prefixed paths:

```typescript
export const config = {
  matcher: [
    // Match all paths except static files and _next
    '/((?!_next/static|_next/image|favicon\\.ico|icons|.*\\..*$).*)',
  ],
};
```

This is likely already permissive enough. Verify.

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit 2>&1 | grep middleware
git add middleware.ts
git commit -m "feat(i18n): path-based locale extraction in middleware (/ko/, /ja/, etc.)"
```

---

## Task 9: i18n Provider — Read Locale from Cookie

**Files:**
- Modify: `app/i18n/provider.tsx`
- Create: `app/hooks/useLocalizedHref.ts`

- [ ] **Step 1: Update provider to check cookie first**

In `provider.tsx`, modify the `useEffect` that initializes the locale:

```typescript
  useEffect(() => {
    try {
      // Priority: 1) cookie set by middleware (path-based), 2) localStorage, 3) browser
      const cookieLocale = document.cookie
        .split('; ')
        .find((row) => row.startsWith('smp_locale='))
        ?.split('=')[1] as SupportedLocale | undefined;

      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      const initial = (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale) ? cookieLocale : null)
        || (stored && SUPPORTED_LOCALES.includes(stored) ? stored : null)
        || detectBrowserLocale();

      if (initial !== DEFAULT_LOCALE) {
        setLocaleState(initial);
        localeLoaders[initial]().then((mod) => setMessages(mergeLocale(mod.default)));
      }
    } catch { /* SSR or private browsing */ }
  }, []);
```

- [ ] **Step 2: Create `useLocalizedHref` hook**

```typescript
// app/hooks/useLocalizedHref.ts
'use client';

import { useLocale } from '@/app/i18n';

/**
 * Returns a locale-prefixed path for SEO-friendly internal links.
 * English (default) paths have no prefix; other locales get /ko/, /ja/, etc.
 */
export function useLocalizedHref(path: string): string {
  const { locale } = useLocale();
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit 2>&1 | grep "provider\|useLocalizedHref"
git add app/i18n/provider.tsx app/hooks/useLocalizedHref.ts
git commit -m "feat(i18n): provider reads locale cookie (path-based) + useLocalizedHref hook"
```

---

## Task 10: hreflang SEO Restoration

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Restore hreflang with path-based URLs**

Replace the `void SUPPORTED_LOCALES;` placeholder with a real `hreflangMap` function:

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

Add `alternates: { languages: hreflangMap('/') }` to the home entry, and `alternates: { languages: hreflangMap(`/guides/${guide.slug}`) }` to each guide entry. Also add it to `/harness`, `/builder`, `/pricing`.

Remove the `void SUPPORTED_LOCALES;` line and its associated TODO comment.

- [ ] **Step 2: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): restore hreflang alternates with real path-based locale URLs"
```

---

## Task 11: Stripe Webhook Tests

**Files:**
- Create: `__tests__/api/stripe-webhook.test.ts`

- [ ] **Step 1: Write tests**

```typescript
// __tests__/api/stripe-webhook.test.ts
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/stripe/webhook/route';

function makeRequest(body: string, signature: string = 'invalid') {
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body,
  });
}

describe('/api/stripe/webhook', () => {
  it('returns 200 when webhook secret is not configured', async () => {
    // Without STRIPE_WEBHOOK_SECRET, webhook gracefully accepts
    const res = await POST(makeRequest('{}'));
    expect(res.status).toBe(200);
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    const req = new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const res = await POST(req);
    expect([400, 200]).toContain(res.status); // 400 if sig missing, 200 if secret not configured
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('returns 401 when signature is invalid', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    const res = await POST(makeRequest('{"type":"test"}', 't=123,v1=invalid'));
    expect(res.status).toBe(401);
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx jest __tests__/api/stripe-webhook.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: "Tests: 3 passed, 3 total".

- [ ] **Step 3: Commit**

```bash
git add __tests__/api/stripe-webhook.test.ts
git commit -m "test(stripe): add webhook signature verification tests (3 cases)"
```

---

## Task 12: OG Image Cache-Control + Builder Self-Score

**Files:**
- Modify: `app/api/og/harness/route.tsx` — add Cache-Control
- Modify: `app/types/builder.ts` — add `selfScore` field
- Modify: `app/api/builder/generate/route.ts` — compute self-score
- Modify: `app/builder/result/[id]/BuilderResultClient.tsx` — display badge

- [ ] **Step 1: Add Cache-Control to OG route**

In `app/api/og/harness/route.tsx`, after the `return new ImageResponse(...)`:

Actually, `ImageResponse` doesn't support custom headers easily. Instead, wrap:

```typescript
  const imageRes = new ImageResponse(/* existing JSX */, { ...imageSize });
  // Clone with cache headers for CDN
  return new Response(imageRes.body, {
    status: 200,
    headers: {
      ...Object.fromEntries(imageRes.headers.entries()),
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
```

- [ ] **Step 2: Add `selfScore` to builder types**

In `app/types/builder.ts`, modify `BuilderGenerateResponseSchema`:

```typescript
export const BuilderGenerateResponseSchema = z.object({
  id: z.string().uuid(),
  files: BuilderFileMapSchema,
  expiresAt: z.string(),
  isProBuild: z.boolean(),
  quota: z.object({
    buildsUsed: z.number().int().nonnegative(),
    bonusFromShare: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
  }),
  selfScore: z.object({
    total: z.number().int().min(0).max(100),
    tier: z.string(),
  }).optional(),
});
```

- [ ] **Step 3: Compute self-score in builder generate route**

After file map validation passes and before persisting, call the HARNES evaluator on the generated CLAUDE.md:

```typescript
// In app/api/builder/generate/route.ts, after validation:
import { HARNES_SYSTEM_PROMPT } from '@/app/constants/harness-system-prompt';
import { HarnessClaudeOutputSchema, computeTotal, computeTier } from '@/app/types/harness';

// After `const validation = validateBuilderFiles(files);` passes:
let selfScore: { total: number; tier: string } | undefined;
const claudeMdContent = files['CLAUDE.md'];
if (claudeMdContent && apiKey) {
  try {
    // Quick Haiku call to score the generated CLAUDE.md
    const scoreRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 800,
        system: HARNES_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `INPUT:\n\n${claudeMdContent}\n\nReturn ONLY JSON.` }],
      }),
    });
    if (scoreRes.ok) {
      const scoreJson = (await scoreRes.json()) as { content?: { text?: string }[] };
      const raw = (scoreJson.content?.[0]?.text ?? '').replace(/^```json\s*|```\s*$/g, '').trim();
      const parsed = HarnessClaudeOutputSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        const total = computeTotal(parsed.data.scores);
        selfScore = { total, tier: computeTier(total) };
      }
    }
  } catch {
    // Self-score is optional; don't fail the build if it errors
  }
}

// Include in response:
const response: BuilderGenerateResponse = {
  // ... existing fields
  selfScore,
};
```

- [ ] **Step 4: Display self-score badge on result page**

In `app/builder/result/[id]/BuilderResultClient.tsx`, read `selfScore` from the build data (fetched from Supabase, or passed through). If available, display:

```tsx
{build.selfScore && (
  <div className="mb-6 text-center">
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-2">
      <span className="text-2xl font-bold text-white">{build.selfScore.total}</span>
      <span className="text-sm text-gray-300">/ 100 HARNES Score</span>
      <span className="text-xs text-primary font-semibold">{build.selfScore.tier}</span>
    </div>
  </div>
)}
```

Note: `selfScore` needs to be stored in `builder_outputs.files` JSONB (or a separate column) and fetched by the result page. Simplest: include it in the API response and have the client store it in state (it's already available from the generate call). No DB schema change needed if the result page fetches via the generate response. BUT the result page loads from Supabase, not from the generate response. So either:
- Add `self_score` column to `builder_outputs` (clean but requires migration)
- Or store it inside the `files` JSONB as a special key `__selfScore` (hacky)

Recommended: add to the generate response only — the result page shows it from the router state (passed via `router.push` or URL query). If the user refreshes, the score is lost (acceptable for MVP — it's informational, not critical).

Alternative: pass via query param: `router.push(`/builder/result/${data.id}?score=${data.selfScore?.total}&tier=${data.selfScore?.tier}`)`

The result page reads from `searchParams`.

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit 2>&1 | grep "builder\|og/harness"
git add app/api/og/harness/route.tsx app/types/builder.ts app/api/builder/generate/route.ts app/builder/result/[id]/BuilderResultClient.tsx
git commit -m "feat(builder): OG cache-control + Builder self-score via HARNES evaluator"
```

---

## Task 13: Middleware i18n Test

**Files:**
- Create: `__tests__/middleware.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// __tests__/middleware.test.ts
/**
 * @jest-environment node
 */

import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

function makeRequest(path: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`), { headers });
}

describe('middleware — i18n locale extraction', () => {
  it('rewrites /ko/pricing to /pricing with locale cookie', () => {
    const res = middleware(makeRequest('/ko/pricing'));
    // NextResponse.rewrite returns a response with x-middleware-rewrite header
    expect(res.headers.get('Content-Language')).toBe('ko');
    const cookies = res.cookies.getAll();
    const localeCookie = cookies.find((c) => c.name === 'smp_locale');
    expect(localeCookie?.value).toBe('ko');
  });

  it('passes through /pricing without locale prefix', () => {
    const res = middleware(makeRequest('/pricing'));
    expect(res.headers.get('Content-Language')).toBeNull();
  });

  it('rewrites /ja/ to / with ja locale', () => {
    const res = middleware(makeRequest('/ja/'));
    expect(res.headers.get('Content-Language')).toBe('ja');
  });

  it('preserves query params on rewrite', () => {
    const res = middleware(makeRequest('/ko/pricing?reason=builder_quota'));
    expect(res.headers.get('Content-Language')).toBe('ko');
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx jest __tests__/middleware.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: "Tests: 4 passed, 4 total".

- [ ] **Step 3: Commit**

```bash
git add __tests__/middleware.test.ts
git commit -m "test(i18n): add middleware locale extraction tests (4 cases)"
```

---

## Sprint 4 Gate — QA Checklist

- [ ] `npx jest --forceExit` — all new suites pass (beta-quota 7, stripe-webhook 3, middleware 4)
- [ ] `npm run build` — succeeds
- [ ] Feature flag: `BETA_MODE` ON → pricing page shows beta CTA, NOT Stripe checkout
- [ ] Feature flag: `BETA_MODE` OFF → pricing page reverts to Sprint 3 behavior
- [ ] `/ko/pricing` → renders pricing in Korean with ₩4,900
- [ ] `/ja/harness` → renders harness page in Japanese (fallback English for untranslated keys)
- [ ] Sitemap includes hreflang alternates with `/ko/`, `/ja/` path-based URLs
- [ ] OG image at `/api/og/harness?id=...` returns `Cache-Control: public, s-maxage=3600`
- [ ] Builder result page shows HARNES self-score badge when available

---

## Rollback Plan

```
BETA_MODE=off in NEXT_PUBLIC_FEATURES → reverts to Sprint 3 Free/Pro behavior
/ko/ URLs: middleware stops intercepting when locale regex doesn't match → returns 404 naturally
Self-score: optional field; null/undefined gracefully hides badge
```

---

## Deferred Manual Actions

1. Apply `supabase/migrations/006_beta_quota_columns.sql` in Supabase Studio
2. Run `scripts/translate-harness-keys.ts` for 8 remaining locales (needs ANTHROPIC_API_KEY)
3. Enable `BETA_MODE` in `NEXT_PUBLIC_FEATURES` on Vercel
4. Verify `/ko/pricing` renders correctly in production

---

**End of Sprint 4 Plan.** Sprint 5 (post-사업자등록): Toss Payments + Stripe activation + Team plan.
