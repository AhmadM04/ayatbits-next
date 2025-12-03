'use client';

import { useState } from 'react';
import TranslationSelector from './TranslationSelector';
import { useRouter } from 'next/navigation';

interface TranslationSelectorClientProps {
  initialSelectedTranslation: string;
}

export default function TranslationSelectorClient({
  initialSelectedTranslation,
}: TranslationSelectorClientProps) {
  const [selectedTranslation, setSelectedTranslation] = useState(initialSelectedTranslation);
  const router = useRouter();

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
        // Refresh the page to show updated translation
        router.refresh();
      } else {
        console.error('Failed to update translation');
      }
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Translation</h3>
      <TranslationSelector
        currentTranslation={selectedTranslation}
        onSelect={handleSelect}
      />
    </div>
  );
}

