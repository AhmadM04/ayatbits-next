'use client';

import { useState, useEffect } from 'react';
import { Volume2, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';

interface AudioSettingsProps {
  initialEnabled?: boolean;
}

export default function AudioSettings({ initialEnabled = false }: AudioSettingsProps) {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  const handleToggle = async () => {
    const newValue = !enabled;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enableWordByWordAudio: newValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnabled(newValue);
        showToast(
          newValue 
            ? t('tutorial.audioEnabled')
            : t('tutorial.audioDisabled'),
          'success'
        );
      } else {
        // Check if it's the Pro requirement error
        const errorMessage = data.error === 'WORD_BY_WORD_AUDIO_REQUIRES_PRO' 
          ? t('mushaf.wordByWordAudioRequiresPro')
          : (data.error || t('tutorial.failedToUpdateAudio'));
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Audio settings update error:', error);
      showToast(t('tutorial.failedToUpdateAudio'), 'error');
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20" data-tutorial="audio-settings">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
          <Volume2 className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{t('tutorial.wordByWordAudio')}</h3>
          <p className="text-sm text-gray-400">{t('tutorial.wordByWordAudioMsg')}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 mb-1 font-medium">{t('tutorial.enableWordAudio')}</p>
          <p className="text-xs text-gray-500">
            {t('tutorial.enableWordAudioMsg')}
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            enabled ? 'bg-blue-500' : 'bg-gray-600'
          }`}
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle word-by-word audio"
        >
          <span className="sr-only">Toggle word-by-word audio</span>
          <span
            className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            ) : enabled ? (
              <Check className="w-3 h-3 text-blue-500" />
            ) : null}
          </span>
        </button>
      </div>

      {/* Additional info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500">
          {t('tutorial.audioApiInfo')}
        </p>
      </div>
    </div>
  );
}

