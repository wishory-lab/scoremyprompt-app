'use client';

import { useTranslation } from '@/app/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const t = useTranslation();

  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} ScoreMyPrompt
            </p>
            <span className="text-gray-600 hidden sm:inline">&middot;</span>
            <a href="/guide" className="text-gray-500 hover:text-white transition-colors">
              {t.footer.guides}
            </a>
            <a href="/guides" className="text-gray-500 hover:text-white transition-colors">
              Articles
            </a>
            <a href="/changelog" className="text-gray-500 hover:text-white transition-colors">
              Changelog
            </a>
            <a href="/privacy" className="text-gray-500 hover:text-white transition-colors">
              {t.footer.privacy}
            </a>
            <a href="/terms" className="text-gray-500 hover:text-white transition-colors">
              {t.footer.terms}
            </a>
            <a href="/security-policy" className="text-gray-500 hover:text-white transition-colors">
              Security
            </a>
            <span className="text-gray-600 hidden sm:inline">&middot;</span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-4">
            {/* X / Twitter */}
            <a
              href="https://x.com/scoremyprompt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Follow us on X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/scoremyprompt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Follow us on LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com/@scoremyprompt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Subscribe on YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            {/* Bluesky */}
            <a
              href="https://bsky.app/profile/scoremyprompt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Follow us on Bluesky"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 600 530" aria-hidden="true"><path d="M135.72 44.03C202.216 93.951 273.74 195.86 300 249.834c26.262-53.974 97.782-155.883 164.28-205.804C520.074-1.248 630-46.996 630 105.28c0 30.394-17.396 255.372-27.6 291.96-35.466 127.196-165.416 159.608-282.348 139.952 204.396 34.764 256.272 149.876 144.012 265.2C345.766 924.724 300 844.5 300 844.5s-45.766 80.224-164.064-42.108C23.676 687.068 75.552 571.956 279.948 537.192 163.016 556.848 33.066 524.436-2.4 397.24-12.596 360.652-30 135.674-30 105.28-30-46.996 79.926-1.248 135.72 44.03z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
