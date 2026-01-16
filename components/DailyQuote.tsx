'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, RefreshCw, Volume2, WifiOff } from 'lucide-react';
import { apiGet, NetworkError } from '@/lib/api-client';
import { SparkleAnimation } from './animations';
import { useWordAudio } from '@/lib/hooks/useWordAudio';

interface DailyQuoteData {
  arabicText: string;
  translation: string;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahNumber: number;
  juzNumber: number;
  puzzleId?: string;
  date: string;
}

interface DailyQuoteProps {
  translationEdition?: string;
}

export default function DailyQuote({ translationEdition = 'en.sahih' }: DailyQuoteProps) {
  const [quote, setQuote] = useState<DailyQuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(false);
  
  // Word audio hook
  const {
    playWord,
    isPlaying: isPlayingWord,
    currentWordIndex,
  } = useWordAudio({
    surahNumber: quote?.surahNumber,
    ayahNumber: quote?.ayahNumber,
    enabled: enableWordByWordAudio,
  });

  const fetchDailyQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ success: boolean; data: DailyQuoteData }>(
        `/api/daily-quote?translation=${translationEdition}`
      );
      if (data.success) {
        setQuote(data.data);
      }
    } catch (err) {
      if (err instanceof NetworkError) {
        setError('Unable to load verse. Check your connection.');
      } else {
        console.error('Failed to fetch daily quote:', err);
        setError('Failed to load verse.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [translationEdition]);

  useEffect(() => {
    fetchDailyQuote();
  }, [fetchDailyQuote]);

  // Fetch user settings for word audio
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setEnableWordByWordAudio(data.enableWordByWordAudio || false);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const playAudio = async () => {
    if (!quote) return;

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Format for everyayah.com: padded surah and ayah numbers
    const paddedSurah = quote.surahNumber.toString().padStart(3, '0');
    const paddedAyah = quote.ayahNumber.toString().padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;

    const newAudio = new Audio(audioUrl);
    setAudio(newAudio);

    newAudio.onplay = () => setIsPlaying(true);
    newAudio.onpause = () => setIsPlaying(false);
    newAudio.onended = () => setIsPlaying(false);
    newAudio.onerror = () => {
      setIsPlaying(false);
      console.error('Failed to play audio');
    };

    try {
      await newAudio.play();
    } catch (error) {
      console.error('Playback failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-500">Verse of the Day</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <SparkleAnimation size={80} loop={true} />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/10 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-orange-400">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
        <button
          onClick={fetchDailyQuote}
          className="mt-3 flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-green-900/30 via-emerald-900/20 to-teal-900/10 border border-green-500/20 rounded-2xl p-4 sm:p-6"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-5 h-5 text-green-400" />
            </motion.div>
            <span className="text-sm font-medium text-green-400">Verse of the Day</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={playAudio}
              className={`p-2 rounded-lg transition-colors ${
                isPlaying 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
              title="Play recitation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <Link
              href={`/dashboard/juz/${quote.juzNumber}/surah/${quote.surahNumber}?ayah=${quote.ayahNumber}`}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Open ayah"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Arabic Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.arabicText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 sm:mb-4"
          >
            <p 
              className="text-lg sm:text-2xl md:text-3xl leading-loose text-white/90 text-right break-words"
              dir="rtl"
              style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
            >
              {enableWordByWordAudio ? (
                quote.arabicText.split(/\s+/).map((word, index) => (
                  <motion.span
                    key={index}
                    onClick={() => playWord(index)}
                    animate={
                      isPlayingWord && currentWordIndex === index
                        ? {
                            boxShadow: [
                              '0 0 0 rgba(168, 85, 247, 0)',
                              '0 0 20px rgba(168, 85, 247, 0.5)',
                              '0 0 0 rgba(168, 85, 247, 0)',
                            ],
                          }
                        : {}
                    }
                    transition={{
                      boxShadow: {
                        duration: 1,
                        repeat: Infinity,
                      },
                    }}
                    className={`inline-block cursor-pointer px-1 rounded transition-colors ${
                      isPlayingWord && currentWordIndex === index
                        ? 'bg-purple-500/30 text-purple-300'
                        : 'hover:bg-purple-500/10'
                    }`}
                  >
                    {word}
                  </motion.span>
                ))
              ) : (
                quote.arabicText
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Translation */}
        <AnimatePresence mode="wait">
          <motion.p
            key={quote.translation}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4"
          >
            "{quote.translation}"
          </motion.p>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <p className="text-white font-medium text-sm">
              {quote.surahNameEnglish}
            </p>
            <p className="text-gray-500 text-xs">
              Ayah {quote.ayahNumber} • Juz {quote.juzNumber}
            </p>
          </div>
          <p className="text-gray-600 text-xs" dir="rtl">
            {quote.surahNameArabic}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

