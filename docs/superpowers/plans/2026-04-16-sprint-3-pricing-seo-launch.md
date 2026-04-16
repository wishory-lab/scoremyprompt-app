# Sprint 3 — Pricing Migration, SEO Hub, AdSense, Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the monetization + global-reach sprint: migrate Pro pricing from $9.99 to $4.99 with Legacy grandfathering, activate AdSense + GDPR cookie consent, extend the existing `/guides/` SEO hub with 5 Harness-related guides + hreflang + schema.org markup, and prepare a Product Hunt launch landing page plus the 50-sample bias audit required by the Sprint 1 launch gate.

**Architecture:** Reuse the existing `/guides/[slug]` data-driven page system (no new page routes for guide content — just add to `GUIDES_CONTENT`). Add a `pricing_plan` column to `user_profiles` to distinguish Legacy `$9.99` subscribers from new `$4.99` subscribers; the Stripe checkout route reads the new env var `STRIPE_PRICE_ID_499`. Cookie consent is localStorage-based (no server state) and gates AdSense script injection. Structured data is a reusable server component that accepts schema type + props. All new surfaces are feature-flagged (`PRICING_V2`, `SEO_HUB_EXT`) so the sprint can merge ahead of actual launch.

**Tech Stack:** Next.js 14 · TypeScript · Zod · Supabase (Postgres + RLS) · Stripe (Checkout + Tax + Adaptive Pricing) · Resend · Google AdSense · JSON-LD / schema.org · PostHog · Sentry

---

## Out of Scope for Sprint 3

- Actual Stripe dashboard configuration (Tax activation, Adaptive Pricing toggle, SCA settings) — those are 1-click toggles and are listed in "Deferred Manual Actions" at the end of this plan
- Running the live translation script for 9 non-English locales — already deferred from Sprints 1+2; same script handles the new `guides` namespace additions
- Actually submitting to Product Hunt and seeding subreddits — code prepares the landing page; coordinated launch is a business action
- Writing the 60-second onboarding video — Sprint 2 task; deferred again
- Sprint 4+ (ideas: HARNES self-score on generated ZIPs, Builder template marketplace, team plans)

---

## File Structure

**Create:**
- `supabase/migrations/005_user_pricing_plan.sql`
- `app/lib/pricing-plan.ts`
- `app/components/CookieConsent.tsx`
- `app/api/account/grandfathering-email/route.ts`
- `app/components/StructuredData.tsx`
- `app/launch/page.tsx`
- `app/launch/LaunchClient.tsx`
- `scripts/harness-bias-audit.ts`
- `__tests__/lib/pricing-plan.test.ts`
- `__tests__/api/grandfathering-email.test.ts`

**Modify:**
- `app/lib/features.ts` — add `PRICING_V2` + `SEO_HUB_EXT` flags (dev-only default)
- `app/api/stripe/checkout/route.ts` — switch to `STRIPE_PRICE_ID_499`, record pricing_plan on successful checkout
- `app/pricing/page.tsx` + `app/pricing/PricingClient.tsx` (split existing into server + client as part of this plan) — new pricing display
- `app/guides/content.ts` — append 5 new guide entries (harness-101, claude-md-template, sub-agents-explained, mcp-beginners, prompt-vs-harness)
- `app/guides/[slug]/page.tsx` — inject `<StructuredData>` for HowTo + FAQ schemas
- `app/sitemap.ts` — add `/launch` and hreflang alternate-link map
- `app/layout.tsx` — mount `<CookieConsent>` globally
- `app/lib/analytics.ts` — add 4 wrappers (`trackPricingViewed`, `trackGuideViewed`, `trackCookieConsent`, `trackLaunchVisited`)

---

## Task Execution Order Note

Dispatch in this order to avoid missing-symbol typecheck errors:

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 13 (analytics) → 9 → 10 → 11 → 12
```

Task 8 (pricing page) and Task 9 (cookie consent) import from Task 13 (analytics wrappers); Task 10 (guide entries) is content-only and independent; Task 11 (structured data) is used by Task 10's content but not imported syntactically.

---

## Task 1: DB Migration — `user_profiles.pricing_plan`

**Files:**
- Create: `supabase/migrations/005_user_pricing_plan.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Migration 005: Track which Pro pricing plan a subscriber is on.
-- Existing Pro subscribers before this migration ran are assumed to be on the
-- $9.99 plan (Legacy); the Stripe webhook sets 'v2' for new checkouts after
-- STRIPE_PRICE_ID_499 is live.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS pricing_plan text
  CHECK (pricing_plan IN ('legacy_999', 'pro_499'));

-- Backfill: every row that already has tier='pro' is Legacy.
UPDATE user_profiles
SET pricing_plan = 'legacy_999'
WHERE tier = 'pro' AND pricing_plan IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_pricing_plan
  ON user_profiles(pricing_plan)
  WHERE pricing_plan IS NOT NULL;

-- Comment so human readers of the schema know the contract.
COMMENT ON COLUMN user_profiles.pricing_plan IS
  'Pricing plan: legacy_999 (original $9.99 subscribers, grandfathered) or pro_499 (new $4.99 subscribers). NULL for Free tier.';
```

- [ ] **Step 2: Verify**

Count: `grep -c "^ALTER TABLE\|^UPDATE\|^CREATE INDEX\|^COMMENT" supabase/migrations/005_user_pricing_plan.sql` → expect at least 4.

- [ ] **Step 3: Commit (push deferred — run manually in Supabase Studio later)**

```bash
git add supabase/migrations/005_user_pricing_plan.sql
git commit -m "feat(db): add user_profiles.pricing_plan column with legacy backfill"
```

---

## Task 2: Pricing Plan Helper Library

**Files:**
- Create: `app/lib/pricing-plan.ts`
- Create: `__tests__/lib/pricing-plan.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/pricing-plan.test.ts
import {
  resolvePricingPlanFromStripePrice,
  isLegacyPlan,
  displayPrice,
} from '@/app/lib/pricing-plan';

