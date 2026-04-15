# ScoreMyPrompt — Global Pivot Design

**Date:** 2026-04-15
**Status:** Draft (pending user review)
**Author:** Claude + Luke

---

## 0. Executive Summary

Pivot ScoreMyPrompt from a single-purpose prompt scorer to a **hybrid scoring + builder platform** targeting **non-developer knowledge workers (marketers, planners, PMs)** globally. Retain the existing brand, SEO footprint, and infrastructure; add two new products (Harness Score, Harness Builder) under the same domain. Lower Pro pricing from $9.99 → $4.99 with expanded ads on Free tier to compete on global volume.

**Goal:** $10K MRR within 6 months of launch via (1) global SEO expansion in 10 languages, (2) viral scoring OG cards, (3) low-friction Pro conversion driven by the Builder product.

---

## 1. Product Architecture

### Site Map

```
scoremyprompt.com/
├── /                       Home — 3-card entry: Score Prompt / Score Setup / Build Setup
├── /harness                Harness Score (NEW) — free funnel #2
├── /builder                Harness Builder wizard (Free: 1/month, Pro: unlimited)
├── /builder/result/:id     Preview + ZIP download + VS Code deep link
├── /templates              Prompt + Harness template gallery (extended)
├── /pricing                Free / Pro $4.99 (price change)
├── /dashboard              Unified history (prompt + harness + builds)
└── /guide/*                SEO hub (harness-101, claude-md-template, etc.)
```

### Brand Positioning

- Tagline: **"ScoreMyPrompt — Grade & Build your AI"**
- No full rebrand. Header copy, OG, footer updated to reflect Score + Build duality.
- Preserves existing SEO authority and domain equity.

### User Flows

**Flow 1 — Top of Funnel (Free, ad-supported)**
```
Google → / → Prompt Score → result (ads)
  ↓ "Your setup also needs a score"
/harness → Harness Score (ads)
  ↓ "Score 60/100. Fix with Builder"
/builder
```

**Flow 2 — Conversion (Free → Pro)**
```
/builder → Free 1/month → "Remove ads + unlimited builds" → Pro $4.99
```

**Flow 3 — SEO Backdoor (global new inflow)**
```
"what is CLAUDE.md" / "how to build AI agent" search
  → /guide/harness-101 (10 languages)
  → /harness → /builder
```

### Architectural Principles

1. **Infra reuse.** New Next.js routes only. No new servers. Supabase gets 3 additional tables.
2. **Serverless ZIP generation.** JSZip in Vercel function memory; no S3; 5-min DB TTL. Zero storage cost.
3. **Ads on Free only.** `<AdSlot>` component null-renders for Pro users.
4. **i18n reuse.** 10-language keys extended with `harness/` and `builder/` namespaces.

---

## 2. Scoring Engines

### Engine #1 — Prompt Score (existing, unchanged)

PROMPT framework, 6 dimensions. Addition: result page CTA **"Now score your AI setup →"** linking to `/harness`.

### Engine #2 — Harness Score (NEW)

Users paste a `CLAUDE.md` file or free-form setup description. Returns score + actionable feedback.

**HARNES Framework (100 pts, 6 dimensions):**

| Dim | Name | Max | Evaluates |
|---|---|---|---|
| **H** | Hierarchy | 15 | Folder structure (`/context`, `/agents`, `/templates`) |
| **A** | Agents | 20 | Sub-agent separation by role |
| **R** | Routing | 15 | Explicit conditional rules ("If X, call Y") |
| **N** | Norms | 15 | Brand/tone guidelines injected |
| **E** | Extensions | 15 | MCP/API/external tool declarations |
| **S** | SafeOps | 20 | SOP documentation + permissions + failure loops |

**API contract:**
```
POST /api/harness/analyze
Body: { input: string, lang: "en"|"ko"|... }
→ Anthropic Haiku 4.5 (cost ~$0.002/call)
→ JSON response: {
    scores: { H, A, R, N, E, S },
    total: number,
    tier: "Elite"|"Proficient"|"Developing"|"NeedsHarness",
    feedback: [{ dim, issue, fix }, ...],
    quick_wins: string[]
  }
→ Save to harness_scores → render result page
```

**Quality controls:**
- System prompt carries 3 few-shot reference `CLAUDE.md` examples for scoring consistency
- 24h input-hash cache to prevent duplicate billing
- User feedback button on each result ("This feels off") → issue ticket via Resend

**Tier visualization for share cards:**
- Elite (85+): Gold badge — "Your agent team is production-ready"
- Proficient (60–84): Silver
- Developing (30–59): Bronze — **prime upsell zone to Builder**
- NeedsHarness (0–29): Red — "Start with /builder"

