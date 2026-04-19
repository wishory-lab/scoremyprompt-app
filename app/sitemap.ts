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

  /**
   * Build an hreflang alternates map for a given path.
   * English uses no locale prefix; all other locales use /{loc}{path}.
   * x-default always points to the canonical English URL.
   */
  function hreflangMap(path: string): Record<string, string> {
    const m: Record<string, string> = {};
    for (const loc of SUPPORTED_LOCALES) {
      m[loc] = loc === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${loc}${path}`;
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
    {
      url: `${baseUrl}/pricing`,
      lastModified: core,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: hreflangMap('/pricing') },
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: core,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: hreflangMap('/guides') },
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: core,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: hreflangMap('/templates') },
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: core,
      changeFrequency: 'daily',
      priority: 0.7,
      alternates: { languages: hreflangMap('/leaderboard') },
    },
    {
      url: `${baseUrl}/challenge`,
      lastModified: core,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: { languages: hreflangMap('/challenge') },
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: core,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: hreflangMap('/compare') },
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: core,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: { languages: hreflangMap('/changelog') },
    },
    {
      url: `${baseUrl}/launch`,
      lastModified: core,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: hreflangMap('/launch') },
    },
    {
      url: `${baseUrl}/harness`,
      lastModified: core,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: hreflangMap('/harness') },
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: core,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: hreflangMap('/builder') },
    },
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

  return [...staticPages, ...guidePages];
}
