'use client';

import { useState } from 'react';
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

  const handleSelect = async (translationCode: string) => {
    try {
      const response = await fetch('/api/user/translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translation: translationCode }),
      });

      if (response.ok) {
        setSelectedTranslation(translationCode);
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
