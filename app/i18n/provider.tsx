'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import en, { type Locale } from './locales/en';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './config';

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
const localeLoaders: Record<SupportedLocale, () => Promise<{ default: Locale }>> = {
  en: () => Promise.resolve({ default: en }),
  ko: () => import('./locales/ko'),
};

function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const browserLang = navigator.language.split('-')[0];
  return SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)
    ? (browserLang as SupportedLocale)
    : DEFAULT_LOCALE;
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
        localeLoaders[initial]().then((mod) => setMessages(mod.default));
      }
    } catch { /* SSR or private browsing */ }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try { localStorage.setItem(STORAGE_KEY, newLocale); } catch {}
    localeLoaders[newLocale]().then((mod) => setMessages(mod.default));
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
