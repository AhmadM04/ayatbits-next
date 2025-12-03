'use client';

import { I18nProvider } from '@/lib/i18n';
import { ReactNode } from 'react';

interface DashboardI18nProviderProps {
  children: ReactNode;
  translationCode: string;
}

export default function DashboardI18nProvider({
  children,
  translationCode,
}: DashboardI18nProviderProps) {
  return (
    <I18nProvider translationCode={translationCode}>
      {children}
    </I18nProvider>
  );
}

