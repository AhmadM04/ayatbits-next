'use client';

import { I18nProvider } from '@/lib/i18n';
import { ReactNode } from 'react';

interface DashboardI18nProviderProps {
  children: ReactNode;
  translationCode?: string;
  messages?: Record<string, any>;
}

export default function DashboardI18nProvider({
  children,
}: DashboardI18nProviderProps) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}
