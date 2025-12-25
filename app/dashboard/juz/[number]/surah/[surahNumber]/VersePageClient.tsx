import { I18nProvider } from '@/lib/i18n';

interface VersePageClientProps {
  children: React.ReactNode;
  translationCode?: string;
}

export default async function VersePageClient({ children }: VersePageClientProps) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}
