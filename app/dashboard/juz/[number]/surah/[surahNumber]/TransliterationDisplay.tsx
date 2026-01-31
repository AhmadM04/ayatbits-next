'use client';

import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface TransliterationDisplayProps {
  surahNumber: number;
  ayahNumber: number;
  initialTransliteration?: string;
  initialShowTransliteration?: boolean;
  onToggle?: (show: boolean) => void;
}

export default function TransliterationDisplay({
  surahNumber,
  ayahNumber,
  initialTransliteration,
  initialShowTransliteration = false,
  onToggle,
}: TransliterationDisplayProps) {
  const { t } = useI18n();
  const [transliteration, setTransliteration] = useState<string | undefined>(initialTransliteration);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(initialShowTransliteration);

  useEffect(() => {
    const fetchTransliteration = async () => {
      // Only fetch if showing and we don't have the data yet
      if (showTransliteration && !transliteration) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/verse/transliteration?surah=${surahNumber}&ayah=${ayahNumber}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.transliteration) {
              setTransliteration(data.transliteration);
            }
          }
        } catch (error) {
          // Transliteration fetch failed
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTransliteration();
  }, [surahNumber, ayahNumber, showTransliteration, transliteration]);

  const handleToggle = async () => {
    const newValue = !showTransliteration;
    setShowTransliteration(newValue);
    
    // Save preference
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showTransliteration: newValue }),
      });
    } catch (error) {
      console.error('Failed to save transliteration preference:', error);
    }

    // Notify parent
    if (onToggle) {
      onToggle(newValue);
    }
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`mb-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
          showTransliteration
            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
        }`}
      >
        <Languages className="w-4 h-4" />
        {showTransliteration ? t('transliteration.hide') : t('transliteration.show')}
      </button>

      {/* Transliteration Content */}
      {showTransliteration && (
        <div className="bg-teal-500/5 rounded-xl p-4 border border-teal-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">
              {t('transliteration.label')}
            </span>
          </div>
          <p className="text-gray-300 text-base leading-relaxed italic">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                {t('transliteration.loading')}
              </span>
            ) : (
              transliteration || t('transliteration.notAvailable')
            )}
          </p>
        </div>
      )}
    </div>
  );
}

