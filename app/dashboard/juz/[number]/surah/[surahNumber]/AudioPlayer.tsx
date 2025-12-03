'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
}

export default function AudioPlayer({ surahNumber, ayahNumber }: AudioPlayerProps) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.75);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get audio URL from Al-Quran Cloud API
  // Format: https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/{reciter}
  // The API returns: { data: { audio: "https://..." } }
  const getAudioUrl = async () => {
    try {
      // Try Al-Quran Cloud API
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/alafasy`);
      if (response.ok) {
        const data = await response.json();
        if (data.data?.audio) {
          return data.data.audio;
        }
      }
    } catch (error) {
      console.error('API fetch failed:', error);
    }
    
    // Fallback: Use EveryAyah CDN (more reliable)
    // Format: https://everyayah.com/data/Alafasy_128kbps/{surah}{ayah}.mp3
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;
  };

  useEffect(() => {
    // Reset audio when surah or ayah changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [surahNumber, ayahNumber]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (!audioRef.current) {
        setIsLoading(true);
        setError(null);
        
        // Get audio URL
        const actualAudioUrl = await getAudioUrl();
        
        if (!actualAudioUrl) {
          throw new Error('No audio URL available');
        }
        
        // Create audio element
        const audio = new Audio(actualAudioUrl);
        audio.playbackRate = playbackRate;
        
        audio.addEventListener('loadeddata', () => {
          setIsLoading(false);
        });
        
        audio.addEventListener('error', (e) => {
          setIsLoading(false);
          setError('Failed to load audio');
          console.error('Audio error:', e);
        });
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        
        audio.addEventListener('play', () => {
          setIsPlaying(true);
        });
        
        audio.addEventListener('pause', () => {
          setIsPlaying(false);
        });
        
        audioRef.current = audio;
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (err) {
      setIsLoading(false);
      setError('Failed to play audio');
      console.error('Audio error:', err);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      // Save current time before changing speed
      const currentTime = audioRef.current.currentTime;
      audioRef.current.playbackRate = speed;
      // Restore position after speed change
      audioRef.current.currentTime = currentTime;
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        <span>{isLoading ? t('common.loading') : isPlaying ? t('common.pause') : t('common.play')}</span>
      </button>
      
      <div className="flex items-center gap-2">
        {[0.75, 1].map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeedChange(speed)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              playbackRate === speed
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

