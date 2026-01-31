'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { getAudioUrl as getQuranAudioUrl } from '@/lib/quran-api-adapter';
import { useI18n } from '@/lib/i18n';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({ surahNumber, ayahNumber, onPlayingChange }: AudioPlayerProps) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioUrl = async () => {
    // Use adapter function for consistent audio URL generation
    return getQuranAudioUrl(surahNumber, ayahNumber, 'alafasy');
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [surahNumber, ayahNumber]);

  useEffect(() => {
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
        
        const actualAudioUrl = await getAudioUrl();
        
        if (!actualAudioUrl) {
          throw new Error('No audio URL available');
        }
        
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
          onPlayingChange?.(false);
        });
        
        audio.addEventListener('play', () => {
          setIsPlaying(true);
          onPlayingChange?.(true);
        });
        
        audio.addEventListener('pause', () => {
          setIsPlaying(false);
          onPlayingChange?.(false);
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
      const currentTime = audioRef.current.currentTime;
      audioRef.current.playbackRate = speed;
      audioRef.current.currentTime = currentTime;
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        {/* Play button */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full transition-all
            ${isPlaying 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
              : 'bg-white/10 text-white hover:bg-white/20'
            }
            ${isLoading ? 'opacity-50' : ''}
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Label */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">
              {isLoading ? t('common.loading') : isPlaying ? t('common.playing') : t('common.listen')}
            </span>
          </div>
        </div>

        {/* Speed controls */}
        <div className="flex items-center gap-1">
          {[0.5, 1].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${playbackRate === speed
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                }
              `}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
      
      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