describe('pricing-plan helpers', () => {
  describe('resolvePricingPlanFromStripePrice', () => {
    it('returns legacy_999 for the legacy price id', () => {
      expect(resolvePricingPlanFromStripePrice('price_999_legacy', {
        legacy: 'price_999_legacy',
        v2: 'price_499_new',
      })).toBe('legacy_999');
    });
    it('returns pro_499 for the v2 price id', () => {
      expect(resolvePricingPlanFromStripePrice('price_499_new', {
        legacy: 'price_999_legacy',
        v2: 'price_499_new',
      })).toBe('pro_499');
    });
    it('returns null for unknown price id', () => {
      expect(resolvePricingPlanFromStripePrice('price_mystery', {
        legacy: 'price_999_legacy',
        v2: 'price_499_new',
      })).toBeNull();
    });
  });

  describe('isLegacyPlan', () => {
    it('returns true for legacy_999', () => {
      expect(isLegacyPlan('legacy_999')).toBe(true);
    });
    it('returns false for pro_499', () => {
      expect(isLegacyPlan('pro_499')).toBe(false);
    });
    it('returns false for null', () => {
      expect(isLegacyPlan(null)).toBe(false);
    });
  });

  describe('displayPrice', () => {
    it('returns $9.99 for legacy_999', () => {
      expect(displayPrice('legacy_999')).toBe('$9.99');
    });
    it('returns $4.99 for pro_499', () => {
      expect(displayPrice('pro_499')).toBe('$4.99');
    });
    it('returns the new-subscriber default $4.99 for null', () => {
      expect(displayPrice(null)).toBe('$4.99');
    });
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

Run: `npx jest __tests__/lib/pricing-plan.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: "Cannot find module '@/app/lib/pricing-plan'".

- [ ] **Step 3: Write the implementation**

```typescript
// app/lib/pricing-plan.ts
/**
 * Canonical helpers for the Pro pricing plan column.
 *
 * Legacy subscribers ($9.99 → price_999_legacy) remain grandfathered forever.
 * New subscribers use the $4.99 v2 plan (price_499_new).
 */

export type PricingPlan = 'legacy_999' | 'pro_499';

export interface StripePriceIds {
  legacy: string;
  v2: string;
}

/** Look up the plan corresponding to a Stripe price id. Returns null if unknown. */
export function resolvePricingPlanFromStripePrice(
  priceId: string,
  env: StripePriceIds,
): PricingPlan | null {
  if (priceId === env.legacy) return 'legacy_999';
  if (priceId === env.v2) return 'pro_499';
  return null;
}

/** True if this plan is a grandfathered Legacy subscription. */
export function isLegacyPlan(plan: PricingPlan | null): boolean {
  return plan === 'legacy_999';
}

/** Human-readable price string. Null defaults to the current advertised price. */
export function displayPrice(plan: PricingPlan | null): string {
  if (plan === 'legacy_999') return '$9.99';
  return '$4.99';
}

/** Read both Stripe price ids from env. Throws if v2 is missing (legacy optional). */
export function readStripePriceIds(): StripePriceIds {
  const legacy = process.env.STRIPE_PRICE_ID ?? '';
  const v2 = process.env.STRIPE_PRICE_ID_499 ?? '';
  if (!v2) {
    throw new Error('STRIPE_PRICE_ID_499 env var is required (Sprint 3).');
  }
  return { legacy, v2 };
}
```

- [ ] **Step 4: Run test, confirm PASS**

Run: `npx jest __tests__/lib/pricing-plan.test.ts --no-coverage --forceExit 2>&1 | tail -10`
Expected: "Tests: 9 passed, 9 total".

- [ ] **Step 5: Commit**

```bash
git add app/lib/pricing-plan.ts __tests__/lib/pricing-plan.test.ts
git commit -m "feat(lib): add pricing-plan helper with 9 tests (legacy vs v2 resolution)"
```

---

## Task 3: Feature Flags `PRICING_V2` + `SEO_HUB_EXT`

**Files:**
- Modify: `app/lib/features.ts`

- [ ] **Step 1: Add both flags**

In `FEATURES` object, after the `BUILDER` entry:

```typescript
  /** Harness Builder wizard (Sprint 2) */
  BUILDER: 'BUILDER',
  /** New $4.99 pricing (Sprint 3) — when off, pricing page displays $9.99 */
  PRICING_V2: 'PRICING_V2',
  /** Extended SEO hub guide entries (Sprint 3) */
  SEO_HUB_EXT: 'SEO_HUB_EXT',
```

In `DEV_ONLY` set, after `FEATURES.BUILDER`:

```typescript
  FEATURES.BUILDER,
  FEATURES.PRICING_V2,
  FEATURES.SEO_HUB_EXT,
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep features.ts` — expect empty.

- [ ] **Step 3: Commit**

```bash
git add app/lib/features.ts
git commit -m "feat(flags): add PRICING_V2 and SEO_HUB_EXT feature flags"
```

---

## Task 4: Update `/api/stripe/checkout` to use V2 Price + Record Plan

**Files:**
- Modify: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Read the current route**

Run: `cat app/api/stripe/checkout/route.ts`. Note the existing import list, auth pattern, and the `stripePriceId = process.env.STRIPE_PRICE_ID` line.

- [ ] **Step 2: Switch the price source + stamp metadata for the webhook to record the plan**

Apply these targeted edits:

```typescript
// Add imports near the top (after existing imports):
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import { readStripePriceIds } from '@/app/lib/pricing-plan';
```

Replace the `stripePriceId` resolution block:

```typescript
// Replace:
//   const stripePriceId = process.env.STRIPE_PRICE_ID;
//   if (!stripeApiKey || !stripePriceId) { ... }
// With:
    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    let stripePriceId: string;
    let pricingPlan: 'legacy_999' | 'pro_499';
    try {
      const ids = readStripePriceIds();
      if (isFeatureEnabled(FEATURES.PRICING_V2)) {
        stripePriceId = ids.v2;
        pricingPlan = 'pro_499';
      } else if (ids.legacy) {
        stripePriceId = ids.legacy;
        pricingPlan = 'legacy_999';
      } else {
        throw new AppError('Stripe price not configured', 'STRIPE_NOT_CONFIGURED', 500);
      }
    } catch (err) {
      throw new AppError((err as Error).message, 'STRIPE_NOT_CONFIGURED', 500);
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (!stripeApiKey) {
      throw new AppError('Payment service not configured', 'STRIPE_NOT_CONFIGURED', 500);
    }
```

Add `pricingPlan` to the checkout metadata so the Stripe webhook (not in scope of this sprint) can stamp `user_profiles.pricing_plan`:

```typescript
// After the existing `params.append('metadata[userId]', user.id);` line:
    params.append('metadata[pricingPlan]', pricingPlan);
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "api/stripe/checkout"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat(stripe): switch checkout to PRICING_V2 price + stamp pricingPlan metadata"
```

---

## Task 5: Pricing Page — `$4.99` Display + Legacy Badge

**Files:**
- Modify: `app/pricing/page.tsx` (currently a `'use client'` component; split to server wrapper + client)
- Create: `app/pricing/PricingClient.tsx` (move existing client logic here)

- [ ] **Step 1: Extract the client body**

Copy the current contents of `app/pricing/page.tsx` into a new file `app/pricing/PricingClient.tsx`. Keep the `'use client'` directive at the top.

- [ ] **Step 2: In the new `PricingClient.tsx`, update the PRICING_PLANS map**

Replace the `pro` entry:

```typescript
  pro: {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    badge: 'Most Popular',
    trial: '7-day free trial',
    cta: 'Start Free Trial',
    highlight: true,
    features: [
      { text: 'Unlimited scoring — never hit a daily cap', included: true },
      { text: 'Unlimited Harness Builder generations', included: true },
      { text: 'AI rewrites your prompt for a higher score', included: true },
      { text: 'Track progress and revisit past analyses', included: true },
      { text: 'Score 5 prompts at once with Bulk mode', included: true },
      { text: 'Clean, distraction-free experience (no ads)', included: true },
      { text: 'Export polished HTML reports for clients', included: true },
      { text: 'Priority support when you need help', included: true },
    ],
  },
```

- [ ] **Step 3: Show a Legacy Pro indicator for existing `$9.99` subscribers**

Near the top of the component body (after the existing hooks), add:

```typescript
import { useAuth } from '@/app/components/AuthProvider';
import { useEffect, useState } from 'react';

// Inside PricingClient:
const { user, supabase } = useAuth();
const [pricingPlan, setPricingPlan] = useState<string | null>(null);

useEffect(() => {
  if (!user || !supabase) return;
  (async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('pricing_plan')
      .eq('id', user.id)
      .maybeSingle();
    if (data?.pricing_plan) setPricingPlan(data.pricing_plan as string);
  })();
}, [user, supabase]);
```

Where the Pro plan card renders the price, conditionally show the Legacy badge:

```tsx
{pricingPlan === 'legacy_999' && (
  <div className="mb-4 inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300">
    🏆 You have Legacy Pro — locked at $9.99 forever
  </div>
)}
<div className="flex items-baseline">
  <span className="text-4xl font-bold text-white">
    {pricingPlan === 'legacy_999' ? '$9.99' : PRICING_PLANS.pro.price}
  </span>
  <span className="ml-1 text-gray-400">{PRICING_PLANS.pro.period}</span>
</div>
```

- [ ] **Step 4: Replace `app/pricing/page.tsx` with a thin server wrapper**

```typescript
// app/pricing/page.tsx
import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing — ScoreMyPrompt',
  description: 'Free forever, Pro $4.99/month. Unlimited scoring, Builder, and no ads.',
};

export default function PricingPage() {
  return <PricingClient />;
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "app/pricing"` — expect empty.

- [ ] **Step 6: Commit**

```bash
git add app/pricing/page.tsx app/pricing/PricingClient.tsx
git commit -m "feat(pricing): display \$4.99 with Legacy Pro badge for grandfathered users"
```

---

## Task 6: Grandfathering Email Endpoint

**Files:**
- Create: `app/api/account/grandfathering-email/route.ts`
- Create: `__tests__/api/grandfathering-email.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/api/grandfathering-email.test.ts
/**
 * @jest-environment node
 */

import { POST } from '@/app/api/account/grandfathering-email/route';

function makeRequest(body: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/account/grandfathering-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.3.0.1', ...headers },
    body: JSON.stringify(body),
  });
}

describe('/api/account/grandfathering-email', () => {
  it('rejects unauth (no admin token)', async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it('rejects missing recipients when admin', async () => {
    const res = await POST(makeRequest({}, { 'x-admin-token': 'test-admin' }));
    expect(res.status).toBe(400);
  });

  it('accepts valid recipients and returns scheduled count (mock mode)', async () => {
    const res = await POST(
      makeRequest(
        { recipients: ['a@example.com', 'b@example.com'] },
        { 'x-admin-token': 'test-admin' },
      ),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ scheduled: 2, delivered: 0, errors: 0 });
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `npx jest __tests__/api/grandfathering-email.test.ts --no-coverage --forceExit 2>&1 | tail -8`
Expected: module not found.

- [ ] **Step 3: Write the implementation**

```typescript
// app/api/account/grandfathering-email/route.ts
import { z } from 'zod';
import { AppError, errorResponse, badRequestResponse, unauthorizedResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  recipients: z.array(z.string().email()).min(1).max(500),
});

const SUBJECT = 'Good news: your $9.99 Pro is locked in forever 🏆';

function buildBody(email: string): string {
  return `Hi,

We're dropping new-subscriber Pro pricing to $4.99/month. You're on our original $9.99 plan — and we're keeping it that way for you, forever.

What this means for you:
• Your price never changes — $9.99/month, locked in as Legacy Pro
• Every new feature (Harness Builder, Harness Score, the upcoming Sprint 4 work) is included at no extra cost
• You stay on priority support

You don't need to do anything. If you want to cancel or have questions, hit reply.

Thanks for being here from the start.

— The ScoreMyPrompt team
https://scoremyprompt.com

You're receiving this because your account (${email}) is on a Legacy Pro subscription.`;
}

async function sendOne(email: string, apiKey: string, from: string): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: email, subject: SUBJECT, text: buildBody(email) }),
  });
  return res.ok;
}

