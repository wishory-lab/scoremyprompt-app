import { GUIDES_CONTENT } from '../content';
import Link from 'next/link';
import type { Metadata } from 'next';
import { autoLinkGuides } from '@/app/lib/autoLinkGuides';
import Footer from '@/app/components/Footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDES_CONTENT.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES_CONTENT.find((g) => g.slug === slug);

  if (!guide) {
    return {
      title: 'Guide Not Found | ScoreMyPrompt',
      description: 'The guide you are looking for does not exist.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';

  return {
    title: `${guide.title} | ScoreMyPrompt`,
    description: guide.description,
    keywords: `${guide.title}, prompt engineering, ${guide.difficulty}, ${guide.slug.replace(/-/g, ', ')}`,
    alternates: { canonical: `${baseUrl}/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${baseUrl}/guides/${guide.slug}`,
      siteName: 'ScoreMyPrompt',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: guide.title,
      description: guide.description,
      creator: '@scoremyprompt',
    },
  };
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-emerald-900/40 text-emerald-300 border border-emerald-700';
    case 'Intermediate':
      return 'bg-blue-900/40 text-blue-300 border border-blue-700';
    case 'Advanced':
      return 'bg-purple-900/40 text-purple-300 border border-purple-700';
    default:
      return 'bg-gray-900/40 text-gray-300 border border-gray-700';
  }
};

export default async function GuideDetail({ params }: PageProps) {
  const { slug } = await params;
  const guide = GUIDES_CONTENT.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
        <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Guide Not Found</h1>
          <p className="text-gray-400 mb-6">The guide you are looking for does not exist.</p>
          <Link href="/guides" className="btn-primary">
            Back to Guides
          </Link>
        </div>
      </main>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';

  // Use relatedSlugs for relevance-based related guides, fallback to first 3 others
  const relatedGuides = guide.relatedSlugs
    ? guide.relatedSlugs
        .map((s) => GUIDES_CONTENT.find((g) => g.slug === s))
        .filter((g): g is NonNullable<typeof g> => g != null)
        .slice(0, 3)
    : GUIDES_CONTENT.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/guides" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              All Guides
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Score a Prompt →
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </li>
          <li className="text-gray-600">/</li>
          <li>
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          </li>
          <li className="text-gray-600">/</li>
          <li className="text-white font-medium truncate max-w-[200px] sm:max-w-none">{guide.title}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Table of Contents */}
            <div className="card">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contents</h3>
              <nav className="space-y-2">
                {guide.sections.map((section, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="text-xs text-gray-400 hover:text-primary transition-colors block truncate"
                  >
                    {section.heading}
                  </a>
                ))}
              </nav>
            </div>

            {/* Score CTA Card */}
            <div className="card bg-gradient-to-b from-primary/20 to-accent/10 border border-primary/30">
              <h3 className="text-lg font-bold text-white mb-3">Score Your Prompt</h3>
              <p className="text-sm text-gray-400 mb-4">
                Apply what you've learned. Analyze your prompts and get instant feedback.
              </p>
              <Link href="/" className="btn-primary w-full text-center text-sm">
                Start Scoring
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Guide Header */}
          <article className="max-w-3xl">
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getDifficultyColor(guide.difficulty)}`}>
                  {guide.difficulty}
                </span>
                <span className="text-sm text-gray-400">{guide.readingTime} min read</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                {guide.title}
              </h1>

              <p className="text-xl text-gray-400">
                {guide.description}
              </p>
            </div>

            {/* Guide Content Sections */}
            <div className="space-y-12">
              {guide.sections.map((section, idx) => (
                <section key={idx} id={`section-${idx}`} className="scroll-mt-20">
                  <h2 className="text-2xl font-bold text-white mt-10 mb-4">
                    {section.heading}
                  </h2>

                  <div className="space-y-4 text-gray-300 prose-invert max-w-none" style={{ lineHeight: 'var(--leading-relaxed)' }}>
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className="mb-4">
                        {autoLinkGuides(paragraph, guide.slug)}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Test What You Learned CTA */}
            <div className="mt-16 pt-12 border-t border-border">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Test What You Learned
                </h2>
                <p className="text-gray-400 mb-2">
                  Apply what you've learned with our free PROMPT Score analyzer.
                </p>
                {guide.relevantDimensions && guide.relevantDimensions.length > 0 && (
                  <p className="text-sm text-gray-400 mb-6">
                    This guide focuses on{' '}
                    <span className="text-primary font-medium">
                      {guide.relevantDimensions.join(', ')}
                    </span>{' '}
                    — score your prompt and see how you do on these dimensions.
                  </p>
                )}
                <Link href="/" className="btn-primary">
                  Score your prompt now →
                </Link>
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="mt-8 bg-surface border border-border rounded-lg p-6 text-center">
              <p className="text-sm font-semibold text-white mb-1">Get weekly prompt tips</p>
              <p className="text-xs text-gray-400 mb-4">Join 5K+ professionals improving their AI skills.</p>
              <Link href="/#waitlist" className="btn-secondary text-sm">
                Subscribe for free →
              </Link>
            </div>

            {/* Related Guides */}
            <div className="mt-16 pt-12 border-t border-border">
              <h2 className="text-2xl font-bold text-white mb-2">If you liked this, read next</h2>
              <p className="text-sm text-gray-400 mb-6">Continue building your prompt engineering skills.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedGuides.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.slug}
                    href={`/guides/${relatedGuide.slug}`}
                    className="card hover:border-primary hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors mb-2">
                          {relatedGuide.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {relatedGuide.description.substring(0, 80)}...
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(relatedGuide.difficulty)}`}>
                          {relatedGuide.difficulty}
                        </span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            image: 'https://scoremyprompt.com/og-image.png',
            datePublished: new Date().toISOString().split('T')[0],
            author: {
              '@type': 'Organization',
              name: 'ScoreMyPrompt',
              url: 'https://scoremyprompt.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'ScoreMyPrompt',
              logo: {
                '@type': 'ImageObject',
                url: 'https://scoremyprompt.com/favicon.svg',
              },
            },
            articleBody: guide.sections.map((s) => s.content.join(' ')).join(' '),
            keywords: `prompt engineering, ${guide.difficulty}, AI, ChatGPT, Claude`,
          }),
        }}
      />

      {/* BreadcrumbList JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${baseUrl}/guides` },
              { '@type': 'ListItem', position: 3, name: guide.title, item: `${baseUrl}/guides/${guide.slug}` },
            ],
          }),
        }}
      />

      <Footer />
    </main>
  );
}