---

## 3. Harness Builder

### Wizard (5 steps, ~2–3 min)

1. **Role**: Marketer / Planner / PM / Designer / Sales / Other
2. **Goals** (multi-select): weekly research, card news/SNS, competitor monitoring, customer replies, data summaries, meeting notes
3. **Brand**: 3 tone-style example cards (Professional / Friendly / Bold) — no sliders
4. **Tools**: web search, Google Sheets, Notion, Slack, GitHub, Buffer
5. **Automation**: Semi-auto (approve each action) / Full-auto (bypass)

### ZIP Output Structure

```
my-ai-harness/
├── CLAUDE.md              Main SOP (role, routing, rules)
├── /context
│   ├── brand_guidelines.md
│   └── business_context.md
├── /agents
│   ├── research_agent.md
│   ├── content_agent.md
│   └── review_agent.md
├── /templates
│   ├── newsletter_template.md
│   └── report_template.md
├── /data/README.md        How to add CSVs
├── .env.example           Placeholders only, no keys
├── README.md              3-min guide: what is this ZIP
└── QUICKSTART.md          VS Code + Claude Code setup
```

### Generation Pipeline

```
POST /api/builder/generate
Body: { role, goals[], tone{}, tools[], automation, lang }
→ 1. Anthropic Haiku call — system prompt generates file map {path: content}
→ 2. Validate: must contain Routing Rules, ≥2 sub-agent files, no empty placeholders
→ 3. On validation fail → auto-retry once
→ 4. JSZip in-memory → store as JSONB in builder_outputs (5-min TTL)
→ 5. Return { id, previewFiles, selfHarnessScore }
→ 6. /builder/result/:id renders preview + download + VS Code deep link
```

### Result Page — 3-Click Path to Running

```
[Download ZIP]                  Primary CTA
      ↓
[Open in VS Code] — vscode:// deep link (auto OS detect)
      ↓
[60-sec Video Guide] — embedded YouTube
      ↓
[Copy-paste alternative] — for users without VS Code
```

### Gating

| Feature | Free | Pro |
|---|---|---|
| Builder access | 1/month (+1 per verified share) | Unlimited |
| ZIP download | Yes, with 1-line watermark in README | Clean |
| Premium templates (Phase 2) | Locked | Unlocked |
| Ads on preview page | Bottom + sticky | None |

Watermark text: "Created with ScoreMyPrompt — Upgrade to Pro for unlimited builds"

---

## 4. Pricing & Ads

### Pricing Migration

**Legacy preservation:**
- Existing $9.99 subscribers stay on `price_pro_999` → flagged `pro_legacy` in DB
- All new features available to Legacy Pro at no extra cost
- Email announcement before rollout: "Price dropped to $4.99 — you keep $9.99 Legacy with lifetime access to new features"
- UI shows both as simply "Pro" — no discrimination

**New pricing:**
- Free: 20 prompt scores/day, 5 harness scores/day, 1 builder/month, history last 3, ads in 3 slots
- Pro $4.99/month: unlimited everything, no ads, full history, AI rewrite, bulk mode, premium templates

### Ad Strategy — 3 slots (not 5)

| Slot | Location | Why |
|---|---|---|
| `ResultInline` | Mid-scroll on result pages | Native-feeling |
| `ResultBottom` | Below result, pre-share | Pre-viral high intent |
| `FooterSticky` | Mobile bottom only | Non-intrusive |

Removed: HomeHero, BuilderPreview — these are conversion pages, keep ad-free to preserve trust.

Pro users: `<AdSlot>` component null-renders based on auth tier.

Provider: Google AdSense auto-ads + direct sponsorship slots (AI tool vendors) as premium inventory.

### Revenue Projection (6-month)

- MAU 100K @ 95% Free → ~500K ad impressions/month → AdSense RPM $2–8 (region-mixed) → **$1K–4K/mo**
- 2% Free→Pro conversion → 2K subscribers × $4.99 → **$10K/mo**
- **Target: $10K MRR by month 6**

### Global Payment

- Stripe Tax (VAT/GST auto)
- Adaptive Pricing (local currency display)
- SCA 3DS compliance (EU)
- 7-day no-questions refund (existing policy preserved)
- 1-click cancellation (EU Consumer Rights)

---

## 5. Data Model & API

### New Supabase Tables

