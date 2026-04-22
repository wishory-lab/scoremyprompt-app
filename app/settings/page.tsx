'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useTranslation } from '@/app/i18n';
import { useLocale } from '@/app/i18n/provider';
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type SupportedLocale } from '@/app/i18n/config';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';

const JOB_ROLES = ['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other'];

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslation();
  const { showToast } = useToast();
  const { user, tier, loading: authLoading, setShowAuth, setAuthMessage, signOut } = useAuth();
  const { locale, setLocale } = useLocale();

  const [defaultRole, setDefaultRole] = useState<string>('Marketing');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load saved preferences
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('smp_default_role');
      if (savedRole) setDefaultRole(savedRole);
    } catch { /* localStorage unavailable */ }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setAuthMessage(t.settings.signInRequired);
      setShowAuth(true);
      router.push('/');
    }
  }, [user, authLoading, router, setShowAuth, setAuthMessage, t.settings.signInRequired]);

  const handleRoleChange = (role: string) => {
    setDefaultRole(role);
    try {
      localStorage.setItem('smp_default_role', role);
    } catch { /* ignore */ }
    showToast(t.settings.saved, 'success');
  };

  const handleLanguageChange = (loc: SupportedLocale) => {
    setLocale(loc);
    showToast(t.settings.saved, 'success');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-800 rounded w-48" />
            <div className="h-48 bg-slate-800 rounded-lg" />
            <div className="h-48 bg-slate-800 rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  const isPro = tier === 'premium' || tier === 'pro';

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark pt-14">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white">{t.settings.title}</h2>
          <p className="text-gray-400 mt-2">{t.settings.subtitle}</p>
        </div>

        {/* Language */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{t.settings.language}</h3>
              <p className="text-sm text-gray-400">{t.settings.languageDesc}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LOCALES.map((loc: SupportedLocale) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all ${
                  locale === loc
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-dark text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                <span className="text-lg">{LOCALE_FLAGS[loc]}</span>
                <span>{LOCALE_NAMES[loc]}</span>
                {locale === loc && (
                  <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Default Job Role */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{t.settings.defaultJobRole}</h3>
              <p className="text-sm text-gray-400">{t.settings.defaultJobRoleDesc}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {JOB_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-4 py-2.5 rounded-lg border text-sm transition-all ${
                  defaultRole === role
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-dark text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{t.settings.theme}</h3>
              <p className="text-sm text-gray-400">{t.settings.themeDesc}</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg border border-border bg-dark text-sm text-gray-400">
              {t.settings.dark}
            </span>
          </div>
        </div>

        {/* Account */}
        <div className="card mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{t.settings.account}</h3>
            <p className="text-sm text-gray-400">{t.settings.accountDesc}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-gray-400">{t.settings.email}</span>
              <span className="text-sm text-white">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-gray-400">{t.settings.plan}</span>
              <span className={`text-sm font-medium ${isPro ? 'text-primary' : 'text-white'}`}>
                {isPro ? t.nav.premiumPlan : t.nav.freePlan}
              </span>
            </div>
            {isPro && (
              <a
                href="/api/stripe/portal"
                className="inline-block text-sm text-primary hover:text-accent transition-colors"
              >
                {t.settings.manageSubscription} →
              </a>
            )}
          </div>

          {/* Sign Out */}
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <button
              onClick={handleSignOut}
              className="btn-secondary text-sm"
            >
              {t.nav.signOut}
            </button>

            {/* Delete Account */}
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-red-400">{t.settings.deleteConfirm}</p>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement actual account deletion API
                      showToast('계정 삭제 기능은 준비 중입니다', 'info');
                      setShowDeleteConfirm(false);
                    }}
                    className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 px-3 py-1 rounded"
                  >
                    {t.settings.deleteAccount}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  {t.settings.deleteAccount}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
