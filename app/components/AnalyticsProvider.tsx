'use client';

import { useEffect } from 'react';
import { initAnalytics, captureUTMParams } from '@/app/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
    captureUTMParams();
  }, []);

  return <>{children}</>;
}
