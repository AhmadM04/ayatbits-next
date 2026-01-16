'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWordSegments, getWordSegment } from '@/lib/api/quran-word-audio';
import { AyahAudioSegments, WordSegment } from '@/lib/types/word-audio';

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
}

/**
 * Hook for managing word-by-word audio playback
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch segments when component mounts or verse changes
  useEffect(() => {
    if (!enabled || !surahNumber || !ayahNumber) {
      return;
    }

    let isCancelled = false;

    const loadSegments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchWordSegments(surahNumber, ayahNumber);
        
        if (isCancelled) return;
        
        if (!data) {
          setError('Failed to load word audio data');
          setSegments(null);
        } else {
          setSegments(data);
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
  }, [surahNumber, ayahNumber, enabled]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
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

  // Play a specific word
  const playWord = useCallback(async (wordIndex: number) => {
    if (!segments || !enabled) {
      return;
    }

    const wordSegment = getWordSegment(segments, wordIndex);
    
    if (!wordSegment) {
      console.error(`Invalid word index: ${wordIndex}`);
      return;
    }

    // Stop any current playback
    stopPlayback();

    try {
      // Create or reuse audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
      }

      const audio = audioRef.current;
      
      // Check if audio URL is valid
      if (!wordSegment.audioUrl) {
        console.error('No audio URL for word:', wordSegment);
        throw new Error('No audio URL available for this word');
      }
      
      console.log('Attempting to play word audio:', wordSegment.audioUrl);
      
      // Always set the audio source for individual word audio
      audio.src = wordSegment.audioUrl;
      audio.crossOrigin = 'anonymous'; // Enable CORS

      setCurrentWordIndex(wordIndex);
      setIsPlaying(true);
      setError(null);

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          audio.removeEventListener('loadeddata', onLoadedData);
          reject(new Error('Audio loading timeout'));
        }, 10000); // 10 second timeout
        
        const onCanPlay = () => {
          clearTimeout(timeoutId);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          audio.removeEventListener('loadeddata', onLoadedData);
          resolve();
        };
        
        const onLoadedData = () => {
          clearTimeout(timeoutId);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          audio.removeEventListener('loadeddata', onLoadedData);
          resolve();
        };
        
        const onError = (e: Event) => {
          clearTimeout(timeoutId);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          audio.removeEventListener('loadeddata', onLoadedData);
          
          // Get more detailed error info
          const mediaError = (e.target as HTMLAudioElement).error;
          let errorMessage = 'Failed to load audio';
          
          if (mediaError) {
            switch (mediaError.code) {
              case mediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'Audio loading aborted';
                break;
              case mediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'Network error while loading audio';
                break;
              case mediaError.MEDIA_ERR_DECODE:
                errorMessage = 'Audio decoding error';
                break;
              case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Audio format not supported or URL invalid';
                break;
            }
            console.error('Audio error details:', errorMessage, mediaError);
          }
          
          console.error('Audio load error event:', e);
          console.error('Audio URL that failed:', audio.src);
          reject(new Error(errorMessage));
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('loadeddata', onLoadedData);
        audio.addEventListener('error', onError);

        // Start loading
        audio.load();
      });

      // Add ended event listener
      const onEnded = () => {
        stopPlayback();
      };
      audio.addEventListener('ended', onEnded, { once: true });

      // Play the audio
      await audio.play();
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
  };
}

