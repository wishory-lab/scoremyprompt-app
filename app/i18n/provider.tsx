'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import en, { type Locale, type PartialLocale } from './locales/en';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, mapBrowserLocale, type SupportedLocale } from './config';

// Deep merge partial locale with en fallback
function mergeLocale(partial: PartialLocale): Locale {
  const result = { ...en } as Record<string, unknown>;
  for (const key of Object.keys(partial)) {
    const val = (partial as Record<string, unknown>)[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = { ...(en as Record<string, unknown>)[key] as object, ...val as object };
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result as Locale;
}

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

// Lazy-load locale files to avoid bundling all locales upfront
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const localeLoaders: Record<SupportedLocale, () => Promise<{ default: any }>> = {
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