```sql
create table harness_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  input_hash text,
  input_preview text,           -- first 200 chars only, privacy
  scores jsonb not null,
  total int not null,
  tier text not null,
  feedback jsonb not null,
  lang text default 'en',
  created_at timestamptz default now()
);
create index on harness_scores (user_id, created_at desc);
create index on harness_scores (input_hash);

create table builder_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  answers jsonb not null,
  files jsonb not null,
  harness_score int,
  expires_at timestamptz default (now() + interval '5 minutes'),
  created_at timestamptz default now()
);
create index on builder_outputs (expires_at);

create table builder_quota (
  user_id uuid primary key references auth.users(id),
  month_key text not null,       -- "2026-04"
  builds_used int default 0,
  bonus_from_share int default 0,
  last_share_at timestamptz
);
```

**Anonymous quota:** IP + UA hash → Upstash Redis (free tier), zero DB load.

### New API Endpoints

```
POST   /api/harness/analyze          { input, lang } → score result
GET    /api/harness/history          Pro-only history list
POST   /api/builder/generate         wizard answers → { id, preview, selfScore }
GET    /api/builder/download/:id     ZIP stream (5-min TTL)
POST   /api/builder/claim-share      verified share URL → +1 monthly quota
GET    /api/builder/quota            current quota state
```

### Modified Endpoints

```
POST   /api/stripe/checkout          uses price_pro_499 (legacy _999 retained for Legacy Pro)
GET    /api/dashboard                joins harness_scores + builder_outputs
```

### Middleware Reuse

- Existing rate-limit → Free 20/d for analyze, Pro unlimited
- Existing i18n via `x-user-locale` header
- Zod schemas for new request/response bodies

### Privacy & Security

- Builder input/output purged after 5 minutes (pg_cron)
- Harness input stores preview (200 chars) only; original discarded
- API-key pattern detection → auto-masking + warning banner on user input
- Pro users opt-in to retain full history

### Observability

- PostHog events: `harness_analyzed`, `builder_started`, `builder_completed`, `builder_shared`, `pro_upsell_clicked`
- Sentry covers new routes
- Dashboard KPIs: Prompt→Harness funnel, avg Harness Score, Free→Pro conversion, builder K-factor

---

## 6. Global SEO & i18n

### SEO 3-Layer Plan

**Layer 1 — Commercial intent** ("CLAUDE.md template", "AI agent setup generator") → existing pages + `/harness` + `/builder`

**Layer 2 — Informational hub** (`/guide/*`, new):
- `/guide/harness-101`
- `/guide/claude-md-template`
- `/guide/sub-agents-explained`
- `/guide/mcp-beginners`
- `/guide/prompt-vs-harness`
- `/guide/ai-setup-for-marketers`
- `/guide/ai-setup-for-pm`
- `/guide/ai-setup-for-designers`

**Layer 3 — Longtail** = Layer 1–2 × 10 languages → 600+ indexable pages.

### Content Standards per Guide Page

1. 5-second summary box (featured snippet target)
2. 900–1200 word body, 3–4 line sections
3. Inline CTA widget: "Score your setup now →"
4. 3 related template links (internal linking)

### Content Sourcing

Rewrite the 3 provided reference documents (which are heavily duplicated) through Haiku with different angles + mandatory 30% differentiation per page (industry examples, checklists, FAQs).

### Technical SEO Checklist

| Item | Action |
|---|---|
| `hreflang` | Extend to all new pages across 10 languages |
| Structured data | Add HowTo + FAQ + SoftwareApplication schemas |
| Sitemap | Auto-include new routes |
| Core Web Vitals | Maintain Lighthouse 95+ |
| Translation QA | Re-translate all i18n keys via Claude Sonnet; add feedback button |

### Translation Quality

- Claude Sonnet 4.6 re-translation pass on all keys (one-time ~$20)
- Cultural tone prompting: Japanese (keigo), German (compound nouns), Spanish (formal)
- User "this reads awkward" button → Resend issue ticket

### Regional Strategy

| Region | Focus |
|---|---|
| US/UK/CA/AU | Ad revenue primary (high CPM) |
| KR/JP | Pro subscription marketing |
| DE/FR | GDPR-strict — consent banner + Stripe Tax mandatory |
| BR/IN/MX | Free + Stripe Adaptive Pricing (high volume, low CPM) |
| CN | Excluded from SEO (blocked); zh-CN targets overseas residents |

### Content Release Cadence

- **Phase 1 (launch)**: harness-101, claude-md-template — English first, then 9 languages auto-translated
- **Phase 2 (+30d)**: 3 industry hubs
- **Phase 3 (+60d)**: 15 longtail expansions

### Viral Amplification

1. Share OG cards carry language + score + region badges → organic spread per language
2. Product Hunt simultaneous 10-language launch
3. Reddit (r/ChatGPTPromptGenius, r/ClaudeAI), HN, KR/JP/CN communities seeded
4. Builder share bonus (Fix 7) = viral loop + SEO backlinks double effect