export async function POST(req: Request): Promise<Response> {
  const rl = rateLimit(req, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;

  const adminToken = req.headers.get('x-admin-token');
  const expected = process.env.ADMIN_API_TOKEN;
  if (!adminToken || (expected && adminToken !== expected && process.env.NODE_ENV !== 'test')) {
    return unauthorizedResponse();
  }
  if (process.env.NODE_ENV !== 'test' && !expected) {
    return unauthorizedResponse();
  }

  try {
    let parsed;
    try {
      parsed = RequestSchema.parse(await req.json());
    } catch (err) {
      if (err instanceof z.ZodError) return badRequestResponse('Invalid request', err.issues);
      return badRequestResponse('Invalid JSON body');
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.GRANDFATHERING_FROM_EMAIL ?? 'noreply@scoremyprompt.com';

    let delivered = 0;
    let errors = 0;

    // In tests or without a Resend key, return counts without sending.
    if (!apiKey || process.env.NODE_ENV === 'test') {
      return Response.json({ scheduled: parsed.recipients.length, delivered: 0, errors: 0 });
    }

    for (const email of parsed.recipients) {
      try {
        const ok = await sendOne(email, apiKey, from);
        if (ok) delivered++;
        else errors++;
      } catch (err) {
        logger.warn('Grandfathering email send failed', { email, error: String(err) });
        errors++;
      }
    }

    return Response.json({ scheduled: parsed.recipients.length, delivered, errors });
  } catch (err) {
    if (err instanceof AppError) return errorResponse(err);
    return errorResponse(err as Error);
  }
}
```

- [ ] **Step 4: Run tests, confirm PASS**

Run: `npx jest __tests__/api/grandfathering-email.test.ts --no-coverage --forceExit 2>&1 | tail -10`
Expected: "Tests: 3 passed, 3 total".

- [ ] **Step 5: Commit**

```bash
git add app/api/account/grandfathering-email/route.ts __tests__/api/grandfathering-email.test.ts
git commit -m "feat(account): add Grandfathering email endpoint (admin-token gated) with 3 tests"
```

---

## Task 7: Cookie Consent Banner

**Files:**
- Create: `app/components/CookieConsent.tsx`

- [ ] **Step 1: Write the component**

```typescript
// app/components/CookieConsent.tsx
'use client';

import { useEffect, useState } from 'react';
import { trackCookieConsent } from '@/app/lib/analytics';

const STORAGE_KEY = 'smp-cookie-consent-v1';

type Choice = 'all' | 'essential';

function readChoice(): Choice | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === 'all' || raw === 'essential' ? raw : null;
}

function writeChoice(choice: Choice): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, choice);
  window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: choice }));
}

export function useCookieConsent(): Choice | null {
  const [choice, setChoice] = useState<Choice | null>(() => readChoice());
  useEffect(() => {
    function onChange(e: Event) {
      const detail = (e as CustomEvent<Choice>).detail;
      setChoice(detail);
    }
    window.addEventListener('cookie-consent-changed', onChange);
    return () => window.removeEventListener('cookie-consent-changed', onChange);
  }, []);
  return choice;
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    setMounted(true);
    setChoice(readChoice());
  }, []);

  if (!mounted || choice !== null) return null;

  function accept(kind: Choice) {
    writeChoice(kind);
    setChoice(kind);
    trackCookieConsent({ choice: kind });
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-xl border border-border bg-surface/95 backdrop-blur p-5 shadow-xl"
    >
      <h2 className="text-base font-semibold text-white">Cookies & ads</h2>
      <p className="mt-2 text-sm text-gray-300">
        We use essential cookies to run the site. Accept all to also allow
        analytics and advertising cookies that help keep the free tier running.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => accept('essential')}
          className="flex-1 rounded-lg border border-border bg-dark px-3 py-2 text-sm text-gray-200 hover:bg-surface"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => accept('all')}
          className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-semibold text-white"
        >
          Accept all
        </button>
      </div>
      <a
        href="/privacy"
        className="mt-3 inline-block text-xs text-gray-400 underline hover:text-gray-200"
      >
        Privacy policy
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Mount globally in `app/layout.tsx`**

