'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { cleanTranslationText } from '@/lib/translation-utils';

interface TranslationDisplayProps {
  surahNumber: number;
  ayahNumber: number;
  selectedTranslation: string;
  initialTranslation?: string;
}

const translationNames: Record<string, string> = {
  'en.sahih': 'Sahih International',
  'en.pickthall': 'Pickthall',
  'en.yusufali': 'Yusuf Ali',
  'ar.jalalayn': 'Tafsir Al-Jalalayn',
  'ar.tafseer': 'Tafsir Al-Muyassar',
  'fr.hamidullah': 'Hamidullah (French)',
  'es.cortes': 'Cortes (Spanish)',
  'de.bubenheim': 'Bubenheim (German)',
  'tr.yazir': 'Yazır (Turkish)',
  'ur.maududi': 'Maududi (Urdu)',
  'id.muntakhab': 'Muntakhab (Indonesian)',
  'ms.basmeih': 'Basmeih (Malay)',
  'bn.hoque': 'Hoque (Bengali)',
  'hi.hindi': 'Hindi',
  'ru.kuliev': 'Kuliev (Russian)',
  'zh.chinese': 'Chinese',
  'ja.japanese': 'Japanese',
  'nl.dutch': 'Dutch',
};

export default function TranslationDisplay({
  surahNumber,
  ayahNumber,
  selectedTranslation,
  initialTranslation,
}: TranslationDisplayProps) {
  const [translation, setTranslation] = useState<string | undefined>(initialTranslation);
  const [isLoading, setIsLoading] = useState(!initialTranslation);

  useEffect(() => {
    const fetchTranslation = async () => {
      if (initialTranslation) {
        // Clean initial translation in case it has HTML tags (from cache)
        setTranslation(cleanTranslationText(initialTranslation));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/verse/translation?surah=${surahNumber}&ayah=${ayahNumber}&translation=${selectedTranslation}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.translation) {
            // Clean translation text to remove any HTML tags
            setTranslation(cleanTranslationText(data.translation));
          } else {
            setTranslation(undefined);
          }
        } else {
          setTranslation(undefined);
        }
      } catch (error) {
        setTranslation(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [surahNumber, ayahNumber, selectedTranslation, initialTranslation]);

  const translationName = translationNames[selectedTranslation] || 'Translation';

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-3.5 h-3.5 text-[#8E7F71]" />
        <span className="text-xs font-medium text-[#8E7F71] uppercase tracking-wide">
          {translationName}
        </span>
      </div>
      <p className="text-[#4A3728] text-sm leading-relaxed">
        {isLoading ? 'Loading translation...' : translation || 'Translation not available'}
      </p>
    </div>
  );
}
