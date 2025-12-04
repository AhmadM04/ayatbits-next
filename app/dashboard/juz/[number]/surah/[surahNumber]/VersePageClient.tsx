'use client';

import { I18nProvider } from '@/lib/i18n';
import { useMemo } from 'react';

interface VersePageClientProps {
  children: React.ReactNode;
  translationCode: string;
}

export default function VersePageClient({ children, translationCode }: VersePageClientProps) {
  return (
    <I18nProvider translationCode={translationCode}>
      {children}
    </I18nProvider>
  );
}




