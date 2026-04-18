# ScoreMyPrompt — Claude Code Operating Manual

## What Is This

AI prompt quality scoring platform. Users paste a prompt, get a 0-100 score across PROMPT 6 dimensions (Precision, Role, Output, Mission, Patterning, Tailoring) + actionable feedback.

**Live**: https://scoremyprompt.app

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS (dark theme, `primary` + `accent` gradients)
- **Database**: Supabase (Postgres + RLS + pg_cron)
- **Auth**: Supabase Auth (Magic Link + Google OAuth, Bearer token in API routes)
- **AI**: Anthropic Claude Haiku 4.5 (direct fetch, no SDK wrapper)
- **Payments**: Stripe (Checkout + webhooks)
- **Email**: Resend
- **Analytics**: PostHog (client-side via window.posthog)
- **Errors**: Sentry
- **Deploy**: Vercel

## Key Directories

```
app/
├── api/              API routes (analyze, harness/analyze, builder/*, stripe/*, admin/*)
├── harness/          HARNES 6-dim setup scoring
├── builder/          5-step wizard → ZIP generation
├── pricing/          PricingClient + server wrapper
├── guides/           SEO hub (data-driven, content.ts)
├── launch/           Product Hunt landing
├── i18n/             10-lang i18n (provider.tsx + locales/*.ts)
├── lib/              Shared: rate-limit, errors, logger, auth, analytics, features, etc.
├── types/            Zod schemas (harness.ts, builder.ts)
├── constants/        System prompts + messages
└── components/       Shared UI (AdSlot, CookieConsent, Modal, etc.)

supabase/
├── 01_tables.sql     Base schema
├── migrations/       003–005 (harness_scores, builder_*, pricing_plan)
└── 05_rls.sql        Row-level security

docs/
├── modoo-2026/       모두의 창업 2026 제출 패키지
├── deploy/           Deployment runbook + SQL + env template
└── superpowers/
    ├── specs/        Design specs
    └── plans/        Sprint 1/2/3 implementation plans
```

## How to Run

```bash
npm install
cp .env.example .env.local   # Fill in API keys
npm run dev                   # http://localhost:3000
npm run test                  # Jest (45+ tests, --forceExit recommended)
npm run build                 # Production build
npm run typecheck             # tsc --noEmit
```

## Feature Flags

Controlled by `NEXT_PUBLIC_FEATURES` env var (comma-separated). See `app/lib/features.ts`.

Key flags: `HARNESS_SCORE`, `BUILDER`, `PRICING_V2`, `SEO_HUB_EXT`, `ADS`

Dev mode enables `DEV_ONLY` flags automatically.

## Auth Pattern

API routes use Bearer tokens:
```typescript
const authHeader = req.headers.get('authorization');
const token = authHeader?.substring(7);
const { data: { user } } = await supabase.auth.getUser(token);
```

Test mode uses `x-mock-user-id` header (NODE_ENV=test only).

## i18n

- Source of truth: `app/i18n/locales/en.ts`
- Other locales use `PartialLocale` type (missing keys fall back to English at runtime via `mergeLocale()` in provider.tsx)
- Translation script: `scripts/translate-harness-keys.ts`

## Testing

```bash
npx jest __tests__/api/ --forceExit          # API route tests
npx jest __tests__/lib/ --forceExit          # Library tests
npx jest __tests__/components/ --forceExit    # Component tests
```

Tests run without API keys (mock mode). Rate-limit tests need unique IPs per test to avoid 429 collisions.

## Adding New API Routes

1. Create `app/api/<name>/route.ts`
2. Use Zod for request validation
3. Apply `rateLimit(req, LIMITS.ANALYZE)` at top
4. Return via `Response.json()` with `errorResponse()` for errors
5. Add test in `__tests__/api/<name>.test.ts`
6. Add PostHog tracking wrapper in `app/lib/analytics.ts`

## Adding New i18n Keys

1. Add keys to `app/i18n/locales/en.ts` (source of truth)
2. Add Korean translation to `ko.ts`
3. Run `scripts/translate-harness-keys.ts` for other 8 languages
4. Non-English locales use `PartialLocale` — missing keys show English fallback

## Critical Rules

- **Never hardcode fake metrics** (5,000+, 92%, etc.) — removed for government grant compliance
- **Never commit .env files** — use .env.example for structure
- **Always use `safeCompare()` for admin token checks** (timing-attack prevention)
- **API-key detection**: `app/lib/api-key-mask.ts` scans for Anthropic/OpenAI/GitHub/Slack/AWS patterns
- **Stripe webhook uses SDK `constructEvent()`** — never homebrew HMAC
