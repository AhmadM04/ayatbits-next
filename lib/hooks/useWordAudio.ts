'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWordSegments, getWordSegment } from '@/lib/api/quran-word-audio';
import { AyahAudioSegments } from '@/lib/types/word-audio';

interface UseWordAudioOptions {
  surahNumber?: number;
  ayahNumber?: number;
  enabled?: boolean;
}

interface UseWordAudioReturn {
  playWord: (wordIndex: number) => Promise<void>;
  stopPlayback: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  currentWordIndex: number | null;
  error: string | null;
  segments: AyahAudioSegments | null;
  preloadProgress: number; // 0-100 percentage of audio files preloaded
}

/**
 * Hook for managing word-by-word audio playback with preloading
 */
export function useWordAudio({
  surahNumber,
  ayahNumber,
  enabled = true,
}: UseWordAudioOptions): UseWordAudioReturn {
  const [segments, setSegments] = useState<AyahAudioSegments | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preloadProgress, setPreloadProgress] = useState(0);
  
  // Store preloaded audio elements for instant playback
  const preloadedAudioRef = useRef<Map<number, HTMLAudioElement>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload a single audio file
  const preloadSingleAudio = useCallback((segment: { position: number; audioUrl: string }): Promise<void> => {
    return new Promise((resolve) => {
      if (!segment.audioUrl) {
        resolve();
        return;
      }
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onLoaded);
        audio.removeEventListener('error', onError);
      };
      
      const onLoaded = () => {
        cleanup();
        preloadedAudioRef.current.set(segment.position, audio);
        resolve();
      };
      
      const onError = () => {
        cleanup();
        resolve(); // Don't block on errors
      };
      
      audio.addEventListener('canplaythrough', onLoaded, { once: true });
      audio.addEventListener('error', onError, { once: true });
      
      audio.src = segment.audioUrl;
      audio.load();
      
      // Timeout after 5 seconds
      setTimeout(() => {
        cleanup();
        resolve();
      }, 5000);
    });
  }, []);

  // Preload audio files for all words - prioritize first words for faster initial response
  const preloadAudioFiles = useCallback(async (segmentsData: AyahAudioSegments) => {
    const totalWords = segmentsData.segments.length;
    if (totalWords === 0) return;

    let loadedCount = 0;
    
    // Clear previous preloaded audio
    preloadedAudioRef.current.forEach(audio => {
      audio.src = '';
    });
    preloadedAudioRef.current.clear();
    setPreloadProgress(0);

    const updateProgress = () => {
      loadedCount++;
      setPreloadProgress(Math.round((loadedCount / totalWords) * 100));
    };

    // Priority 1: Preload first 3 words immediately (most likely to be needed first)
    const priorityWords = segmentsData.segments.slice(0, Math.min(3, totalWords));
    await Promise.all(
      priorityWords.map(async (segment) => {
        await preloadSingleAudio(segment);
        updateProgress();
      })
    );

    // Priority 2: Preload remaining words in batches
    const remainingWords = segmentsData.segments.slice(3);
    const BATCH_SIZE = 4; // Load 4 at a time
    
    for (let i = 0; i < remainingWords.length; i += BATCH_SIZE) {
      const batch = remainingWords.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (segment) => {
          await preloadSingleAudio(segment);
          updateProgress();
        })
      );
    }
  }, [preloadSingleAudio]);

  // Fetch segments when component mounts or verse changes
  useEffect(() => {
    if (!enabled || !surahNumber || !ayahNumber) {
      return;
    }

    let isCancelled = false;

    const loadSegments = async () => {
      setIsLoading(true);
      setError(null);
      setPreloadProgress(0);
      
      try {
        const data = await fetchWordSegments(surahNumber, ayahNumber);
        
        if (isCancelled) return;
        
        if (!data) {
          setError('Failed to load word audio data');
          setSegments(null);
        } else {
          setSegments(data);
          // Start preloading audio files in the background
          preloadAudioFiles(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError('Error loading word audio');
          console.error('Error in useWordAudio:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSegments();

    return () => {
      isCancelled = true;
    };
  }, [surahNumber, ayahNumber, enabled, preloadAudioFiles]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      // Clear preloaded audio
      preloadedAudioRef.current.forEach(audio => {
        audio.src = '';
      });
      preloadedAudioRef.current.clear();
    };
  }, []);

  // Stop current playback
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentWordIndex(null);
  }, []);

  // Play a specific word - uses preloaded audio for instant playback
  const playWord = useCallback(async (wordIndex: number) => {
    if (!segments || !enabled) {
      return;
    }

    const wordSegment = getWordSegment(segments, wordIndex);
    
    if (!wordSegment) {
      console.error(`❌ Invalid word index: ${wordIndex}`);
      return;
    }

    // Stop any current playback
    stopPlayback();

    try {
      // Check if audio URL is valid
      if (!wordSegment.audioUrl) {
        console.error('No audio URL for word:', wordSegment);
        throw new Error('No audio URL available for this word');
      }

      setCurrentWordIndex(wordIndex);
      setIsPlaying(true);
      setError(null);

      // Try to use preloaded audio first for instant playback
      const preloadedAudio = preloadedAudioRef.current.get(wordIndex);
      
      if (preloadedAudio && preloadedAudio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        // Use preloaded audio - instant playback!
        audioRef.current = preloadedAudio;
        preloadedAudio.currentTime = 0;
        
        // Add ended event listener
        const onEnded = () => {
          stopPlayback();
        };
        preloadedAudio.addEventListener('ended', onEnded, { once: true });
        
        await preloadedAudio.play();
      } else {
        // Fallback: load and play on demand (slower)
        if (!audioRef.current || audioRef.current === preloadedAudio) {
          audioRef.current = new Audio();
          audioRef.current.preload = 'auto';
        }

        const audio = audioRef.current;
        audio.src = wordSegment.audioUrl;
        audio.crossOrigin = 'anonymous';

        // Wait for audio to be ready
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Audio loading timeout'));
          }, 10000);
          
          const cleanup = () => {
            clearTimeout(timeoutId);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
          };
          
          const onCanPlay = () => {
            cleanup();
            resolve();
          };
          
          const onError = (e: Event) => {
            cleanup();
            const mediaError = (e.target as HTMLAudioElement).error;
            const errorMessage = mediaError ? `Audio error: ${mediaError.code}` : 'Failed to load audio';
            reject(new Error(errorMessage));
          };

          audio.addEventListener('canplay', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
          audio.load();
        });

        // Add ended event listener
        const onEnded = () => {
          stopPlayback();
        };
        audio.addEventListener('ended', onEnded, { once: true });

        await audio.play();
      }
    } catch (err) {
      console.error('Error playing word audio:', err);
      setError('Failed to play word audio');
      setIsPlaying(false);
      setCurrentWordIndex(null);
    }
  }, [segments, enabled, stopPlayback]);

  return {
    playWord,
    stopPlayback,
    isLoading,
    isPlaying,
    currentWordIndex,
    error,
    segments,
    preloadProgress,
  };
}

