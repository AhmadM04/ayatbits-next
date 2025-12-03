'use client';

import { I18nProvider } from '@/lib/i18n';
import { ReactNode, useLayoutEffect } from 'react';

interface DashboardI18nProviderProps {
  children: ReactNode;
  translationCode: string;
}

export default function DashboardI18nProvider({
  children,
  translationCode,
}: DashboardI18nProviderProps) {
  // Use useLayoutEffect to sync BEFORE paint, so it's available immediately
  useLayoutEffect(() => {
    if (translationCode && typeof window !== 'undefined') {
      localStorage.setItem('selectedTranslation', translationCode);
      console.log('DashboardI18nProvider - synced to localStorage:', translationCode);
    }
  }, [translationCode]);

  // Also sync immediately on first render (for SSR hydration)
  if (typeof window !== 'undefined' && translationCode) {
    localStorage.setItem('selectedTranslation', translationCode);
  }

  return (
    <I18nProvider translationCode={translationCode}>
      {children}
    </I18nProvider>
  );
}
