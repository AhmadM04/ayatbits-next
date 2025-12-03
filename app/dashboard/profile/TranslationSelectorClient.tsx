'use client';

import { useState, useLayoutEffect } from 'react';
import TranslationSelector from './TranslationSelector';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface TranslationSelectorClientProps {
  initialSelectedTranslation: string;
}

export default function TranslationSelectorClient({
  initialSelectedTranslation,
}: TranslationSelectorClientProps) {
  const [selectedTranslation, setSelectedTranslation] = useState(initialSelectedTranslation);
  const router = useRouter();
  const { t } = useI18n();

  // Sync initial translation to localStorage on mount (immediately)
  useLayoutEffect(() => {
    if (initialSelectedTranslation && typeof window !== 'undefined') {
      localStorage.setItem('selectedTranslation', initialSelectedTranslation);
    }
  }, [initialSelectedTranslation]);

  const handleSelect = async (translationCode: string) => {
    // Save to localStorage IMMEDIATELY before any async operation
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTranslation', translationCode);
    }
    
    setSelectedTranslation(translationCode);

    try {
      const response = await fetch('/api/user/translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translation: translationCode }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to update translation');
      }
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h3 className="font-semibold mb-1">{t('profile.selectTranslation')}</h3>
      <p className="text-xs text-gray-500 mb-4">{t('profile.translationDescription')}</p>
      <TranslationSelector
        currentTranslation={selectedTranslation}
        onSelect={handleSelect}
      />
    </div>
  );
}
