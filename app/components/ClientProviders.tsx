'use client';

import { AuthProvider, useAuth } from './AuthProvider';
import AuthModal from './AuthModal';
import { ToastProvider } from './Toast';
import AnalyticsProvider from './AnalyticsProvider';
import { LocaleProvider } from '../i18n';
import PWAInstall from './PWAInstall';

function GlobalAuthModal() {
  const { showAuth, setShowAuth, authMessage } = useAuth();
  return (
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      message={authMessage}
    />
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AnalyticsProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
            <GlobalAuthModal />
            <PWAInstall />
          </ToastProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </LocaleProvider>
  );
}
