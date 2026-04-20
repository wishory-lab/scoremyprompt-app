'use client';

import Link from 'next/link';
import { TEMPLATES, ALL_ROLES } from './data';
import Footer from '@/app/components/Footer';
import { useTranslation } from '../i18n';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'S':
      return 'text-emerald-400 bg-emerald-900/40 border-emerald-700';
    case 'A':
      return 'text-blue-400 bg-blue-900/40 border-blue-700';
    default:
      return 'text-gray-400 bg-gray-900/40 border-gray-700';
  }
};

export default function TemplatesPage() {
  const t = useTranslation();
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
          <div className="flex items-center gap-4">
            <Link href="/guides" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              {t.templatesPage.navGuides}
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t.templatesPage.navScorePrompt}
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t.templatesPage.heroTitle} <span className="text-gradient">{t.templatesPage.heroTitleHighlight}</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.templatesPage.heroSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <a href="#all" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white">
            {t.templatesPage.filterAll}
          </a>
          {ALL_ROLES.map((role) => (
            <a
              key={role}
              href={`#${role.toLowerCase()}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-dark border border-border text-gray-400 hover:border-primary hover:text-white transition-colors"
            >
              {role}
            </a>
          ))}
        </div>

        {ALL_ROLES.map((role) => {
          const roleTemplates = TEMPLATES.filter((tpl) => tpl.jobRole === role);
          if (roleTemplates.length === 0) return null;

          return (
            <section key={role} id={role.toLowerCase()} className="mb-16 scroll-mt-20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                {role}
                <span className="text-sm font-normal text-gray-400">
                  {roleTemplates.length} {t.templatesPage.templatesSuffix}
                </span>
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {roleTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="card hover:border-primary transition-all duration-200 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white">{template.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold border ${getGradeColor(template.grade)}`}
                      >
                        {template.grade} · {template.score}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-4 flex-1">{template.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-dark border border-border rounded text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="bg-dark border border-border rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-300 line-clamp-3">{template.prompt}</p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/?template=${template.id}`}
                        className="btn-primary flex-1 text-center text-sm py-2"
                      >
                        {t.templatesPage.useTemplate}
                      </Link>
                      <Link
                        href={`/?template=${template.id}&auto=true`}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {t.templatesPage.scoreIt}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="text-center mt-16 py-12 border-t border-border">
          <h3 className="text-2xl font-bold text-white mb-3">{t.templatesPage.bottomCtaTitle}</h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            {t.templatesPage.bottomCtaSubtitle}
          </p>
          <Link href="/" className="btn-primary text-lg px-8 py-3">
            {t.templatesPage.bottomCtaButton}
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'AI Prompt Templates',
            description:
              '21 expert-crafted AI prompt templates scoring 80+ across 7 job roles.',
            url: `${baseUrl}/templates`,
            publisher: {
              '@type': 'Organization',
              name: 'ScoreMyPrompt',
              url: baseUrl,
            },
            numberOfItems: TEMPLATES.length,
          }),
        }}
      />

      <Footer />
    </main>
  );
}
