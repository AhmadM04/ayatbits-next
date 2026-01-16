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
        throw new Error('No audio URL available for this word');
      }
      
      // Always set the audio source for individual word audio
      audio.src = wordSegment.audioUrl;

      setCurrentWordIndex(wordIndex);
      setIsPlaying(true);
      setError(null);

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (e: Event) => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          console.error('Audio load error:', e);
          reject(new Error('Failed to load audio'));
        };

        audio.addEventListener('canplay', onCanPlay);
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

