'use client';

import { useTranslation } from '../../i18n';

export default function CommunityCTA() {
  const t = useTranslation();
  return (
    <div className="card bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 text-center py-8">
      <h2 className="text-2xl font-bold text-white mb-3">{t.community.joinTitle}</h2>
      <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm">
        {t.community.joinSubtitle}
      </p>
      <a href="https://x.com/scoremyprompt" target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">
        {t.community.follow}
      </a>
    </div>
  );
}
