'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, Heart, Languages, Share2, X, BookText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MushafVerse } from './AyahRow';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/Toast';

interface AyahContextMenuProps {
  verse: MushafVerse | null;
  isOpen: boolean;
  onClose: () => void;
  selectedTranslation: string;
}

export default function AyahContextMenu({
  verse,
  isOpen,
  onClose,
  selectedTranslation,
}: AyahContextMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(verse?.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [tafsirResource, setTafsirResource] = useState<string>('Tafsir Ibn Kathir');
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [isTafsirFallback, setIsTafsirFallback] = useState(false);
  const [aiTafsir, setAiTafsir] = useState<string | null>(null);
  const [isLoadingAiTafsir, setIsLoadingAiTafsir] = useState(false);
  const [showAiTafsir, setShowAiTafsir] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [requiresPro, setRequiresPro] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when verse changes
  useEffect(() => {
    setIsLiked(verse?.isLiked || false);
    setTranslation(null);
    setShowTranslation(false);
    setTafsir(null);
    setShowTafsir(false);
    setAiTafsir(null);
    setShowAiTafsir(false);
    setAiError(null);
    setRequiresPro(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [verse]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleNavigateToPuzzle = useCallback(() => {
    if (verse?.puzzleId) {
      onClose();
      router.push(`/puzzle/${verse.puzzleId}`);
    }
  }, [verse, router, onClose]);

  const handlePlayAudio = useCallback(async () => {
    if (!verse) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      
      // Construct audio URL
      const paddedSurah = verse.surahNumber.toString().padStart(3, '0');
      const paddedAyah = verse.ayahNumber.toString().padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;
      
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        audioRef.current = null;
      });
      
      audio.addEventListener('error', () => {
        setIsLoadingAudio(false);
        setIsPlaying(false);
      });

      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsLoadingAudio(false);
    }
  }, [verse, isPlaying]);

  const handleToggleLike = useCallback(async () => {
    if (!verse?.puzzleId || isLiking) return;

    try {
      setIsLiking(true);
      const response = await fetch(`/api/puzzles/${verse.puzzleId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  }, [verse, isLiked, isLiking]);

  const handleShowTranslation = useCallback(async () => {
    if (!verse) return;

    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translation) {
      setShowTranslation(true);
      return;
    }

    try {
      setIsLoadingTranslation(true);
      const response = await fetch(
        `/api/verse/translation?surah=${verse.surahNumber}&ayah=${verse.ayahNumber}&translation=${selectedTranslation}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTranslation(data.translation || 'Translation not available');
        setShowTranslation(true);
      }
    } catch (error) {
      console.error('Failed to fetch translation:', error);
      setTranslation('Failed to load translation');
      setShowTranslation(true);
    } finally {
      setIsLoadingTranslation(false);
    }
  }, [verse, translation, showTranslation, selectedTranslation]);

  const handleShowTafsir = useCallback(async () => {
    if (!verse) return;

    if (showTafsir) {
      setShowTafsir(false);
      return;
    }

    if (tafsir) {
      setShowTafsir(true);
      return;
    }

    try {
      setIsLoadingTafsir(true);
      const response = await fetch(
        `/api/verse/tafsir?surah=${verse.surahNumber}&ayah=${verse.ayahNumber}&language=${selectedTranslation}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTafsir(data.tafsir || 'Tafsir not available');
        setTafsirResource(data.resource || 'Tafsir Ibn Kathir');
        setIsTafsirFallback(data.isFallback || false);
        setShowTafsir(true);
      } else {
        // Handle error responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch tafsir:', response.status, errorData);
        setTafsir(`Failed to load tafsir: ${errorData.error || response.statusText}`);
        setShowTafsir(true);
      }
    } catch (error) {
      console.error('Failed to fetch tafsir:', error);
      setTafsir('Failed to load tafsir. Please try again later.');
      setShowTafsir(true);
    } finally {
      setIsLoadingTafsir(false);
    }
  }, [verse, tafsir, showTafsir, selectedTranslation]);

  const handleShowAiTafsir = useCallback(async () => {
    if (!verse) return;

    if (showAiTafsir) {
      setShowAiTafsir(false);
      return;
    }

    if (aiTafsir) {
      setShowAiTafsir(true);
      return;
    }

    try {
      setIsLoadingAiTafsir(true);
      setAiError(null);
      
      // Fetch translation first if not already loaded
      let translationText = translation;
      if (!translationText) {
        const transResponse = await fetch(
          `/api/verse/translation?surah=${verse.surahNumber}&ayah=${verse.ayahNumber}&translation=${selectedTranslation}`
        );
        if (transResponse.ok) {
          const transData = await transResponse.json();
          translationText = transData.translation;
        }
      }

      // Call AI Tafsir API
      const response = await fetch('/api/ai/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: verse.surahNumber,
          ayahNumber: verse.ayahNumber,
          ayahText: verse.text,
          translation: translationText,
          translationCode: selectedTranslation,
        }),
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data.requiresPro) {
          setRequiresPro(true);
          setAiError('AI Tafsir is a Pro feature. Upgrade to access.');
          showToast('🔒 AI Tafsir requires Pro subscription. Upgrade to unlock!', 'warning', 7000);
        } else {
          setAiError(data.error || 'Access denied');
          showToast(data.error || 'Access denied', 'error', 5000);
        }
        setShowAiTafsir(true); // Show the error message in the UI
        return;
      }

      if (response.status === 429) {
        const data = await response.json();
        setAiError(data.error || 'Rate limit exceeded');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setAiError(errorData.error || 'Failed to generate AI tafsir');
        return;
      }

      const data = await response.json();
      setAiTafsir(data.tafsir);
      setShowAiTafsir(true);
    } catch (error) {
      console.error('Failed to fetch AI tafsir:', error);
      setAiError('Network error. Please try again.');
    } finally {
      setIsLoadingAiTafsir(false);
    }
  }, [verse, aiTafsir, showAiTafsir, selectedTranslation, translation]);

  const handleShare = useCallback(async () => {
    if (!verse) return;

    const shareText = `${verse.text}\n\n— Quran ${verse.surahNumber}:${verse.ayahNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quran ${verse.surahNumber}:${verse.ayahNumber}`,
          text: shareText,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // Could show a toast here
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
    onClose();
  }, [verse, onClose]);

  if (!verse) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu - SEPIA THEME */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-4 right-4 bottom-6 z-50 max-w-md mx-auto"
          >
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-[#4A3728]">
                    {t('verse.surahAyahFormat', { surah: verse.surahNumber, ayah: verse.ayahNumber })}
                  </p>
                  <p className="text-xs text-[#8E7F71]">
                    {t('verse.pageJuzFormat', { page: verse.pageNumber, juz: verse.juzNumber })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#8E7F71]" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                {/* Practice Puzzle */}
                <button
                  onClick={handleNavigateToPuzzle}
                  disabled={!verse.puzzleId}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left
                    ${verse.puzzleId 
                      ? 'hover:bg-emerald-50 text-[#4A3728]' 
                      : 'opacity-50 cursor-not-allowed text-[#8E7F71]'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${verse.puzzleId ? 'bg-emerald-100 border border-[#059669]/20' : 'bg-gray-100'}`}>
                    <Play className={`w-5 h-5 ${verse.puzzleId ? 'text-[#059669]' : 'text-[#8E7F71]'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{t('mushaf.practice')}</p>
                    <p className="text-xs text-[#8E7F71]">
                      {verse.puzzleId 
                        ? (verse.isCompleted ? 'Completed - Practice again' : 'Learn this ayah')
                        : 'Puzzle not available'
                      }
                    </p>
                  </div>
                </button>

                {/* Play Audio */}
                <button
                  onClick={handlePlayAudio}
                  disabled={isLoadingAudio}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${isPlaying ? 'bg-blue-100 border border-blue-200' : 'bg-blue-50 border border-blue-100'}`}>
                    {isLoadingAudio ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Volume2 className={`w-5 h-5 text-blue-600 ${isPlaying ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#4A3728]">{t('mushaf.playAudio')}</p>
                    <p className="text-xs text-[#8E7F71]">Listen to recitation</p>
                  </div>
                </button>

                {/* Like/Unlike */}
                <button
                  onClick={handleToggleLike}
                  disabled={!verse.puzzleId || isLiking}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left
                    ${verse.puzzleId 
                      ? 'hover:bg-red-50 text-[#4A3728]' 
                      : 'opacity-50 cursor-not-allowed text-[#8E7F71]'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${isLiked ? 'bg-red-100 border border-red-200' : 'bg-red-50 border border-red-100'}`}>
                    <Heart className={`w-5 h-5 text-[#EF4444] ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <div>
                    <p className="font-medium">{t('mushaf.likeAyah')}</p>
                    <p className="text-xs text-[#8E7F71]">
                      {verse.puzzleId ? 'Save to your favorites' : 'Not available'}
                    </p>
                  </div>
                </button>

                {/* Show Translation */}
                <button
                  onClick={handleShowTranslation}
                  disabled={isLoadingTranslation}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${showTranslation ? 'bg-teal-100 border border-teal-200' : 'bg-teal-50 border border-teal-100'}`}>
                    {isLoadingTranslation ? (
                      <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Languages className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#4A3728]">
                      {t('mushaf.viewTranslation')}
                    </p>
                    <p className="text-xs text-[#8E7F71]">View meaning</p>
                  </div>
                </button>

                {/* Show Tafsir */}
                <button
                  onClick={handleShowTafsir}
                  disabled={isLoadingTafsir}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
                  data-tutorial="tafsir-button"
                >
                  <div className={`p-2 rounded-lg ${showTafsir ? 'bg-blue-100 border border-blue-200' : 'bg-blue-50 border border-blue-100'}`}>
                    {isLoadingTafsir ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BookText className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#4A3728]">
                      {t('mushaf.readTafsir')}
                    </p>
                    <p className="text-xs text-[#8E7F71]">View explanation</p>
                  </div>
                </button>

                {/* AI Tafsir */}
                <button
                  onClick={handleShowAiTafsir}
                  disabled={isLoadingAiTafsir}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-pink-50 transition-colors text-left"
                  data-tutorial="ai-tafsir-button"
                >
                  <div className={`p-2 rounded-lg ${showAiTafsir ? 'bg-pink-100 border border-pink-200' : 'bg-pink-50 border border-pink-100'}`}>
                    {isLoadingAiTafsir ? (
                      <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#4A3728]">
                        {showAiTafsir ? 'Hide AI Tafsir' : 'AI Tafsir'}
                      </p>
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded text-[10px] font-bold text-white">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-[#8E7F71]">
                      {requiresPro ? 'Upgrade to Pro' : 'AI-powered explanation'}
                    </p>
                  </div>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-50 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <Share2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#4A3728]">Share</p>
                    <p className="text-xs text-[#8E7F71]">Share this ayah</p>
                  </div>
                </button>
              </div>

              {/* Translation Display - SEPIA THEME */}
              <AnimatePresence>
                {showTranslation && translation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-teal-50">
                      <p className="text-sm text-[#4A3728] leading-relaxed">
                        {translation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tafsir Display - SEPIA THEME */}
              <AnimatePresence>
                {showTafsir && tafsir && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-blue-50 max-h-80 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <BookText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                          {tafsirResource}
                        </span>
                      </div>
                      {isTafsirFallback && (
                        <div className="mb-2 text-xs text-amber-800 bg-amber-100 border border-amber-300 rounded-lg p-2">
                          ℹ️ Showing English tafsir (native tafsir not available in your language)
                        </div>
                      )}
                      <div 
                        className="text-sm text-[#4A3728] leading-relaxed prose prose-sm max-w-none
                          prose-p:my-2 prose-strong:text-[#4A3728] prose-strong:font-semibold
                          prose-em:text-[#8E7F71]"
                        dangerouslySetInnerHTML={{ __html: tafsir }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Tafsir Display - SEPIA THEME */}
              <AnimatePresence>
                {showAiTafsir && (aiTafsir || aiError) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 max-h-80 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                        <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                          AI-Generated Tafsir
                        </span>
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded text-[9px] font-bold text-white">
                          PRO
                        </span>
                      </div>
                      
                      {aiError ? (
                        <div className="text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg p-3">
                          {aiError}
                          {requiresPro && (
                            <a 
                              href="/pricing" 
                              className="block mt-2 text-pink-600 hover:text-pink-700 font-medium"
                              onClick={onClose}
                            >
                              View Pro Plans →
                            </a>
                          )}
                        </div>
                      ) : aiTafsir && (
                        <>
                          <div className="mb-2 text-xs text-amber-800 bg-amber-100 border border-amber-300 rounded-lg p-2">
                            ⚠️ AI-generated content. Please consult traditional scholars for authoritative guidance.
                          </div>
                          <div className="text-sm text-[#4A3728] leading-relaxed whitespace-pre-wrap">
                            {aiTafsir}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

