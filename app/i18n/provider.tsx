'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import en, { type Locale, type PartialLocale } from './locales/en';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, mapBrowserLocale, type SupportedLocale } from './config';

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: Locale;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: en,
});

const STORAGE_KEY = 'smp_locale';

// Lazy-load locale files to avoid bundling all locales upfront.
// Non-English locales use PartialLocale — missing keys fall back to English.
const localeLoaders: Record<SupportedLocale, () => Promise<{ default: Locale | PartialLocale }>> = {
  en: () => Promise.resolve({ default: en }),
  ko: () => import('./locales/ko'),
  ja: () => import('./locales/ja'),
  'zh-CN': () => import('./locales/zh-CN'),
  'zh-TW': () => import('./locales/zh-TW'),
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  de: () => import('./locales/de'),
  pt: () => import('./locales/pt'),
  hi: () => import('./locales/hi'),
};

function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  return mapBrowserLocale(navigator.language);
}

/**
 * Deep-merge a partial translation onto the English base so missing keys
 * fall back to English at runtime while still type-checking as Locale.
 */
function mergeLocale(partial: PartialLocale): Locale {
  function merge<T>(base: T, patch: unknown): T {
    if (patch === null || patch === undefined) return base;
    if (typeof base !== 'object' || base === null) return (patch as T) ?? base;
    if (typeof patch !== 'object') return base;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
      out[k] = merge((base as Record<string, unknown>)[k], v);
    }
    return out as T;
  }
  return merge(en, partial);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Locale>(en);

  // Initialize from stored preference or browser detection
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      const initial = stored && SUPPORTED_LOCALES.includes(stored) ? stored : detectBrowserLocale();
      if (initial !== DEFAULT_LOCALE) {
        setLocaleState(initial);
        localeLoaders[initial]().then((mod) => setMessages(mergeLocale(mod.default)));
      }
    } catch { /* SSR or private browsing */ }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try { localStorage.setItem(STORAGE_KEY, newLocale); } catch {}
    localeLoaders[newLocale]().then((mod) => setMessages(mergeLocale(mod.default)));
    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Returns the current locale's translation object. */
export function useTranslation(): Locale {
  return useContext(LocaleContext).t;
}

/** Returns locale state and setter. */
export function useLocale() {
  const { locale, setLocale } = useContext(LocaleContext);
  return { locale, setLocale };
}
