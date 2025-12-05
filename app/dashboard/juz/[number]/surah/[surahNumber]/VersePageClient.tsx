import { I18nProvider } from '@/lib/i18n';
import { getMessages, getLocaleFromTranslationCode } from '@/lib/i18n-server';
import { DEFAULT_LOCALE } from '@/lib/i18n-config';

interface VersePageClientProps {
  children: React.ReactNode;
  translationCode: string;
}

export default async function VersePageClient({ children, translationCode }: VersePageClientProps) {
  // Load messages on server side based on translation code
  const locale = getLocaleFromTranslationCode(translationCode);
  const messages = await getMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages} translationCode={translationCode}>
      {children}
    </I18nProvider>
  );
}
