'use client';

import { I18nProvider } from '@/lib/i18n';
import { TutorialWrapper } from '@/components/tutorial';
import { verseBrowsingTutorialSteps } from '@/lib/tutorial-configs';

interface VersePageClientProps {
  children: React.ReactNode;
  translationCode?: string;
}

export default function VersePageClient({ children }: VersePageClientProps) {
  return (
    <I18nProvider>
      <TutorialWrapper sectionId="verse_browsing" steps={verseBrowsingTutorialSteps} delay={1000}>
        {children}
      </TutorialWrapper>
    </I18nProvider>
  );
}
