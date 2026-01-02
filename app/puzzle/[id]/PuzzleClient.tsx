'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import WordPuzzle from '@/components/WordPuzzle';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PuzzleClientProps {
  puzzle: {
    id: string;
    surah: { nameEnglish: string; nameArabic: string; number?: number } | null;
    juz: { number: number } | null;
    content?: { ayahNumber?: number };
  };
  ayahText: string;
  userId: string;
  isLiked: boolean;
  previousPuzzleId?: string | null;
  nextPuzzleId?: string | null;
  nextPuzzleAyahNumber?: number | null;
  versePageUrl: string;
  isLastAyahInSurah?: boolean;
}

export default function PuzzleClient({
  puzzle,
  ayahText,
  isLiked: initialIsLiked,
  previousPuzzleId,
  nextPuzzleId,
  nextPuzzleAyahNumber,
  versePageUrl,
  isLastAyahInSurah = false,
}: PuzzleClientProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  
  const hasHandledCompletion = useRef(false);
  const backUrl = versePageUrl || '/dashboard';

  // Reset completion handler when puzzle changes
  useEffect(() => {
    hasHandledCompletion.current = false;
  }, [puzzle.id]);

  const handleToggleLike = async () => {
    try {
      if (isLiked) {
        await apiDelete(`/api/puzzles/${puzzle.id}/like`);
      } else {
        await apiPost(`/api/puzzles/${puzzle.id}/like`);
      }
      setIsLiked(!isLiked);
      showToast(isLiked ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      if (error instanceof NetworkError) {
        showToast('Network error. Please check your connection.', 'error');
      } else {
        showToast(getErrorMessage(error), 'error');
      }
    }
  };

  const handleSolved = useCallback(async (isCorrect: boolean) => {
    console.log('=== handleSolved CALLED ===', { 
      isCorrect, 
      hasHandled: hasHandledCompletion.current,
      isLastAyahInSurah,
      nextPuzzleId,
      nextPuzzleAyahNumber,
      puzzleId: puzzle.id,
      puzzleSurah: puzzle.surah?.number,
      puzzleJuz: puzzle.juz?.number,
      currentAyah: puzzle.content?.ayahNumber
    });
    
    if (!isCorrect) {
      console.log('Puzzle not correct, returning early');
      return;
    }
    
    if (hasHandledCompletion.current) {
      console.log('Already handled completion, returning early');
      return;
    }
    
    hasHandledCompletion.current = true;
    console.log('Setting hasHandledCompletion to true, proceeding with navigation logic');

    // Save progress (don't block on this)
    apiPost(`/api/puzzles/${puzzle.id}/progress`, {
      status: 'COMPLETED',
      score: 100,
    }).catch((error) => {
      if (error instanceof NetworkError) {
        showToast('Failed to save progress.', 'error');
      } else {
        console.error('Failed to save progress:', error);
      }
    });

    setShowSuccessTransition(true);
    
    // Navigate immediately - no delay
    let targetUrl = '/dashboard';
    
    if (isLastAyahInSurah) {
      // Last ayah in surah - go to completion page
      if (puzzle.surah?.number && puzzle.juz?.number) {
        targetUrl = `/dashboard/juz/${puzzle.juz.number}/surah/${puzzle.surah.number}/complete`;
      }
    } else if (nextPuzzleId) {
      // Has next puzzle - go to next ayah's full view
      const juzNum = puzzle.juz?.number;
      const surahNum = puzzle.surah?.number;
      
      // Use nextPuzzleAyahNumber if available, otherwise calculate it
      const nextAyahNum = nextPuzzleAyahNumber !== null && nextPuzzleAyahNumber !== undefined 
        ? nextPuzzleAyahNumber 
        : (puzzle.content?.ayahNumber || 0) + 1;
      
      if (juzNum && surahNum) {
        targetUrl = `/dashboard/juz/${juzNum}/surah/${surahNum}?ayah=${nextAyahNum}`;
      } else {
        // Fallback to next puzzle if we don't have juz/surah info
        targetUrl = `/puzzle/${nextPuzzleId}`;
      }
    }
    
    console.log('🚀 Navigating to:', targetUrl);
    
    // Navigate immediately using router.replace for better Next.js integration
    router.replace(targetUrl);
  }, [puzzle, nextPuzzleId, nextPuzzleAyahNumber, isLastAyahInSurah, router, showToast]);

  const handleMistakeLimitExceeded = useCallback(() => {
    router.push(backUrl);
  }, [backUrl, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Success Transition Overlay */}
      <AnimatePresence>
        {showSuccessTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                </svg>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-bold text-white mb-2"
              >
                Mashallah!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-gray-400 text-sm"
              >
                {isLastAyahInSurah ? 'Surah completed!' : 'Moving to next ayah...'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Solid background, not transparent */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={backUrl}
                className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-white truncate">
                  {puzzle.surah?.nameEnglish || `Juz ${puzzle.juz?.number}`}
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  {puzzle.content?.ayahNumber && `Ayah ${puzzle.content.ayahNumber}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleLike}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                isLiked
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content - Cleaner padding for mobile */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-6">
          <WordPuzzle
            ayahText={ayahText}
            surahNumber={puzzle.surah?.number}
            ayahNumber={puzzle.content?.ayahNumber}
            onSolved={(isCorrect) => {
              console.log('🔵 WordPuzzle onSolved callback invoked!', { isCorrect });
              handleSolved(isCorrect);
            }}
            onMistakeLimitExceeded={handleMistakeLimitExceeded}
          />
        </div>
      </main>
    </div>
  );
}
