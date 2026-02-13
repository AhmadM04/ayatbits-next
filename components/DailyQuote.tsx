'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, RefreshCw, Volume2, WifiOff } from 'lucide-react';
import { apiGet, NetworkError } from '@/lib/api-client';
import { SparkleAnimation } from './animations';
import { useWordAudio } from '@/lib/hooks/useWordAudio';
import { HarakatText, HarakatModal } from '@/components/arabic';
import { type HarakatDefinition } from '@/lib/harakat-utils';
import { useI18n } from '@/lib/i18n';
import { cleanTranslationText } from '@/lib/translation-utils';

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
  enableWordByWordAudio?: boolean;
}

export default function DailyQuote({ 
  translationEdition = 'en.sahih',
  enableWordByWordAudio: enableWordByWordAudioProp,
}: DailyQuoteProps) {
  const { t } = useI18n();
  const [quote, setQuote] = useState<DailyQuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [enableWordByWordAudio, setEnableWordByWordAudio] = useState(enableWordByWordAudioProp ?? false);
  const [selectedHarakat, setSelectedHarakat] = useState<HarakatDefinition | null>(null);
  const [showHarakatModal, setShowHarakatModal] = useState(false);
  
  // Word audio hook
  const {
    playWord,
    isPlaying: isPlayingWord,
    currentWordIndex,
    segments,
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
        console.log('📖 Daily Quote data received:', {
          hasTranslation: !!data.data.translation,
          translationLength: data.data.translation?.length,
          translation: data.data.translation,
        });
        // Clean translation text to remove HTML tags and footnotes
        const cleanedData = {
          ...data.data,
          translation: cleanTranslationText(data.data.translation),
        };
        setQuote(cleanedData);
      }
      } catch (err) {
      if (err instanceof NetworkError) {
        setError(t('dailyQuote.unableToLoad'));
      } else {
        console.error('Failed to fetch daily quote:', err);
        setError(t('dailyQuote.failedToLoad'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [translationEdition]);

  useEffect(() => {
    fetchDailyQuote();
  }, [fetchDailyQuote]);

  // Fetch user settings for word audio - only if not provided as prop
  useEffect(() => {
    // Skip fetch if prop was provided
    if (enableWordByWordAudioProp !== undefined) {
      return;
    }
    
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setEnableWordByWordAudio(data.enableWordByWordAudio || false);
        }
      } catch (error) {
        // Silently fail - not critical for daily quote functionality
        console.error('Failed to fetch user settings:', error);
      }
    };
    // Delay settings fetch to not block initial render
    const timer = setTimeout(fetchSettings, 0);
    return () => clearTimeout(timer);
  }, [enableWordByWordAudioProp]);

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

  const handleHarakatClick = useCallback((definition: HarakatDefinition) => {
    setSelectedHarakat(definition);
    setShowHarakatModal(true);
  }, []);

  const handleCloseHarakatModal = useCallback(() => {
    setShowHarakatModal(false);
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-50 to-green-50 border border-[#059669]/20 shadow-sm rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#059669]" />
          <span className="text-sm font-medium text-[#059669]">{t('dailyQuote.verseOfTheDay')}</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <SparkleAnimation size={80} loop={true} />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-300 shadow-sm rounded-2xl p-6">
        <div className="flex items-center gap-3 text-orange-700">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
        <button
          onClick={fetchDailyQuote}
          className="mt-3 flex items-center gap-2 text-sm text-orange-700 hover:text-orange-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry')}
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
      className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-[#059669]/20 shadow-sm rounded-2xl p-4 sm:p-6"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full blur-2xl" />
      
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
              <Sparkles className="w-5 h-5 text-[#059669]" />
            </motion.div>
            <span className="text-sm font-medium text-[#059669]">{t('dailyQuote.verseOfTheDay')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={playAudio}
              className={`p-2 rounded-lg transition-colors ${
                isPlaying 
                  ? 'bg-[#059669] text-white' 
                  : 'bg-white text-[#8E7F71] hover:bg-gray-50 hover:text-[#4A3728]'
              }`}
              title={t('dailyQuote.playRecitation')}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <Link
              href={`/dashboard/juz/${quote.juzNumber}/surah/${quote.surahNumber}?ayah=${quote.ayahNumber}`}
              className="p-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors text-[#8E7F71] dark:text-gray-400 hover:text-[#4A3728] dark:hover:text-white"
              title={t('dailyQuote.openAyah')}
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
              className="text-lg sm:text-2xl md:text-3xl leading-loose text-[#4A3728] dark:text-white text-right break-words"
              dir="rtl"
              style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
            >
              {enableWordByWordAudio && segments && segments.segments.length > 0 ? (
                segments.segments.map((wordSegment, index) => (
                  <motion.span
                    key={index}
                    onClick={() => playWord(index)}
                    animate={
                      isPlayingWord && currentWordIndex === index
                        ? {
                            boxShadow: [
                              '0 0 0 rgba(16, 185, 129, 0)',
                              '0 0 20px rgba(16, 185, 129, 0.5)',
                              '0 0 0 rgba(16, 185, 129, 0)',
                            ],
                          }
                        : {
                            boxShadow: '0 0 0 rgba(16, 185, 129, 0)',
                          }
                    }
                    transition={
                      isPlayingWord && currentWordIndex === index
                        ? {
                            boxShadow: {
                              duration: 1,
                              repeat: Infinity,
                            },
                          }
                        : {
                            duration: 0.3,
                            boxShadow: { duration: 0.3 },
                          }
                    }
                    className={`inline-block cursor-pointer px-1 rounded transition-colors ${
                      isPlayingWord && currentWordIndex === index
                        ? 'bg-[#059669]/20 text-[#059669]'
                        : 'hover:bg-emerald-100'
                    }`}
                  >
                    <HarakatText 
                      text={wordSegment.text}
                      onHarakatClick={handleHarakatClick}
                    />
                  </motion.span>
                ))
              ) : (
                <HarakatText 
                  text={quote.arabicText}
                  onHarakatClick={handleHarakatClick}
                />
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Translation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.translation}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-3 sm:mb-4"
          >
            {quote.translation ? (
              <p className="text-[#4A3728] dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                "{quote.translation}"
              </p>
            ) : (
              <p className="text-[#8E7F71] dark:text-gray-500 text-xs sm:text-sm italic">
                {t('dailyQuote.translationNotAvailable')}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-[#4A3728] dark:text-white font-medium text-sm">
              {quote.surahNameEnglish}
            </p>
            <p className="text-[#8E7F71] dark:text-gray-400 text-xs">
              {t('common.ayah')} {quote.ayahNumber} • {t('common.juz')} {quote.juzNumber}
            </p>
          </div>
          <p className="text-[#8E7F71] dark:text-gray-500 text-xs" dir="rtl">
            {quote.surahNameArabic}
          </p>
        </div>
      </div>

      {/* Harakat Modal */}
      <HarakatModal
        definition={selectedHarakat}
        isOpen={showHarakatModal}
        onClose={handleCloseHarakatModal}
      />
    </motion.div>
  );
}

