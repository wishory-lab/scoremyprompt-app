'use client';

import { useLocale } from '@/app/i18n';

/**
 * Returns a locale-prefixed path for SEO-friendly internal links.
 * English (default) paths have no prefix; other locales get /ko/, /ja/, etc.
 */
export function useLocalizedHref(path: string): string {
  const { locale } = useLocale();
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}
