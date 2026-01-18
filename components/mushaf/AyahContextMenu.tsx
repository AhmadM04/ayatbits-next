'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, Heart, Languages, Share2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MushafVerse } from './AyahRow';

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
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(verse?.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when verse changes
  useEffect(() => {
    setIsLiked(verse?.isLiked || false);
    setTranslation(null);
    setShowTranslation(false);
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
      const response = await fetch('/api/user/liked', {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId: verse.puzzleId }),
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

          {/* Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-4 right-4 bottom-6 z-50 max-w-md mx-auto"
          >
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Surah {verse.surahNumber}, Ayah {verse.ayahNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    Page {verse.pageNumber} • Juz {verse.juzNumber}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
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
                      ? 'hover:bg-green-500/10 text-white' 
                      : 'opacity-50 cursor-not-allowed text-gray-500'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${verse.puzzleId ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                    <Play className={`w-5 h-5 ${verse.puzzleId ? 'text-green-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Practice Puzzle</p>
                    <p className="text-xs text-gray-500">
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-500/10 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${isPlaying ? 'bg-blue-500/30' : 'bg-blue-500/20'}`}>
                    {isLoadingAudio ? (
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Volume2 className={`w-5 h-5 text-blue-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{isPlaying ? 'Stop Audio' : 'Play Audio'}</p>
                    <p className="text-xs text-gray-500">Listen to recitation</p>
                  </div>
                </button>

                {/* Like/Unlike */}
                <button
                  onClick={handleToggleLike}
                  disabled={!verse.puzzleId || isLiking}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left
                    ${verse.puzzleId 
                      ? 'hover:bg-red-500/10 text-white' 
                      : 'opacity-50 cursor-not-allowed text-gray-500'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${isLiked ? 'bg-red-500/30' : 'bg-red-500/20'}`}>
                    <Heart className={`w-5 h-5 text-red-400 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <div>
                    <p className="font-medium">{isLiked ? 'Unlike' : 'Like'}</p>
                    <p className="text-xs text-gray-500">
                      {verse.puzzleId ? 'Save to your favorites' : 'Not available'}
                    </p>
                  </div>
                </button>

                {/* Show Translation */}
                <button
                  onClick={handleShowTranslation}
                  disabled={isLoadingTranslation}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-500/10 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${showTranslation ? 'bg-teal-500/30' : 'bg-teal-500/20'}`}>
                    {isLoadingTranslation ? (
                      <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Languages className="w-5 h-5 text-teal-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {showTranslation ? 'Hide Translation' : 'Show Translation'}
                    </p>
                    <p className="text-xs text-gray-500">View meaning</p>
                  </div>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/10 transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Share2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Share</p>
                    <p className="text-xs text-gray-500">Share this ayah</p>
                  </div>
                </button>
              </div>

              {/* Translation Display */}
              <AnimatePresence>
                {showTranslation && translation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <div className="p-4 bg-teal-500/5">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {translation}
                      </p>
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

