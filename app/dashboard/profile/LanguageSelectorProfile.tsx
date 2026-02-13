'use client';

import { useState, useEffect } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import { LOCALE_NAMES, type Locale } from '@/lib/i18n-config';

interface LanguageSelectorProfileProps {
  initialLanguage?: Locale;
}

// Available languages (currently supported)
const languageOptions: Locale[] = [
  'en', // English
  'ar', // Arabic
  'ru', // Russian
];

export default function LanguageSelectorProfile({ initialLanguage = 'en' }: LanguageSelectorProfileProps) {
  const { t, locale, setLocale } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(initialLanguage || locale);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === selectedLanguage) return;

    setIsLoading(true);
    try {
      // Update locale in context (client-side)
      setLocale(newLocale);
      
      // Persist to backend
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: newLocale }),
      });

      if (response.ok) {
        setSelectedLanguage(newLocale);
        showToast(t('preferences.languageUpdated'), 'success');
      } else {
        const data = await response.json();
        showToast(data.error || t('preferences.failedToUpdateLanguage'), 'error');
        // Revert on error
        setLocale(selectedLanguage);
      }
    } catch (error) {
      console.error('Language update error:', error);
      showToast(t('preferences.failedToUpdateLanguage'), 'error');
      // Revert on error
      setLocale(selectedLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 transition-colors hover:border-gray-300 shadow-sm" data-tutorial="language-selector">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
          <Globe className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#4A3728]">{t('preferences.language')}</h3>
          <p className="text-sm text-[#8E7F71]">{t('preferences.selectInterfaceLanguage')}</p>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <ul className="space-y-1">
          {languageOptions.map((lang) => (
            <li key={lang}>
              <button
                onClick={() => handleLanguageChange(lang)}
                disabled={isLoading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-purple-50/50 text-[#4A3728] border border-purple-200'
                    : 'text-[#8E7F71] hover:bg-gray-50 border border-transparent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-sm font-medium">{LOCALE_NAMES[lang]}</span>
                {selectedLanguage === lang && (
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    ) : (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional info */}
      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
        <p className="text-xs text-[#8E7F71]">
          {t('preferences.languageNote')}
        </p>
      </div>
    </div>
  );
}

