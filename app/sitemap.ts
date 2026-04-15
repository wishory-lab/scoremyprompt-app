import type { MetadataRoute } from 'next';
import { GUIDES_CONTENT } from './guides/content';
import { SUPPORTED_LOCALES } from './i18n/config';

/** Last content update per section — update these when content actually changes */
const LAST_UPDATED = {
  core: '2026-03-09',
  guides: '2026-03-09',
  legal: '2025-03-01',
} as const;

/**
 * Dynamic sitemap generator.
 * Includes all public pages, guide pages, and the changelog.
 * Uses fixed dates per section to avoid signaling false freshness.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';
  const core = LAST_UPDATED.core;
  const legal = LAST_UPDATED.legal;

  function hreflangMap(path: string): Record<string, string> {
    const m: Record<string, string> = {};
    for (const loc of SUPPORTED_LOCALES) {
      m[loc] = `${baseUrl}${path}${path.includes('?') ? '&' : '?'}lang=${loc}`;
    }
    m['x-default'] = `${baseUrl}${path}`;
    return m;
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: core,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: hreflangMap('/') },
    },
    { url: `${baseUrl}/pricing`, lastModified: core, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/guides`, lastModified: core, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/templates`, lastModified: core, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: core, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/challenge`, lastModified: core, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/compare`, lastModified: core, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: core, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/launch`, lastModified: core, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/harness`, lastModified: core, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/builder`, lastModified: core, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: legal, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: legal, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const guidePages: MetadataRoute.Sitemap = GUIDES_CONTENT.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: LAST_UPDATED.guides,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    alternates: { languages: hreflangMap(`/guides/${guide.slug}`) },
  }));

  // Alternate language URLs for key pages
  const langs = ['ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'hi'];
  const i18nPages: MetadataRoute.Sitemap = langs.map((lang) => ({
    url: `${baseUrl}?lang=${lang}`,
    lastModified: core,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...guidePages, ...i18nPages];
}
