export const SUPPORTED_LOCALES = [
  'en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'hi',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  hi: 'हिन्दी',
};

/** Flag emojis for UI display */
export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇺🇸',
  ko: '🇰🇷',
  ja: '🇯🇵',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇧🇷',
  hi: '🇮🇳',
};

/** Map browser language codes to our supported locales */
export function mapBrowserLocale(browserLang: string): SupportedLocale {
  const lang = browserLang.toLowerCase();
  // Exact match first
  if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  // Map zh variants
  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hant')) return 'zh-TW';
  if (lang.startsWith('zh')) return 'zh-CN';
  // Map pt variants
  if (lang.startsWith('pt')) return 'pt';
  // Base language match
  const base = lang.split('-')[0];
  if (SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
    return base as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}
