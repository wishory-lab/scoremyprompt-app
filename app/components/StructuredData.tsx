/**
 * Renders a JSON-LD <script> tag server-side.
 * Supported schemas: Article, HowTo, FAQPage, SoftwareApplication, BreadcrumbList.
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

interface Props {
  data: Json;
}

export default function StructuredData({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// --- Builders for common schemas ---

export function buildArticleSchema(params: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;      // ISO
  author?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    datePublished: params.datePublished,
    author: { '@type': 'Organization', name: params.author ?? 'ScoreMyPrompt' },
    publisher: {
      '@type': 'Organization',
      name: 'ScoreMyPrompt',
      url: 'https://scoremyprompt.com',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': params.url },
  };
}

export function buildHowToSchema(params: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: params.name,
    description: params.description,
    step: params.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function buildFAQSchema(
  items: { question: string; answer: string }[],
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildSoftwareApplicationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ScoreMyPrompt',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'USD',
    },
  };
}
