'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError, ApiError } from '@/lib/api-client';
import { ArrowLeft, Heart, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessAnimation, SparkleAnimation } from '@/components/animations';
import { TutorialWrapper, useTutorial } from '@/components/tutorial';
import { puzzleTutorialSteps } from '@/lib/tutorial-configs';
import { resetTutorial } from '@/lib/tutorial-manager';
import { useI18n } from '@/lib/i18n';
import { usePreventBack } from '@/lib/hooks/usePreventBack';

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

// OPTIMIZED: Lazy load LimitReachedModal - only loads when user hits daily limit
const LimitReachedModal = dynamic(() => import('@/components/LimitReachedModal'), {
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
  // PERFORMANCE FIX: Flags for client-side fetching (no server blocking)
  shouldFetchTransliteration?: boolean;
  shouldFetchAiTafsir?: boolean;
  selectedTranslation?: string;
  surahNumber?: number;
  ayahNumber?: number;
  // OPTIMIZATION: Initial progress data (fetched in parallel on server)
  initialProgress?: {
    _id: string;
    userId: string;
    puzzleId: string;
    status: string;
    score: number;
    completedAt?: string;
  } | null;
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
  shouldFetchTransliteration = false,
  shouldFetchAiTafsir = false,
  selectedTranslation = 'en.sahih',
  surahNumber,
  ayahNumber,
  initialProgress,
}: PuzzleClientProps) {
  const { t } = useI18n();
  const { startTutorial } = useTutorial();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false); // NEW: Limit reached modal
  const { showToast } = useToast();
  const router = useRouter();
  
  // PERFORMANCE FIX: Client-side data fetching (non-blocking)
  const [transliteration, setTransliteration] = useState('');
  const [wordTransliterations, setWordTransliterations] = useState<Array<{ text: string; transliteration: string }>>([]);
  const [isLoadingTransliteration, setIsLoadingTransliteration] = useState(false);
  
  const hasHandledCompletion = useRef(false);
  const backUrl = versePageUrl || '/dashboard';
  
  // PWA FIX: Prevent accidental back navigation (swipe-to-back on mobile)
  // The hook will re-arm the trap every time user tries to go back
  usePreventBack(true, () => setShowExitModal(true));

  // Reset completion handler when puzzle changes
  useEffect(() => {
    hasHandledCompletion.current = false;
  }, [puzzle.id]);

  // PERFORMANCE FIX: Fetch transliteration in background (non-blocking)
  // Page loads instantly, transliteration streams in after
  useEffect(() => {
    if (!shouldFetchTransliteration || !surahNumber || !ayahNumber) {
      return;
    }

    let isCancelled = false;
    setIsLoadingTransliteration(true);

    const fetchData = async () => {
      try {
        // PERFORMANCE FIX: Parallel API calls - fetch both transliterations simultaneously
        const [translitResult, wordsResult] = await Promise.all([
          // Fetch full-ayah transliteration (internal API)
          fetch(`/api/transliteration?surah=${surahNumber}&ayah=${ayahNumber}`)
            .then(res => res.ok ? res.json() : null)
            .catch(error => {
              console.error('Failed to fetch transliteration:', error);
              return null;
            }),
          
          // Fetch word-by-word transliteration from Quran.com (external API with fail-safe)
          fetch(
            `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?words=true&word_fields=transliteration,text_uthmani`
          )
            .then(res => res.ok ? res.json() : null)
            .catch(error => {
              // FAIL-SAFE: If Quran.com API fails, don't break the page - just log and return null
              console.error('Failed to fetch word transliterations from Quran.com:', error);
              return null;
            }),
        ]);
        
        if (!isCancelled) {
          // Set full-ayah transliteration if available
          if (translitResult) {
            setTransliteration(translitResult.text || '');
          }
          
          // Set word-by-word transliterations if available
          if (wordsResult) {
            const words = wordsResult.verse?.words || [];
            setWordTransliterations(words.map((word: any) => ({
              text: word.text_uthmani || '',
              transliteration: word.transliteration?.text || '',
            })));
          }
        }
      } catch (error) {
        // This should rarely trigger since we handle errors in individual promises
        console.error('Unexpected error fetching transliteration data:', error);
      } finally {
        if (!isCancelled) {
          setIsLoadingTransliteration(false);
        }
      }
    };

    // Delay fetch by 500ms to let puzzle render first
    const timer = setTimeout(fetchData, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [shouldFetchTransliteration, surahNumber, ayahNumber]);

  const handleRestartTutorial = () => {
    resetTutorial('puzzle_guide');
    startTutorial('puzzle_guide', puzzleTutorialSteps);
    setShowHelpMenu(false);
  };

  const handleToggleLike = async () => {
    // ============================================================================
    // PERFORMANCE FIX: Optimistic UI Update (Instant Feedback)
    // ============================================================================
    // 1. Update UI immediately (don't wait for API)
    // 2. Fire API request in background
    // 3. Revert on error (rollback)
    // ============================================================================
    
    const previousState = isLiked;
    
    // 1. OPTIMISTIC UPDATE: Instant visual feedback
    setIsLiked(!previousState);
    
    // 2. HAPTIC FEEDBACK: Provide tactile response (mobile devices)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      // 3. BACKGROUND API CALL: Fire and forget (with keepalive)
      // Use POST for toggle (optimized endpoint handles both like/unlike)
      await apiPost(`/api/puzzles/${puzzle.id}/like`, undefined, { keepalive: true });
      
      // Success! Show confirmation toast
      showToast(
        !previousState ? t('puzzle.addedToFavorites') : t('puzzle.removedFromFavorites'), 
        'success'
      );
    } catch (error) {
      // 4. ROLLBACK: Revert to previous state on error
      setIsLiked(previousState);
      
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
    
    // Mark as handled to prevent double-completion
    if (hasHandledCompletion.current) {
      return;
    }
    
    hasHandledCompletion.current = true;

    // ============================================================================
    // CRITICAL FIX: Handle 403 Forbidden (Daily Limit Reached)
    // ============================================================================
    // Check for 403 status BEFORE showing success animation
    // This prevents optimistic UI updates when user has hit their limit
    // ============================================================================
    try {
      await apiPost(`/api/puzzles/${puzzle.id}/progress`, {
        status: 'COMPLETED',
        score: 100,
      }, {
        keepalive: false, // CHANGED: Don't use keepalive so we can catch errors properly
      });
    } catch (error) {
      // CRITICAL: Check if it's a 403 Forbidden error (daily limit reached)
      if (error instanceof ApiError && error.status === 403) {
        console.log('[PuzzleClient] 403 Forbidden - Daily limit reached');
        
        // 1. Show the "Limit Reached" modal
        setShowLimitModal(true);
        
        // 2. Reset completion handler so user can't try again
        hasHandledCompletion.current = false;
        
        // 3. Stop execution - don't show success animation
        return;
      }
      
      // Handle other errors
      if (error instanceof NetworkError) {
        showToast(t('puzzle.failedToSaveProgress'), 'error');
        hasHandledCompletion.current = false; // Allow retry on network error
        return;
      }
      
      // Log unexpected errors
      console.error('Failed to save progress:', error);
      hasHandledCompletion.current = false; // Allow retry
      return;
    }

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
      // CRITICAL: Use hard navigation to escape the history trap
      // window.location.href forces a full page reload and ensures navigation works
      window.location.href = targetUrl;
    }, 1800); // 1.8 seconds delay to allow word audio to finish
  }, [puzzle, nextPuzzleId, nextPuzzleAyahNumber, isLastAyahInSurah, router, showToast, t]);

  const handleMistakeLimitExceeded = useCallback(() => {
    // CRITICAL: Use hard navigation to escape the history trap
    // window.location.href forces a full page reload and clears the trap
    window.location.href = backUrl;
  }, [backUrl]);

  const handleExitConfirm = () => {
    // CRITICAL: Use hard navigation to escape the history trap
    // window.location.href forces a full page reload and bypasses Next.js router
    // This ensures we actually leave the page instead of just fetching data
    window.location.href = backUrl;
  };

  return (
    // ISOLATION TEST: TutorialWrapper commented out to test if it causes the freeze
    // <TutorialWrapper
    //   sectionId="puzzle_guide"
    //   steps={puzzleTutorialSteps}
    //   delay={1000}
    // >
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#4A3728] dark:text-white flex flex-col">
      {/* Success Transition Overlay */}
      <AnimatePresence>
        {showSuccessTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F8F9FA]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-center"
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
              
              {/* Main success animation with checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="mb-4 relative"
              >
                <SuccessAnimation size={160} loop={false} />
                
                {/* Large Checkmark Overlay */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg 
                    width="80" 
                    height="80" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="text-white drop-shadow-lg"
                  >
                    <motion.path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-[#4A3728] dark:text-white mb-2"
              >
                Mashallah!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-emerald-600 dark:text-green-400 text-base"
              >
                {isLastAyahInSurah ? `🎉 ${t('puzzle.surahCompleted')}` : `✨ ${t('puzzle.movingToNext')}`}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Solid background, not transparent */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-2 p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors flex-shrink-0 group"
                title={t('puzzle.backToMushaf')}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#4A3728] dark:group-hover:text-white" />
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#4A3728] dark:group-hover:text-white"></span>
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-[#4A3728] dark:text-gray-100 truncate">
                  {puzzle.surah?.nameEnglish || `Juz ${puzzle.juz?.number}`}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
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
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400' : ''}`} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowHelpMenu(!showHelpMenu)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
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
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <button
                        onClick={handleRestartTutorial}
                        className="w-full px-4 py-3 text-left text-sm text-[#4A3728] dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
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
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-none" data-tutorial="puzzle-container">
            <WordPuzzle
              ayahText={ayahText}
              surahNumber={puzzle.surah?.number}
              ayahNumber={puzzle.content?.ayahNumber}
              onSolved={(isCorrect) => {
                handleSolved(isCorrect);
              }}
              onMistakeLimitExceeded={handleMistakeLimitExceeded}
              enableWordByWordAudio={enableWordByWordAudio}
              transliteration={transliteration}
              wordTransliterations={wordTransliterations}
              isLoadingTransliteration={isLoadingTransliteration}
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

      {/* Limit Reached Modal - Free Tier Daily Limit */}
      {showLimitModal && (
        <LimitReachedModal
          onClose={() => setShowLimitModal(false)}
          onUpgrade={() => {
            window.location.href = '/pricing';
          }}
        />
      )}
    </div>
    // </TutorialWrapper>
  );
}
