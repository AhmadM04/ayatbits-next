import { I18nProvider } from '@/lib/i18n';
import { ReactNode } from 'react';
import { getLocaleFromTranslationCode } from '@/lib/i18n-server';

interface DashboardI18nProviderProps {
  children: ReactNode;
  translationCode: string;
  messages: Record<string, any>;
}

export default async function DashboardI18nProvider({
  children,
  translationCode,
  messages,
}: DashboardI18nProviderProps) {
  const locale = getLocaleFromTranslationCode(translationCode);

  return (
    <I18nProvider locale={locale} messages={messages} translationCode={translationCode}>
      {children}
    </I18nProvider>
  );
}
