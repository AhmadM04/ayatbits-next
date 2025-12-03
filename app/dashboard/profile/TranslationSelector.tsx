'use client';

import { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';

interface Translation {
  code: string;
  name: string;
  nativeName: string;
}

const translations: Translation[] = [
  { code: 'en.sahih', name: 'English', nativeName: 'Sahih International' },
  { code: 'en.pickthall', name: 'English', nativeName: 'Pickthall' },
  { code: 'en.yusufali', name: 'English', nativeName: 'Yusuf Ali' },
  { code: 'ar.jalalayn', name: 'Arabic', nativeName: 'تفسير الجلالين' },
  { code: 'ar.tafseer', name: 'Arabic', nativeName: 'تفسير الميسر' },
  { code: 'fr.hamidullah', name: 'French', nativeName: 'Hamidullah' },
  { code: 'es.cortes', name: 'Spanish', nativeName: 'Cortes' },
  { code: 'de.bubenheim', name: 'German', nativeName: 'Bubenheim' },
  { code: 'tr.yazir', name: 'Turkish', nativeName: 'Yazır' },
  { code: 'ur.maududi', name: 'Urdu', nativeName: 'مولانا مودودی' },
  { code: 'id.muntakhab', name: 'Indonesian', nativeName: 'Muntakhab' },
  { code: 'ms.basmeih', name: 'Malay', nativeName: 'Basmeih' },
  { code: 'bn.hoque', name: 'Bengali', nativeName: 'Hoque' },
  { code: 'hi.hindi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ru.kuliev', name: 'Russian', nativeName: 'Кулиев' },
  { code: 'zh.chinese', name: 'Chinese', nativeName: '中文' },
  { code: 'ja.japanese', name: 'Japanese', nativeName: '日本語' },
  { code: 'nl.dutch', name: 'Dutch', nativeName: 'Nederlands' },
];

interface TranslationSelectorProps {
  currentTranslation: string;
  onSelect: (translationCode: string) => void;
}

export default function TranslationSelector({
  currentTranslation,
  onSelect,
}: TranslationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentTranslationData = translations.find(t => t.code === currentTranslation) || translations[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors w-full justify-between"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-gray-400" />
          <div className="text-left">
            <div className="text-sm font-medium text-white">
              {currentTranslationData.nativeName}
            </div>
            <div className="text-xs text-gray-500">{currentTranslationData.name}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto">
            {translations.map((translation) => (
              <button
                key={translation.code}
                onClick={() => {
                  onSelect(translation.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between border-b border-white/5 last:border-b-0 ${
                  currentTranslation === translation.code ? 'bg-green-500/10' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-white text-sm">{translation.nativeName}</div>
                  <div className="text-xs text-gray-500">{translation.name}</div>
                </div>
                {currentTranslation === translation.code && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