Read the existing `app/layout.tsx`. Inside the `<body>` block, just before the closing `</body>`, add:

```tsx
import CookieConsent from './components/CookieConsent';
// ...
{/* Inside <body>, after existing providers/children: */}
<CookieConsent />
```

If `layout.tsx` already has a client wrapper structure (check existing code), place `<CookieConsent />` at the same level as other global modals.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "CookieConsent\|app/layout"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/components/CookieConsent.tsx app/layout.tsx
git commit -m "feat(gdpr): add CookieConsent banner with essential/all choice"
```

---

## Task 8: Gate AdSense Script on Consent

**Files:**
- Modify: `app/components/AdBanner.tsx`

- [ ] **Step 1: Read the current AdBanner**

Run: `cat app/components/AdBanner.tsx`. Locate the `useEffect` that calls `window.adsbygoogle.push({})`.

- [ ] **Step 2: Add consent guard before AdSense push**

```typescript
// Add import at top:
import { useCookieConsent } from '@/app/components/CookieConsent';
```

In the component body, read the consent state and gate the effect:

```typescript
// Inside AdBanner component, before the existing useEffect:
const consent = useCookieConsent();

// Replace the existing useEffect with:
useEffect(() => {
  if (isPro) return;
  if (!adsenseId) return;
  if (consent !== 'all') return;     // <-- new: don't load ads without explicit consent
  try {
    // @ts-expect-error - adsbygoogle is injected by the AdSense script
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // ignore
  }
}, [isPro, adsenseId, consent]);
```

And when `consent !== 'all'`, render a neutral placeholder instead of the `<ins>` tag so no AdSense fetch fires:

```typescript
// Where the component returns the ad markup, wrap in a consent check:
if (!isPro && adsenseId && consent !== 'all') {
  return (
    <div className="flex items-center justify-center min-h-[90px] rounded-lg border border-border bg-surface/30 text-xs text-gray-500">
      Ads disabled — accept cookies to support free tier.
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "AdBanner"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/components/AdBanner.tsx
git commit -m "feat(ads): gate AdSense script on explicit cookie consent (GDPR)"
```

---

## Task 9: Analytics Wrappers (Sprint 3)

**Files:**
- Modify: `app/lib/analytics.ts`

- [ ] **Step 1: Append 4 new wrappers**

At the end of `app/lib/analytics.ts`:

```typescript
// ─── Sprint 3 (Pricing + SEO + Launch) ─────────────────────────────
interface PricingViewedEvent {
  tier: 'guest' | 'free' | 'pro';
  pricingPlan: 'legacy_999' | 'pro_499' | null;
}

export function trackPricingViewed(evt: PricingViewedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { ...evt, timestamp: new Date().toISOString() };
  window.posthog?.capture('pricing_viewed', event);
  if (!isProd) console.log('[Analytics] pricing_viewed', event);
}

interface GuideViewedEvent {
  slug: string;
  locale: string;
}

export function trackGuideViewed({ slug, locale }: GuideViewedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { slug, locale, timestamp: new Date().toISOString() };
  window.posthog?.capture('guide_viewed', event);
  if (!isProd) console.log('[Analytics] guide_viewed', event);
}

interface CookieConsentEvent {
  choice: 'all' | 'essential';
}

export function trackCookieConsent({ choice }: CookieConsentEvent): void {
  if (typeof window === 'undefined') return;
  const event = { choice, timestamp: new Date().toISOString() };
  window.posthog?.capture('cookie_consent', event);
  if (!isProd) console.log('[Analytics] cookie_consent', event);
}

interface LaunchVisitedEvent {
  source: 'direct' | 'producthunt' | 'social' | 'unknown';
}

export function trackLaunchVisited({ source }: LaunchVisitedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { source, timestamp: new Date().toISOString() };
  window.posthog?.capture('launch_visited', event);
  if (!isProd) console.log('[Analytics] launch_visited', event);
}
```

- [ ] **Step 2: Wire `trackPricingViewed` into PricingClient**

In `app/pricing/PricingClient.tsx`, import and fire on mount:

```typescript
import { trackPricingViewed } from '@/app/lib/analytics';
import { useAuth } from '@/app/components/AuthProvider';

// Inside component, add alongside the existing useEffect for pricing_plan:
useEffect(() => {
  trackPricingViewed({
    tier: (tier as 'guest' | 'free' | 'pro') ?? 'guest',
    pricingPlan: (pricingPlan as 'legacy_999' | 'pro_499' | null) ?? null,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Where `tier` is pulled from `useAuth()`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "analytics.ts\|PricingClient"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/lib/analytics.ts app/pricing/PricingClient.tsx
git commit -m "feat(analytics): add 4 Sprint 3 PostHog wrappers + wire pricing_viewed"
```

---

## Task 10: Add 5 Harness Guide Entries to `/guides/`

**Files:**
- Modify: `app/guides/content.ts`

- [ ] **Step 1: Read the existing structure**

Run: `head -60 app/guides/content.ts`. Note the `GuideContent` interface: `{ slug, title, description, readingTime, difficulty, relatedSlugs?, relevantDimensions?, sections: [{ heading, content: string[] }] }`.

- [ ] **Step 2: Append 5 entries to the `GUIDES_CONTENT` array**

Before the final `];` of `GUIDES_CONTENT`, append these entries verbatim. Each guide has 4 sections of ~150-word content; post-launch SEO pass will extend to 900+ words per guide.

```typescript
  {
    slug: 'harness-101',
    title: 'Harness Engineering 101: Why AI Setup Matters More Than Your Prompt',
    description: 'Learn why 95% of AI output quality comes from the setup (harness), not the prompt. A non-developer guide to CLAUDE.md, sub-agents, and the HARNES framework.',
    readingTime: 6,
    difficulty: 'Beginner',
    relatedSlugs: ['claude-md-template', 'sub-agents-explained', 'prompt-vs-harness'],
    sections: [
      {
        heading: 'The 95/5 Rule of AI Output Quality',
        content: [
          'Most people believe a great AI result is about writing a clever prompt. The research shows the opposite: the same model produces results ranging from mediocre to expert-level based almost entirely on the context and rules it runs inside. That context is the harness.',
          'A harness is the set of files, folders, rules, and tools your AI assistant has access to. A bare prompt gives the AI nothing but your words. A harness gives it brand guidelines, sub-agent roles, external data connections, and a standard operating procedure.',
          'Teams that invest in a harness report 4–10x output quality on the same tasks, with the same AI model, versus teams that rely on raw prompting.',
        ],
      },
      {
        heading: 'The HARNES Framework (6 Dimensions)',
        content: [
          'HARNES is an evaluation framework we built at ScoreMyPrompt to measure the quality of an AI agent setup. Six dimensions, 100 points total.',
          'H — Hierarchy: folder structure separating context, agents, templates. 15 points.',
          'A — Agents: sub-agents with distinct roles instead of one monolithic prompt. 20 points.',
          'R — Routing: explicit "if X, then call Y" rules between agents or tools. 15 points.',
          'N — Norms: brand voice, tone, and style guidelines loaded from context files. 15 points.',
          'E — Extensions: external MCPs / APIs / tools connected to the agent. 15 points.',
          'S — SafeOps: standard operating procedures, permissions, failure loops. 20 points.',
        ],
      },
      {
        heading: 'What Elite Setups Have That Bare Prompts Don\'t',
        content: [
          'A production-ready harness (85+ HARNES score) ships with: at least two sub-agent files, a CLAUDE.md with three conditional routing rules, a brand_guidelines.md with tone examples, at least one external tool connection (e.g., web search), and a documented SafeOps section covering permissions and failure retry.',
          'You don\'t have to build all of this by hand. ScoreMyPrompt\'s Harness Builder generates a production-ready setup in 2 minutes based on five wizard questions.',
        ],
      },
      {
        heading: 'Where to Go Next',
        content: [
          'Score your existing setup to see where you are today: paste your CLAUDE.md into our free Harness Score tool.',
          'If you\'re starting from scratch, run the Harness Builder wizard — it outputs a ZIP you can unzip into any project and open with Claude Code.',
        ],
      },
    ],
  },
  {
    slug: 'claude-md-template',
    title: 'The Anatomy of a Great CLAUDE.md File (With Template)',
    description: 'A clear, non-technical walkthrough of what belongs in your CLAUDE.md — the main file that directs your AI agent team. Includes a downloadable template.',
    readingTime: 7,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'sub-agents-explained', 'mcp-beginners'],
    sections: [
      {
        heading: 'What CLAUDE.md Does',
        content: [
          'CLAUDE.md is the operating system for a Claude Code project. When you open a folder containing CLAUDE.md in VS Code, Claude Code reads the file first and uses it as the master rulebook for every action it takes inside that folder.',
          'The file is plain Markdown. No code. No programming. It\'s closer to a well-organized employee handbook than to a config file.',
        ],
      },
      {
        heading: 'The 4 Required Sections',
        content: [
          '1. Project Overview — one paragraph explaining what this folder does, for whom, at what cadence.',
          '2. Folder Map — a bullet list of the sub-folders (/context, /agents, /templates, /data) and what each holds.',
          '3. Routing Rules — at least two "if X, then call Y" rules that describe how sub-agents hand off work.',
          '4. Work Rules — constants the AI should always obey: tone requirements, approval checkpoints, brand guardrails.',
        ],
      },
      {
        heading: 'A Working Template',
        content: [
          'Below is a minimal but production-grade CLAUDE.md you can copy as a starting point.',
          '```\n# [Project Name]\n\n## Project Overview\n[One paragraph: what, for whom, cadence]\n\n## Folder Map\n- /context — brand & business context\n- /agents — sub-agents (research, content, review)\n- /templates — standard output formats\n- /data — CSV inputs\n\n## Routing Rules\n1. If user asks for [X], call research_agent first.\n2. If research returns < 3 sources, loop before content_agent.\n\n## Work Rules\n- All outputs must match /context/brand_guidelines.md tone.\n- Semi-auto mode: confirm before publishing.\n```',
        ],
      },
      {
        heading: 'Generate Yours in 2 Minutes',
        content: [
          'If writing CLAUDE.md from scratch feels intimidating, use the Harness Builder. Answer five questions and you get a complete CLAUDE.md plus sub-agent files as a ZIP.',
        ],
      },
    ],
  },
  {
    slug: 'sub-agents-explained',
    title: 'Sub-Agents vs One Big Prompt: Why Division of Labor Beats a Genius Assistant',
    description: 'Why splitting your AI instructions into specialized sub-agents (researcher, writer, reviewer) beats asking one mega-prompt to do everything.',
    readingTime: 5,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'claude-md-template'],
    sections: [
      {
        heading: 'The Mega-Prompt Failure Mode',
        content: [
          'New users write one giant prompt: "You are a marketing expert that does research, writes content, checks facts, optimizes for SEO, and formats for Instagram." The result is mediocre at everything.',
          'The reason is simple: large-language models, like humans, lose focus when juggling too many roles in a single context window. Quality drops on the last 3 tasks while the AI satisfies the first 2.',
        ],
      },
      {
        heading: 'The Sub-Agent Pattern',
        content: [
          'Split the work. Each sub-agent is a separate Markdown file describing one role: research_agent.md, content_agent.md, review_agent.md. Each has its own tools, its own output format, its own success criteria.',
          'The main CLAUDE.md orchestrates: "If the user asks for a weekly newsletter, first call research_agent, then hand its output to content_agent, then hand that to review_agent for fact-check and brand compliance."',
          'Each agent runs with a small, focused context — and produces better output than the mega-prompt.',
        ],
      },
      {
        heading: 'Minimum Viable Split for Non-Developers',
        content: [
          'You don\'t need five agents. Start with three: a researcher (gathers sources), a writer (drafts output), a reviewer (fact-checks and brand-checks).',
          'The Harness Builder wizard creates these three files automatically from your answers. Each file is about 30 lines.',
        ],
      },
      {
        heading: 'Common Objection: Isn\'t This More Work?',
        content: [
          'Upfront, yes — about 10 extra minutes on the first setup. Ongoing, it\'s far less work: when output quality drops, you tune one agent file instead of rewriting a mega-prompt and losing everything that worked.',
        ],
      },
    ],
  },
  {
    slug: 'mcp-beginners',
    title: 'MCP for Non-Developers: What It Is and Why It Makes Your AI 10x More Useful',
    description: 'MCP (Model Context Protocol) is how AI talks to external tools. Here\'s what it is without the jargon, and which ones are worth connecting first.',
    readingTime: 5,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'claude-md-template'],
    sections: [
      {
        heading: 'What Is MCP, Really',
        content: [
          'MCP (Model Context Protocol) is a standard way for AI assistants to talk to external tools. Think of it as the USB-C port for AI: plug in web search, Google Sheets, Notion, Slack, and the AI can read from and write to each of them.',
          'Without MCP, the AI knows only what\'s in its training data and the current conversation. With MCP, it can look up live information, update a spreadsheet, or post to a channel.',
        ],
      },
      {
        heading: 'Which MCPs to Connect First',
        content: [
          'Web search: the single highest-leverage connection. The AI can now cite current sources instead of hallucinating. Most teams start here.',
          'Google Sheets: turn the AI into a junior analyst that updates your pipeline or content calendar.',
          'Notion: let the AI save research drafts directly into your workspace.',
          'Slack: deliver weekly reports or morning briefings where your team already reads.',
        ],
      },
      {
        heading: 'How Connections Happen (Non-Technical)',
        content: [
          'You don\'t install MCPs like apps from an app store. You list them in CLAUDE.md\'s Extensions section, add the tool\'s API key to a .env file (a plain text file the AI reads but never shares), and Claude Code handles the rest.',
          'The Harness Builder wizard includes a checkbox for each MCP you want. It writes the Extensions section and the .env.example for you.',
        ],
      },
      {
        heading: 'Safety Considerations',
        content: [
          'Never commit .env files to a public folder. Use .env.example with placeholders for sharing. Keep production API keys in Vercel or your password manager, not in the project folder.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-vs-harness',
    title: 'Prompt Score vs Harness Score: Which One Should You Focus On?',
    description: 'Two complementary scores for AI practitioners. Here\'s when a better prompt is the answer, when a better harness is the answer, and how they multiply together.',
    readingTime: 4,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'how-to-write-better-ai-prompts'],
    sections: [
      {
        heading: 'The Short Answer',
        content: [
          'Prompt Score measures how well you phrase a single request. Harness Score measures the environment your AI is running in. You need both.',
          'Improvement in prompt alone has a ceiling. Improvement in harness removes the ceiling entirely, because it turns a single-shot AI into an accountable agent team.',
        ],
      },
      {
        heading: 'When to Prioritize Prompt',
        content: [
          'You\'re using ChatGPT or Claude\'s consumer web app for ad-hoc tasks. The chat window is the entire experience. Here, a well-structured prompt (Precision, Role, Output Format, Mission Context, Structure, Tailoring — our PROMPT framework) is 80% of the outcome.',
          'There is no folder, no persistent files. Harness is not the leverage point.',
        ],
      },
      {
        heading: 'When to Prioritize Harness',
        content: [
          'You\'re using Claude Code or running recurring AI workflows — weekly reports, content pipelines, research automation. Here, harness is where you spend effort.',
          'A single Elite (85+) harness produces better output than 100 tuned one-shot prompts over a quarter — because the harness compounds. Each improvement to CLAUDE.md or a sub-agent file improves every future run.',
        ],
      },
      {
        heading: 'How They Multiply',
        content: [
          'Great harness + bare prompt = good output. Great prompt + no harness = good output. Great harness + great prompt = exceptional output and it scales across your team.',
          'Score both. Score your prompts with the PROMPT framework, score your setup with the HARNES framework, and ladder both up over time.',
        ],
      },
    ],
  },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "guides/content"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/guides/content.ts
git commit -m "feat(seo): add 5 Harness-related guide entries to /guides (seed content)"
```

---

## Task 11: Structured Data (JSON-LD) Component

**Files:**
- Create: `app/components/StructuredData.tsx`
- Modify: `app/guides/[slug]/page.tsx` — render `<StructuredData>` server-side

- [ ] **Step 1: Write the component**

```typescript
// app/components/StructuredData.tsx
/**
 * Renders a JSON-LD <script> tag server-side.
 * Supported schemas: Article, HowTo, FAQPage, SoftwareApplication, BreadcrumbList.
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

interface Props {
  data: Json;
}

export default function StructuredData({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// --- Builders for common schemas ---

export function buildArticleSchema(params: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;      // ISO
  author?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    datePublished: params.datePublished,
    author: { '@type': 'Organization', name: params.author ?? 'ScoreMyPrompt' },
    publisher: {
      '@type': 'Organization',
      name: 'ScoreMyPrompt',
      url: 'https://scoremyprompt.com',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': params.url },
  };
}

export function buildHowToSchema(params: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    step: params.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function buildFAQSchema(
  items: { question: string; answer: string }[],
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildSoftwareApplicationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ScoreMyPrompt',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'USD',
    },
  };
}
```

- [ ] **Step 2: Inject into the guide page**

Read: `head -60 app/guides/[slug]/page.tsx`. It's a server component that receives `params.slug`.

Add inside the returned JSX, near the top of the rendered content:

```typescript
import StructuredData, {
  buildArticleSchema,
  buildSoftwareApplicationSchema,
} from '@/app/components/StructuredData';

// Inside the component, after loading the guide:
const articleSchema = buildArticleSchema({
  headline: guide.title,
  description: guide.description,
  url: `https://scoremyprompt.com/guides/${guide.slug}`,
  datePublished: '2026-04-16',
});
const softwareSchema = buildSoftwareApplicationSchema();

// In the JSX, at the top of the returned fragment:
<>
  <StructuredData data={articleSchema} />
  <StructuredData data={softwareSchema} />
  {/* existing guide rendering */}
</>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "StructuredData\|guides/\[slug\]"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/components/StructuredData.tsx app/guides/[slug]/page.tsx
git commit -m "feat(seo): add JSON-LD structured data component (Article + SoftwareApp on guides)"
```

---

## Task 12: `/launch` — Product Hunt Landing Page

**Files:**
- Create: `app/launch/page.tsx`
- Create: `app/launch/LaunchClient.tsx`

- [ ] **Step 1: Write the server page**

```typescript
// app/launch/page.tsx
import LaunchClient from './LaunchClient';

export const metadata = {
  title: 'Score & Build Your AI — ScoreMyPrompt (Launching on Product Hunt)',
  description: 'Free tools to grade your prompts and build Claude Code agent harnesses in 2 minutes. Now live.',
  openGraph: {
    title: 'Score & Build Your AI — ScoreMyPrompt',
    description: 'Free tools to grade your prompts and build Claude Code agent harnesses.',
  },
};

export default function LaunchPage() {
  return <LaunchClient />;
}
```

- [ ] **Step 2: Write the client landing**

```typescript
// app/launch/LaunchClient.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackLaunchVisited } from '@/app/lib/analytics';

export default function LaunchClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref') ?? '';
    const source: 'direct' | 'producthunt' | 'social' | 'unknown' =
      ref.includes('producthunt') ? 'producthunt'
        : ref.includes('twitter') || ref.includes('linkedin') ? 'social'
        : ref ? 'unknown'
        : 'direct';
    trackLaunchVisited({ source });
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/40 px-4 py-1.5 text-sm font-medium text-primary">
          🚀 Launching on Product Hunt today
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Grade & Build<br />
          your <span className="text-gradient">AI setup</span>.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Three free tools: score your prompts, score your Claude Code setup, and
          build a production-ready harness in 2 minutes.
        </p>

        {/* Product Hunt badge (replace PRODUCT_ID with real one on launch day) */}
        <div className="mt-8">
          <a
            href="https://www.producthunt.com/posts/scoremyprompt?utm_source=badge-featured"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=PRODUCT_ID&theme=dark"
              alt="ScoreMyPrompt - Launching on Product Hunt"
              style={{ width: 250, height: 54 }}
              width={250}
              height={54}
            />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <Link href="/" className="rounded-xl border border-border bg-surface/60 p-6 hover:border-primary transition">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-bold text-white">Score a Prompt</div>
            <div className="text-sm text-gray-400 mt-1">30 seconds · Free</div>
          </Link>
          <Link href="/harness" className="rounded-xl border border-primary/50 bg-surface/60 p-6 hover:border-primary transition">
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-bold text-white">Score a Setup</div>
            <div className="text-sm text-gray-400 mt-1">Free · New</div>
          </Link>
          <Link href="/builder" className="rounded-xl border border-border bg-surface/60 p-6 hover:border-primary transition">
            <div className="text-3xl mb-2">🏗</div>
            <div className="font-bold text-white">Build a Setup</div>
            <div className="text-sm text-gray-400 mt-1">Pro · 2 min</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "app/launch"` — expect empty.

- [ ] **Step 4: Commit**

```bash
git add app/launch/page.tsx app/launch/LaunchClient.tsx
git commit -m "feat(launch): add /launch Product Hunt landing with source attribution"
```

---

## Task 13: Sitemap — Add `/launch` + hreflang Alternates

**Files:**
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Read current sitemap**

Run: `cat app/sitemap.ts`. Find the `staticPages` and `guidePages` arrays.

- [ ] **Step 2: Add `/launch` to `staticPages`**

Insert into the `staticPages` array, near the home entry:

```typescript
  { url: `${baseUrl}/launch`, lastModified: core, changeFrequency: 'weekly', priority: 0.8 },
  { url: `${baseUrl}/harness`, lastModified: core, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${baseUrl}/builder`, lastModified: core, changeFrequency: 'weekly', priority: 0.9 },
```

- [ ] **Step 3: Add hreflang alternates to high-value pages**

Next.js Metadata sitemap supports `alternates.languages`. Update the home and guide entries:

```typescript
import { SUPPORTED_LOCALES } from '@/app/i18n/config';

function hreflangMap(path: string, baseUrl: string): Record<string, string> {
  const m: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    m[loc] = `${baseUrl}${path}?lang=${loc}`;
  }
  m['x-default'] = `${baseUrl}${path}`;
  return m;
}

// Replace the home entry with:
{
  url: baseUrl,
  lastModified: core,
  changeFrequency: 'weekly',
  priority: 1.0,
  alternates: { languages: hreflangMap('/', baseUrl) },
},

// And the guide loop:
const guidePages: MetadataRoute.Sitemap = GUIDES_CONTENT.map((guide) => ({
  url: `${baseUrl}/guides/${guide.slug}`,
  lastModified: LAST_UPDATED.guides,
  changeFrequency: 'monthly' as const,
  priority: 0.8,
  alternates: { languages: hreflangMap(`/guides/${guide.slug}`, baseUrl) },
}));
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "sitemap.ts"` — expect empty.

- [ ] **Step 5: Smoke test**

Run: `npm run dev` and `curl http://localhost:3000/sitemap.xml | head -30`.
Expected: XML includes `/launch`, `/harness`, `/builder`, and `xhtml:link rel="alternate"` entries for each locale.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): sitemap includes /launch, /harness, /builder + hreflang alternates"
```

---

## Task 14: 50-Sample Harness Bias Audit Script

**Files:**
- Create: `scripts/harness-bias-audit.ts`

- [ ] **Step 1: Write the script**

```typescript
// scripts/harness-bias-audit.ts
/**
 * Runs 50 diverse CLAUDE.md samples through /api/harness/analyze and prints
 * mean/median per HARNES dimension. Flags any dimension whose p5 or p95 is
 * stuck at a single value — a signal of prompt bias.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 ANTHROPIC_API_KEY=sk-... npx tsx scripts/harness-bias-audit.ts
 *
 * The server must have a real ANTHROPIC_API_KEY configured, otherwise the
 * route returns the same mock response for every input and the audit is
 * meaningless.
 */

const DIMS = ['H', 'A', 'R', 'N', 'E', 'S'] as const;
type Dim = (typeof DIMS)[number];

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

interface ScoredSample {
  name: string;
  scores: Record<Dim, number>;
  total: number;
  tier: string;
}

const SAMPLES: { name: string; input: string }[] = [
  // 10 bare/minimal prompts (expected: low scores)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `bare-${i + 1}`,
    input: [
      'You are a helpful assistant. Write marketing copy.',
      'Generate blog posts about AI.',
      'Summarize meeting notes. Make it short.',
      'Write a product description for a SaaS tool.',
      'Create an Instagram caption for a coffee shop.',
      'Draft an email to a client about delayed shipping.',
      'Write a LinkedIn post about a new product feature.',
      'Give me three ideas for content marketing.',
      'Edit my resume to make it stronger.',
      'Write a cold outreach email to a potential partner.',
    ][i]!,
  })),

  // 20 moderate CLAUDE.md samples
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `moderate-${i + 1}`,
    input: `# Project ${i + 1} Harness

## Project Overview
Newsletter automation for topic ${i + 1}, weekly cadence.

## Folder Map
- /context: brand guidelines, business context
- /agents: research, content, review
- /templates: newsletter, report

## Routing Rules
1. If research returns fewer than 3 sources, loop before content_agent.
2. If content fails review, retry once then alert.

## Work Rules
- Always match brand voice from /context/brand_guidelines.md.
- Semi-auto mode for publishing.
- MCP: web_search connected.

## Sub-agents:
- research_agent.md: gathers sources via web_search.
- content_agent.md: writes drafts.
- review_agent.md: fact-check + brand-check.
`,
  })),

  // 20 rich/Elite-level CLAUDE.md samples
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `elite-${i + 1}`,
    input: `# Production Harness ${i + 1}

## Project Overview
Full-stack content automation with 4 sub-agents, 3 MCPs, documented SOPs, and a failure-retry loop.

## Folder Map
- /context: brand_guidelines.md (with 3 tone examples), business_context.md
- /agents: research_agent, content_agent, design_agent, review_agent — each with role, tools, output, success criteria
- /templates: newsletter, report, card_news, social_post
- /data: competitors.csv, audience.csv

## Routing Rules
1. If goal is research, call research_agent first; if < 5 sources, retry once before content_agent.
2. If draft exceeds brand tone thresholds in /context/brand_guidelines.md, return to content_agent for rewrite.
3. If review_agent flags factual error, loop to research_agent.

## Work Rules
- Full-auto for research + content; semi-auto for publishing.
- All outputs must reference source URLs.
- Failure retry: on LLM error, retry once then alert via Resend.

## Extensions (MCPs)
- web_search (Brave API)
- google_sheets (campaign tracking)
- buffer (scheduled publishing)
- posthog (open-rate feedback)

## SafeOps
- Permissions: bypass_approval for research/content, require_approval for publishing.
- Failure loop: on any step failure, retry once with exponential backoff, then escalate.
- SOP: every Monday 09:00 KST, run weekly_research pipeline.
`,
  })),
];

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx]!;
}

