/**
 * Feature flag system for ScoreMyPrompt
 *
 * Usage:
 *   import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
 *   if (isFeatureEnabled('BULK_ANALYZE')) { ... }
 *
 * Flags are controlled via NEXT_PUBLIC_FEATURES env variable:
 *   NEXT_PUBLIC_FEATURES=BULK_ANALYZE,CHALLENGER_MODE,LEADERBOARD_V2
 *
 * In dev mode, all flags default to enabled unless explicitly disabled.
 */

/** All available feature flags */
export const FEATURES = {
  /** Bulk prompt analysis (Pro only) */
  BULK_ANALYZE: 'BULK_ANALYZE',
  /** Challenge mode: re-analyze and compete */
  CHALLENGER_MODE: 'CHALLENGER_MODE',
  /** Leaderboard v2 with real-time updates */
  LEADERBOARD_V2: 'LEADERBOARD_V2',
  /** AI rewrite suggestions */
  REWRITE_SUGGESTION: 'REWRITE_SUGGESTION',
  /** PWA install prompt */
  PWA_INSTALL: 'PWA_INSTALL',
  /** Exit intent modal */
  EXIT_INTENT: 'EXIT_INTENT',
  /** Newsletter signup section */
  NEWSLETTER: 'NEWSLETTER',
  /** Ads enabled */
  ADS: 'ADS',
  /** Guide suggestions on result page */
  GUIDE_SUGGESTIONS: 'GUIDE_SUGGESTIONS',
  /** Dashboard analytics */
  DASHBOARD: 'DASHBOARD',
  /** Stripe billing */
  STRIPE_BILLING: 'STRIPE_BILLING',
  /** Templates library */
  TEMPLATES: 'TEMPLATES',
  /** Harness scoring engine (Sprint 1) */
  HARNESS_SCORE: 'HARNESS_SCORE',
  /** Harness Builder wizard (Sprint 2) */
  BUILDER: 'BUILDER',
  /** New $4.99 pricing (Sprint 3) — when off, pricing page displays $9.99 */
  PRICING_V2: 'PRICING_V2',
  /** Extended SEO hub guide entries (Sprint 3) */
  SEO_HUB_EXT: 'SEO_HUB_EXT',
  /** Free beta mode — all users get Pro features with usage limits (Sprint 4) */
  BETA_MODE: 'BETA_MODE',
} as const;

export type FeatureFlag = (typeof FEATURES)[keyof typeof FEATURES];

/** Flags that are enabled by default in all environments */
const DEFAULT_ENABLED: Set<FeatureFlag> = new Set([
  FEATURES.REWRITE_SUGGESTION,
  FEATURES.PWA_INSTALL,
  FEATURES.EXIT_INTENT,
  FEATURES.NEWSLETTER,
  FEATURES.ADS,
  FEATURES.GUIDE_SUGGESTIONS,
  FEATURES.DASHBOARD,
  FEATURES.TEMPLATES,
]);

/** Flags that are dev-only by default */
const DEV_ONLY: Set<FeatureFlag> = new Set([
  FEATURES.BULK_ANALYZE,
  FEATURES.LEADERBOARD_V2,
  FEATURES.HARNESS_SCORE,
  FEATURES.BUILDER,
  FEATURES.PRICING_V2,
  FEATURES.SEO_HUB_EXT,
  FEATURES.BETA_MODE,
]);

/** Parse enabled features from environment */
function getEnabledFeatures(): Set<string> {
  const envFeatures =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_FEATURES
      : undefined;

  if (envFeatures) {
    return new Set(
      envFeatures
        .split(',')
        .map((f) => f.trim().toUpperCase())
        .filter(Boolean)
    );
  }

  // If no env variable, use defaults
  const isDev =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  const enabled = new Set<string>(DEFAULT_ENABLED);
  if (isDev) {
    for (const flag of DEV_ONLY) {
      enabled.add(flag);
    }
  }
  return enabled;
}

let _enabledFeatures: Set<string> | null = null;

function getFeatures(): Set<string> {
  if (!_enabledFeatures) {
    _enabledFeatures = getEnabledFeatures();
  }
  return _enabledFeatures;
}

/** Check if a feature flag is enabled */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return getFeatures().has(flag);
}

/** Get all enabled features (for debug/admin) */
export function getEnabledFeatureList(): FeatureFlag[] {
  return Array.from(getFeatures()) as FeatureFlag[];
}

/** Reset cached features (for testing) */
export function resetFeatureCache(): void {
  _enabledFeatures = null;
}