---

## 7. Rollout Plan

### 3-Sprint Timeline (12 weeks)

**Sprint 1 (W1–W4): Foundation & Harness Score**
- HARNES engine + `/api/harness/analyze`
- `/harness` landing + result page + OG card
- Home 3-card entry + new tagline
- Ad 3-slot `<AdSlot>` component
- `harness_scores` migration
- i18n keys for 10 languages
- Feature flag `FF_HARNESS_SCORE`
- **Gate:** internal QA 10 users, 50 sample scores, bias check

**Sprint 2 (W5–W8): Harness Builder**
- 5-step wizard UI (example cards)
- `/api/builder/generate` + JSZip
- `builder_outputs` + 5-min TTL cron
- Result page with VS Code deep link + 60-sec video
- Monthly quota + share bonus loop
- `builder_quota` + Redis anonymous quota
- API-key auto-masking
- Feature flag `FF_BUILDER`
- **Gate:** 20 non-dev beta users, ≥70% ZIP→VS Code success rate

**Sprint 3 (W9–W12): Monetization & Global**
- Stripe `price_pro_499` + Legacy Pro flagging
- `/pricing` revamp + Grandfathering emails
- Stripe Tax + Adaptive Pricing + SCA
- 5 `/guide/*` pages in 10 languages
- `hreflang` + schema.org + sitemap rebuild
- Product Hunt + community seeding prep
- AdSense auto-ads activation
- **Gate:** 48h soak → green KPIs → 100% rollout

### Safety Net

- Legacy $9.99 subscribers never affected
- All features flagged; 30-sec kill switch via Vercel env vars (`FF_*=off`)
- Price rollback = re-activate `price_pro_999` in Stripe dashboard

### Success Metrics

| Metric | S1 end | S2 end | S3 end | +6mo |
|---|---|---|---|---|
| DAU | baseline | +20% | +50% | +300% |
| Harness scores/day | 0 | 500 | 2,000 | 10,000 |
| Builder generations/month | 0 | 200 | 1,500 | 10,000 |
| Free→Pro conversion | 1% | 1.2% | 1.5% | 2% |
| Monthly revenue | $200 | $500 | $2,000 | **$10,000** |
| Organic SEO sessions/month | baseline | +20% | +80% | +500% |
| Viral K-factor | — | — | 0.3 | 0.8+ |

### Risk Matrix

| Risk | Prob | Impact | Mitigation |
|---|---|---|---|
| Legacy Pro churn from price change | Med | High | Grandfathering + pre-announce email |
| Harness Score quality variance | Med | Med | 3 few-shot examples + user feedback button |
| Builder ZIP→VS Code friction | High | High | 60-sec video + copy-paste alt + help chat |
| AdSense approval delay | Med | Med | Carbon/EthicalAds fallback |
| Translation quality issues | Med | Med | Sonnet re-translation + native spot-check + feedback button |
| Haiku API cost spike | Low | Med | 24h input-hash cache + rate limits + alerts |
| GDPR/cookie compliance | Med | High | 5-min TTL + input masking + consent banner |

### Day-1 Kill Switch

```
FF_HARNESS_SCORE=off
FF_BUILDER=off
FF_NEW_PRICING=off
FF_GUIDE_HUB=off
```

---

## 8. Out of Scope (Post-MVP)

- User-submitted template marketplace (Phase 2)
- MCP connector one-click install library
- Cloud execution of generated agents (infra cost explosion)
- Team/Enterprise plans
- GitHub OAuth auto-commit
- API access for Pro users
- Chinese mainland SEO push

---

## 9. Design Decisions Log

| # | Decision | Rationale |
|---|---|---|
| D1 | Hybrid (Score + Builder) over pure pivot | Funnel + monetization balance |
| D2 | Target non-developers | Blue ocean; brand continuity |
| D3 | Single-brand (Option A) | Preserve SEO/domain authority |
| D4 | Free + Pro $4.99 | Simplicity over 3-tier complexity |
| D5 | ZIP-only output | Zero infra cost; matches MVP |
| D6 | 6 HARNES dimensions (not 7) | Mnemonic clarity; brand strength |
| D7 | Home 3-card entry | Non-dev cognitive load reduction |
| D8 | Ad slots 3 (not 5) | Conversion integrity on hero/builder |
| D9 | Builder 1/month (not 1/lifetime) | Return visits + viral share loop |
| D10 | 3-sprint 12-week rollout | Risk-gated, reversible |

---

**End of Design**
