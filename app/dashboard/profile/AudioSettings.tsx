'use client';

import { useState, useEffect } from 'react';
import { Volume2, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface AudioSettingsProps {
  initialEnabled?: boolean;
}

export default function AudioSettings({ initialEnabled = false }: AudioSettingsProps) {
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
            ? 'Word-by-word audio enabled' 
            : 'Word-by-word audio disabled',
          'success'
        );
      } else {
        showToast(data.error || 'Failed to update audio settings', 'error');
      }
    } catch (error) {
      console.error('Audio settings update error:', error);
      showToast('Failed to update audio settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <Volume2 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Word-by-Word Audio</h3>
          <p className="text-sm text-gray-400">Click on any word to hear its pronunciation</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 mb-1 font-medium">Enable word audio playback</p>
          <p className="text-xs text-gray-500">
            When enabled, you can click individual words to hear their recitation
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#111] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            enabled ? 'bg-purple-500' : 'bg-gray-600'
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
              <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
            ) : enabled ? (
              <Check className="w-3 h-3 text-purple-500" />
            ) : null}
          </span>
        </button>
      </div>

      {/* Additional info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500">
          This feature uses the Quran.com API to provide word-level audio recitation by Sheikh Alafasy.
        </p>
      </div>
    </div>
  );
}

