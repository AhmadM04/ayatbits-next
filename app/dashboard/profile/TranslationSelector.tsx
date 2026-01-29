'use client';

import { useState, useEffect } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

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
  'et.estonian': 'Estonian',
};

const translationOptions = Object.entries(translationNames).map(([code, name]) => ({
  code,
  name,
}));

export default function TranslationSelector({ initialTranslation = 'en.sahih' }: TranslationSelectorProps) {
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
        showToast('Translation preference updated', 'success');
      } else {
        showToast(data.error || 'Failed to update translation', 'error');
      }
    } catch (error) {
      console.error('Translation update error:', error);
      showToast('Failed to update translation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20" data-tutorial="translation-selector">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <Globe className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Translation Preference</h3>
          <p className="text-sm text-gray-400">Choose your preferred translation language</p>
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
                    ? 'bg-green-500/10 text-white border border-green-500/30'
                    : 'text-gray-300 hover:bg-white/5 border border-transparent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-sm font-medium">{option.name}</span>
                {selectedTranslation === option.code && (
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                    ) : (
                      <Check className="w-4 h-4 text-green-400" />
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

