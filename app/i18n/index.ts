/**
 * i18n — Lightweight internationalization system for ScoreMyPrompt.
 *
 * Usage:
 *   import { useTranslation } from '@/app/i18n';
 *   const t = useTranslation();
 *   <h1>{t.hero.title}</h1>
 *
 * To add a new locale:
 *   1. Create app/i18n/locales/{code}.ts (copy en.ts structure)
 *   2. Add the import to LOCALES below
 *   3. The LocaleProvider in layout picks up the user's preference
 */

export { LocaleProvider, useTranslation, useLocale } from './provider';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './config';