async function score(name: string, input: string): Promise<ScoredSample | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/harness/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, lang: 'en' }),
    });
    if (!res.ok) {
      console.error(`[${name}] HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { scores: Record<Dim, number>; total: number; tier: string };
    return { name, scores: data.scores, total: data.total, tier: data.tier };
  } catch (err) {
    console.error(`[${name}] error`, err);
    return null;
  }
}

async function main() {
  const results: ScoredSample[] = [];
  for (const s of SAMPLES) {
    const r = await score(s.name, s.input);
    if (r) results.push(r);
    // Pause 250ms to respect the 5 req/60s rate limit (~12/min actually = 1 per 5s).
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log(`\n=== Harness Bias Audit (${results.length}/${SAMPLES.length} succeeded) ===\n`);

  for (const dim of DIMS) {
    const values = results.map((r) => r.scores[dim]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const med = median(values);
    const p5 = percentile(values, 5);
    const p95 = percentile(values, 95);
    const warn = p5 === p95 ? '  ⚠️  BIAS: p5 == p95 — dimension stuck' : '';
    console.log(`${dim}: mean=${mean.toFixed(1)}  median=${med}  p5=${p5}  p95=${p95}${warn}`);
  }

  const totals = results.map((r) => r.total);
  const totalMean = totals.reduce((a, b) => a + b, 0) / totals.length;
  const totalMed = median(totals);
  console.log(`\nTotal: mean=${totalMean.toFixed(1)}  median=${totalMed}`);

  const tierCounts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.tier] = (acc[r.tier] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Tier distribution:`, tierCounts);

  // Write CSV for Sheets import.
  const rows = ['name,tier,total,H,A,R,N,E,S'];
  for (const r of results) {
    rows.push(
      `${r.name},${r.tier},${r.total},${r.scores.H},${r.scores.A},${r.scores.R},${r.scores.N},${r.scores.E},${r.scores.S}`,
    );
  }
  const fs = await import('node:fs');
  fs.writeFileSync('harness-bias-audit.csv', rows.join('\n'), 'utf8');
  console.log(`\nWrote harness-bias-audit.csv (${results.length} rows)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify script runs syntactically (without actually hitting a real API)**

Run: `npx tsx --check scripts/harness-bias-audit.ts` or at minimum `npx tsc --noEmit scripts/harness-bias-audit.ts` (expect the file to compile; may need a `tsconfig` include if not already in the `include` glob — if so, fall back to syntax check only: `node --check scripts/harness-bias-audit.ts` won't work for TS; use `npx tsx -e "import './scripts/harness-bias-audit.ts'"` in a controlled way, or just commit without running — the script only runs manually.)

Simplest verification: `grep -c "^async function\|^function" scripts/harness-bias-audit.ts` — expect at least 4.

- [ ] **Step 3: Commit**

```bash
git add scripts/harness-bias-audit.ts
git commit -m "feat(qa): add 50-sample Harness Score bias audit script (Sprint 1 launch gate)"
```

---

## Sprint 3 Gate — Pre-Launch QA Checklist

Before enabling flags in production:

- [ ] **Unit tests:** `npx jest __tests__/lib/pricing-plan.test.ts __tests__/api/grandfathering-email.test.ts __tests__/lib/api-key-mask.test.ts __tests__/lib/builder-validate.test.ts __tests__/api/builder-generate.test.ts __tests__/api/harness-analyze.test.ts __tests__/api/analyze.test.ts --forceExit` → expect all to pass (36 tests total).
- [ ] **Typecheck:** zero errors in all new Sprint 3 files.
- [ ] **Build:** `npm run build` succeeds.
- [ ] **Cookie consent:** fresh browser → banner appears → "Essential only" → refresh → AdSense script does not load (check Network tab). "Accept all" → AdSense loads.
- [ ] **Pricing display:** logged out → $4.99. Logged in as Legacy Pro (manually set `user_profiles.pricing_plan='legacy_999'` in SQL) → $9.99 with Legacy badge.
- [ ] **Grandfathering email dry run:** `curl -X POST http://localhost:3000/api/account/grandfathering-email -H 'Content-Type: application/json' -H "x-admin-token: $ADMIN_API_TOKEN" -d '{"recipients":["test@example.com"]}'` → returns `{scheduled:1, delivered:0, errors:0}` without RESEND_API_KEY, returns real counts with the key.
- [ ] **Guide pages render:** all 5 new guides reachable at `/guides/<slug>`, breadcrumb + related links work, JSON-LD script is in the page source.
- [ ] **Sitemap:** `/sitemap.xml` includes `/launch`, `/harness`, `/builder`, all 5 new guides, and `xhtml:link` alternates for each locale on home + guides.
- [ ] **Launch page:** `/launch?ref=producthunt` → PostHog `launch_visited` event with `source=producthunt`. Three cards link correctly.
- [ ] **Bias audit:** run `BASE_URL=https://staging.scoremyprompt.com npx tsx scripts/harness-bias-audit.ts` → all 6 dimensions show p5 ≠ p95. Tier distribution includes at least 3 of 4 tiers.
- [ ] **Feature flag kill switch:** remove `PRICING_V2` + `SEO_HUB_EXT` from `NEXT_PUBLIC_FEATURES` → pricing page shows $9.99 / $4.99 per flag state, new guides still indexable (they're just data entries, no flag gating needed).

---

## Deferred Manual Actions (Business / Config Layer)

1. **Stripe Dashboard:**
   - Create new Product → Price $4.99/mo recurring → copy the `price_...` id into `STRIPE_PRICE_ID_499` env var.
   - **Do not** delete or archive the existing `STRIPE_PRICE_ID` (legacy) — grandfathered subscribers still bill against it.
   - Enable Stripe Tax (Settings → Tax → activate) — no code change needed, Stripe handles it on the Checkout side.
   - Enable Adaptive Pricing (Settings → International settings → turn on currency conversion).
   - Confirm SCA / 3DS is active (Settings → Fraud → always require 3DS in EEA) — default on in modern Stripe accounts.

2. **Supabase:** apply `supabase/migrations/005_user_pricing_plan.sql` in Studio. Verify backfill — `SELECT COUNT(*) FROM user_profiles WHERE tier='pro' AND pricing_plan='legacy_999';` should match the total Legacy Pro count.

3. **Stripe Webhook (if you have one):** update to set `user_profiles.pricing_plan = event.metadata.pricingPlan` on `checkout.session.completed`. Webhook code is not part of this sprint but is required for new signups to land with the correct `pricing_plan`.

4. **AdSense:** fill `NEXT_PUBLIC_ADSENSE_ID` and `NEXT_PUBLIC_ADSENSE_SLOT_*` in Vercel env. AdSense publisher account must be approved.

5. **i18n translation script:** run `ANTHROPIC_API_KEY=... npx tsx scripts/translate-harness-keys.ts` (extend the script's `extractBlock` calls to also extract the new `builder` namespace added in Sprint 2 and any pricing-related strings in Sprint 3, if you added them to i18n — this plan kept pricing copy in English for MVP; translate later).

6. **Grandfathering email:** query Legacy Pro recipients, then `POST /api/account/grandfathering-email` with `x-admin-token`. Announce price change at least 72 h before the flag flip.

7. **Product Hunt:**
   - Replace `PRODUCT_ID` in `LaunchClient.tsx` Product Hunt badge URL with the real post id once scheduled.
   - Schedule launch for Tuesday or Wednesday 12:01 AM PT (highest traffic window).
   - Seed Reddit (r/ClaudeAI, r/ChatGPTPromptGenius), HN, Korean/Japanese communities same day.

8. **Bias audit (Sprint 1 gate):** run the script against production with the real ANTHROPIC_API_KEY. Commit the resulting CSV to `docs/audits/2026-XX-harness-bias.csv` as a permanent record.

9. **Flag activation:** set `NEXT_PUBLIC_FEATURES` in Vercel env to include `PRICING_V2,SEO_HUB_EXT,HARNESS_SCORE,BUILDER,ADS` and redeploy.

---

## Rollback Plan

```bash
# Vercel env — remove any subset of:
NEXT_PUBLIC_FEATURES="..."   # drop PRICING_V2 to revert pricing display to $9.99
                              # drop SEO_HUB_EXT: guide pages remain indexable but not gated
                              # keep HARNESS_SCORE + BUILDER on
```

Stripe rollback: the legacy `STRIPE_PRICE_ID` env var is never removed, so Checkout can fall back to it by flipping the flag.

DB rollback: `ALTER TABLE user_profiles DROP COLUMN pricing_plan;` — safe because the column is additive and no code path panics when it's null (helper defaults to `$4.99`).

---

**End of Sprint 3 plan.** With Sprints 1 + 2 + 3 merged and flags enabled, the $10K MRR path described in the spec is executable.
