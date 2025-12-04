'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18nSafe } from '@/lib/i18n';

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
  'ar.jalalayn': 'تفسير الجلالين',
  'ar.tafseer': 'تفسير الميسر',
  'fr.hamidullah': 'Hamidullah',
  'es.cortes': 'Cortes',
  'de.bubenheim': 'Bubenheim',
  'tr.yazir': 'Yazır',
  'ur.maududi': 'مولانا مودودی',
  'id.muntakhab': 'Muntakhab',
  'ms.basmeih': 'Basmeih',
  'bn.hoque': 'Hoque',
  'hi.hindi': 'हिंदी',
  'ru.kuliev': 'Кулиев',
  'zh.chinese': '中文',
  'ja.japanese': '日本語',
  'nl.dutch': 'Nederlands',
};

export default function TranslationDisplay({
  surahNumber,
  ayahNumber,
  selectedTranslation,
  initialTranslation,
}: TranslationDisplayProps) {
  const { t } = useI18nSafe();
  const [translation, setTranslation] = useState<string | undefined>(initialTranslation);
  const [isLoading, setIsLoading] = useState(!initialTranslation);

  useEffect(() => {
    const fetchTranslation = async () => {
      if (initialTranslation) {
        setTranslation(initialTranslation);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use our API route which caches server-side - much faster!
        const response = await fetch(
          `/api/verse/translation?surah=${surahNumber}&ayah=${ayahNumber}&translation=${selectedTranslation}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.translation) {
            setTranslation(data.translation);
          } else {
            setTranslation(undefined);
          }
        } else {
          setTranslation(undefined);
        }
      } catch (error) {
        console.error('Error fetching translation:', error);
        setTranslation(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [surahNumber, ayahNumber, selectedTranslation, initialTranslation]);

  const translationName = translationNames[selectedTranslation] || 'Translation';

  return (
    <div className="bg-white/[0.02] rounded-2xl p-6 mb-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {translationName}
          </span>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed">
        {isLoading ? t('common.loading') : translation || t('common.error')}
      </p>
    </div>
  );
}

