'use client';

import { useState, useEffect } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';

interface TranslationSelectorProps {
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

const translationOptions = Object.entries(translationNames).map(([code, name]) => ({
  code,
  name,
}));

export default function TranslationSelector({ initialTranslation = 'en.sahih' }: TranslationSelectorProps) {
  const { t } = useI18n();
  const [selectedTranslation, setSelectedTranslation] = useState(initialTranslation);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setSelectedTranslation(initialTranslation);
  }, [initialTranslation]);

  const handleTranslationChange = async (translationCode: string) => {
    if (translationCode === selectedTranslation) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translation: translationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedTranslation(translationCode);
        showToast(t('tutorial.translationUpdated'), 'success');
      } else {
        showToast(data.error || t('tutorial.failedToUpdate'), 'error');
      }
    } catch (error) {
      console.error('Translation update error:', error);
      showToast(t('tutorial.failedToUpdate'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20 shadow-sm" data-tutorial="translation-selector">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white">{t('tutorial.translationPreference')}</h3>
          <p className="text-sm text-[#8E7F71] dark:text-gray-400">{t('tutorial.translationPreferenceMsg')}</p>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <ul className="space-y-1">
          {translationOptions.map((option) => (
            <li key={option.code}>
              <button
                onClick={() => handleTranslationChange(option.code)}
                disabled={isLoading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  selectedTranslation === option.code
                    ? 'bg-emerald-50/50 dark:bg-green-500/20 text-[#4A3728] dark:text-white border border-[#059669]/30 dark:border-green-500/30'
                    : 'text-[#8E7F71] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-sm font-medium">{option.name}</span>
                {selectedTranslation === option.code && (
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#059669] dark:text-green-400" />
                    ) : (
                      <Check className="w-4 h-4 text-[#059669] dark:text-green-400" />
                    )}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

