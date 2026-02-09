'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft, Heart, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessAnimation, SparkleAnimation } from '@/components/animations';
import { TutorialWrapper, useTutorial } from '@/components/tutorial';
import { puzzleTutorialSteps } from '@/lib/tutorial-configs';
import { resetTutorial } from '@/lib/tutorial-manager';
import { useI18n } from '@/lib/i18n';

// OPTIMIZED: Dynamically import heavy components
const WordPuzzle = dynamic(() => import('@/components/WordPuzzle'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  ),
  ssr: false,
});

// OPTIMIZED: Lazy load ConfirmExitModal - only loads when user attempts to exit
const ConfirmExitModal = dynamic(() => import('@/components/ConfirmExitModal'), {
  ssr: false,
});

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
  enableWordByWordAudio?: boolean;
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
  enableWordByWordAudio = false,
}: PuzzleClientProps) {
  const { t } = useI18n();
  const { startTutorial } = useTutorial();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  
  const hasHandledCompletion = useRef(false);
  const backUrl = versePageUrl || '/dashboard';

  // Reset completion handler when puzzle changes
  useEffect(() => {
    hasHandledCompletion.current = false;
  }, [puzzle.id]);

  // Handle browser back button / swipe gestures
  useEffect(() => {
    // Add a dummy history entry so we can intercept the back navigation
    window.history.pushState({ puzzleInterceptor: true }, '');
    
    const handlePopState = (event: PopStateEvent) => {
      // Check if this is our interceptor state
      if (event.state?.puzzleInterceptor) {
        // Prevent the default back navigation
        event.preventDefault();
        // Push the state back so we stay on the same page
        window.history.pushState({ puzzleInterceptor: true }, '');
        // Show the exit confirmation modal
        setShowExitModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up the interceptor state when component unmounts
      if (window.history.state?.puzzleInterceptor) {
        window.history.back();
      }
    };
  }, []);


  const handleRestartTutorial = () => {
    resetTutorial('puzzle_guide');
    startTutorial('puzzle_guide', puzzleTutorialSteps);
    setShowHelpMenu(false);
  };

  const handleToggleLike = async () => {
    try {
      if (isLiked) {
        await apiDelete(`/api/puzzles/${puzzle.id}/like`);
      } else {
        await apiPost(`/api/puzzles/${puzzle.id}/like`);
      }
      setIsLiked(!isLiked);
      showToast(isLiked ? t('puzzle.removedFromFavorites') : t('puzzle.addedToFavorites'), 'success');
    } catch (error) {
      if (error instanceof NetworkError) {
        showToast(t('puzzle.networkError'), 'error');
      } else {
        showToast(getErrorMessage(error), 'error');
      }
    }
  };


  const handleSolved = useCallback(async (isCorrect: boolean) => {
    if (!isCorrect) {
      return;
    }
    
    if (hasHandledCompletion.current) {
      return;
    }
    
    hasHandledCompletion.current = true;

    // Save progress (don't block on this)
    apiPost(`/api/puzzles/${puzzle.id}/progress`, {
      status: 'COMPLETED',
      score: 100,
    }).catch((error) => {
      if (error instanceof NetworkError) {
        showToast(t('puzzle.failedToSaveProgress'), 'error');
      } else {
        console.error('Failed to save progress:', error);
      }
    });

    setShowSuccessTransition(true);
    
    // Determine target URL
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
    
    // Wait for success animation and word audio to complete before navigating
    // This allows the user to see the success animation and hear any playing word audio
    setTimeout(() => {
      router.replace(targetUrl);
    }, 1800); // 1.8 seconds delay to allow word audio to finish
  }, [puzzle, nextPuzzleId, nextPuzzleAyahNumber, isLastAyahInSurah, router, showToast]);

  const handleMistakeLimitExceeded = useCallback(() => {
    router.push(backUrl);
  }, [backUrl, router]);

  const handleExitConfirm = () => {
    setShowExitModal(false);
    router.push(backUrl);
  };

  return (
    <TutorialWrapper
      sectionId="puzzle_guide"
      steps={puzzleTutorialSteps}
      delay={1000}
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Success Transition Overlay */}
      <AnimatePresence>
        {showSuccessTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center px-4 relative"
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
              </div>
              
              {/* Floating sparkles around the success animation */}
              <motion.div
                className="absolute -top-4 -left-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SparkleAnimation size={50} loop={true} />
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <SparkleAnimation size={50} loop={true} />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <SparkleAnimation size={50} loop={true} />
              </motion.div>
              
              {/* Main success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="mb-4"
              >
                <SuccessAnimation size={160} loop={false} />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Mashallah!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-green-400 text-base"
              >
                {isLastAyahInSurah ? `🎉 ${t('puzzle.surahCompleted')}` : `✨ ${t('puzzle.movingToNext')}`}
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
              <button
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-2 p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0 group"
                title={t('puzzle.backToMushaf')}
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                <span className="hidden sm:inline text-sm text-gray-400 group-hover:text-gray-300"></span>
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-white truncate">
                  {puzzle.surah?.nameEnglish || `Juz ${puzzle.juz?.number}`}
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  {puzzle.content?.ayahNumber && `Ayah ${puzzle.content.ayahNumber}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <div className="relative">
                <button
                  onClick={() => setShowHelpMenu(!showHelpMenu)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors flex-shrink-0"
                  title={t('common.menu')}
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {showHelpMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <button
                        onClick={handleRestartTutorial}
                        className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        🎓 {t('tutorial.restartTutorial')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Cleaner padding for mobile */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-8">
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-6" data-tutorial="puzzle-container">
            <WordPuzzle
              ayahText={ayahText}
              surahNumber={puzzle.surah?.number}
              ayahNumber={puzzle.content?.ayahNumber}
              onSolved={(isCorrect) => {
                handleSolved(isCorrect);
              }}
              onMistakeLimitExceeded={handleMistakeLimitExceeded}
              enableWordByWordAudio={enableWordByWordAudio}
            />
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      <ConfirmExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
      />
    </div>
    </TutorialWrapper>
  );
}
