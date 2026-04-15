// Lightweight wrapper for PostHog analytics
// Falls back to console.log in development

declare global {
  interface Window {
    posthog?: {
      init: (key: string, config: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) {
    console.log('[Analytics] PostHog key not set — tracking disabled');
    return;
  }

  // PostHog snippet loader (minified vendor code)
  // @ts-expect-error - minified PostHog IIFE snippet
  !function(t: Document, e: Record<string, unknown>){let o: string,n: number,p: HTMLScriptElement,r: HTMLScriptElement;(e as Record<string,unknown>).__SV||(window.posthog=e as Window['posthog'],((e as Record<string,unknown>)._i as unknown[])=[],((e as Record<string,unknown>).init as Function)=function(i: string,s: Record<string,unknown>,a?: string){function g(t: Record<string,unknown>,e: string){const o=e.split(".");2==o.length&&(t=t[o[0]] as Record<string,unknown>,e=o[1]),t[e]=function(){(t as Record<string,unknown[]>).push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=(s.api_host as string)+"/static/array.js",(r=t.getElementsByTagName("script")[0] as HTMLScriptElement).parentNode!.insertBefore(p,r);const u=void 0!==a?((e as Record<string,unknown[]>)[a]=[]):e;for(void 0!==a||(a="posthog"),(u as Record<string,unknown>).people=(u as Record<string,unknown>).people||[],(u as Record<string,unknown>).toString=function(t: boolean){let e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u as Record<string,unknown>,o[n]);((e as Record<string,unknown>)._i as unknown[]).push([i,s,a])},(e as Record<string,unknown>).__SV=1)}(document,window.posthog as unknown as Record<string, unknown>||[]);

  window.posthog?.init(posthogKey, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  });
}

interface AnalysisEvent {
  jobRole: string;
  score: number;
  grade: string;
}

export function trackAnalysis({ jobRole, score, grade }: AnalysisEvent): void {
  if (typeof window === 'undefined') return;

  const event = { job_role: jobRole, score, grade, timestamp: new Date().toISOString() };

  window.posthog?.capture('prompt_analyzed', event);

  if (!isProd) {
    console.log('[Analytics] prompt_analyzed', event);
  }
}

interface ShareEvent {
  method: string;
  score: number;
  grade: string;
}

export function trackShare({ method, score, grade }: ShareEvent): void {
  if (typeof window === 'undefined') return;

  const event = { method, score, grade };
  window.posthog?.capture('score_shared', event);

  if (!isProd) {
    console.log('[Analytics] score_shared', event);
  }
}

export function trackWaitlistSignup({ source }: { source: string }): void {
  if (typeof window === 'undefined') return;

  window.posthog?.capture('waitlist_signup', { source });

  if (!isProd) {
    console.log('[Analytics] waitlist_signup', { source });
  }
}

export function trackDemoClick({ exampleId, difficulty }: { exampleId: string; difficulty: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('demo_example_clicked', { example_id: exampleId, difficulty });
  if (!isProd) {
    console.log('[Analytics] demo_example_clicked', { example_id: exampleId, difficulty });
  }
}

export function trackJobRoleSelected({ jobRole }: { jobRole: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('job_role_selected', { job_role: jobRole });
  if (!isProd) {
    console.log('[Analytics] job_role_selected', { job_role: jobRole });
  }
}

export function trackPromptSubmitted({ jobRole, promptLength }: { jobRole: string; promptLength: number }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('prompt_submitted', { job_role: jobRole, prompt_length: promptLength });
  if (!isProd) {
    console.log('[Analytics] prompt_submitted', { job_role: jobRole, prompt_length: promptLength });
  }
}

// Sprint Plan funnel: page_view → grade_started → grade_completed → share_clicked → waitlist_signup
// grade_started fires when user clicks "Score My Prompt" (before API call)
export function trackGradeStarted({ jobRole, promptLength }: { jobRole: string; promptLength: number }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('grade_started', { job_role: jobRole, prompt_length: promptLength });
  if (!isProd) {
    console.log('[Analytics] grade_started', { job_role: jobRole, prompt_length: promptLength });
  }
}

// grade_completed fires when analysis result is received (alias for prompt_analyzed)
export function trackGradeCompleted({ jobRole, score, grade }: { jobRole: string; score: number; grade: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('grade_completed', { job_role: jobRole, score, grade });
  if (!isProd) {
    console.log('[Analytics] grade_completed', { job_role: jobRole, score, grade });
  }
}

export function trackResultViewed({ score, grade, jobRole }: { score: number; grade: string; jobRole: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('result_viewed', { score, grade, job_role: jobRole });
  if (!isProd) {
    console.log('[Analytics] result_viewed', { score, grade, job_role: jobRole });
  }
}

export function trackSharePageVisited({ score, grade, jobRole }: { score: number; grade: string; jobRole: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('share_page_visited', { score, grade, job_role: jobRole });
  if (!isProd) {
    console.log('[Analytics] share_page_visited', { score, grade, job_role: jobRole });
  }
}

export function trackSignupInitiated({ source }: { source: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('signup_initiated', { source });
  if (!isProd) {
    console.log('[Analytics] signup_initiated', { source });
  }
}

export function trackSharePageCTA({ action }: { action: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('share_page_cta_clicked', { action });
  if (!isProd) {
    console.log('[Analytics] share_page_cta_clicked', { action });
  }
}

export function trackProClicked({ source, plan }: { source: string; plan?: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('pro_clicked', { source, plan: plan || 'pro_monthly' });
  if (!isProd) {
    console.log('[Analytics] pro_clicked', { source, plan });
  }
}

export function trackChallengeStarted({ score, grade }: { score: number; grade: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('challenge_started', { score, grade });
  if (!isProd) {
    console.log('[Analytics] challenge_started', { score, grade });
  }
}

// ─── Phase 4: Funnel + Viral Events ───

export function trackSignupCompleted({ method }: { method: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('signup_completed', { method });
  if (!isProd) {
    console.log('[Analytics] signup_completed', { method });
  }
}

export function trackReturnAnalysis({ analysisCount, jobRole }: { analysisCount: number; jobRole: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('return_analysis', { analysis_count: analysisCount, job_role: jobRole });
  if (!isProd) {
    console.log('[Analytics] return_analysis', { analysis_count: analysisCount, job_role: jobRole });
  }
}

export function trackProSubscribed({ plan, source }: { plan: string; source: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('pro_subscribed', { plan, source });
  if (!isProd) {
    console.log('[Analytics] pro_subscribed', { plan, source });
  }
}

export function trackViralReferral({ shareId, referrerGrade }: { shareId: string; referrerGrade: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('viral_referral', { share_id: shareId, referrer_grade: referrerGrade });
  if (!isProd) {
    console.log('[Analytics] viral_referral', { share_id: shareId, referrer_grade: referrerGrade });
  }
}

export function trackNewsletterSignup({ source }: { source: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('newsletter_signup', { source });
  if (!isProd) {
    console.log('[Analytics] newsletter_signup', { source });
  }
}

// ─── Phase 5: Enhanced Funnel + UTM ───

/** Parse and persist UTM parameters from the current URL */
export function captureUTMParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
    const utmData: Record<string, string> = {};

    for (const key of utmKeys) {
      const value = params.get(key);
      if (value) utmData[key] = value;
    }

    if (Object.keys(utmData).length > 0) {
      // Persist to sessionStorage so it survives page navigation
      try { sessionStorage.setItem('smp_utm', JSON.stringify(utmData)); } catch {}
      window.posthog?.capture('utm_landing', utmData);
      if (!isProd) console.log('[Analytics] utm_landing', utmData);
    }
  } catch {}
}

/** Retrieve stored UTM params (for enriching other events) */
export function getStoredUTM(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem('smp_utm');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function trackExitIntentShown(): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('exit_intent_shown', getStoredUTM());
  if (!isProd) console.log('[Analytics] exit_intent_shown');
}

export function trackExitIntentCTA(): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('exit_intent_cta_clicked', getStoredUTM());
  if (!isProd) console.log('[Analytics] exit_intent_cta_clicked');
}

export function trackPWAInstallPrompted(): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('pwa_install_prompted');
  if (!isProd) console.log('[Analytics] pwa_install_prompted');
}

export function trackPWAInstalled(): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('pwa_installed');
  if (!isProd) console.log('[Analytics] pwa_installed');
}

export function trackShareCardDownloaded({ score, grade }: { score: number; grade: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('share_card_downloaded', { score, grade });
  if (!isProd) console.log('[Analytics] share_card_downloaded', { score, grade });
}

export function trackLocaleChanged({ from, to }: { from: string; to: string }): void {
  if (typeof window === 'undefined') return;
  window.posthog?.capture('locale_changed', { from, to });
  if (!isProd) console.log('[Analytics] locale_changed', { from, to });
}

// ─── Harness Score (Sprint 1) ────────────────────────────────────────
interface HarnessAnalyzedEvent {
  lang: string;
  total?: number;
  tier?: string;
}

export function trackHarnessAnalyzed({ lang, total, tier }: HarnessAnalyzedEvent): void {
  if (typeof window === 'undefined') return;
  const event = { lang, total, tier, timestamp: new Date().toISOString() };
  window.posthog?.capture('harness_analyzed', event);
  if (!isProd) console.log('[Analytics] harness_analyzed', event);
}

interface HarnessShareEvent {
  tier: string;
  total: number;
  method: 'native' | 'clipboard';
}

export function trackHarnessShared({ tier, total, method }: HarnessShareEvent): void {
  if (typeof window === 'undefined') return;
  const event = { tier, total, method, timestamp: new Date().toISOString() };
  window.posthog?.capture('harness_shared', event);
  if (!isProd) console.log('[Analytics] harness_shared', event);
}

interface HarnessUpsellEvent {
  tier: string;
  total: number;
  from: 'result_page' | 'home_card';
}

export function trackHarnessUpsellClicked({ tier, total, from }: HarnessUpsellEvent): void {
  if (typeof window === 'undefined') return;
  const event = { tier, total, from, timestamp: new Date().toISOString() };
  window.posthog?.capture('harness_upsell_clicked', event);
  if (!isProd) console.log('[Analytics] harness_upsell_clicked', event);
}
