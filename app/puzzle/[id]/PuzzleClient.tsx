'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import WordPuzzle from '@/components/WordPuzzle';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft, Heart, Languages, BookText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessAnimation, SparkleAnimation } from '@/components/animations';
import { TutorialWrapper } from '@/components/tutorial';
import { puzzleTutorialSteps } from '@/lib/tutorial-configs';
import TafsirDisplay from '@/components/TafsirDisplay';

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
  initialTransliteration?: string;
  initialShowTransliteration?: boolean;
  initialWordTransliterations?: Array<{ text: string; transliteration: string }>;
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
  initialTransliteration = '',
  initialShowTransliteration = false,
  initialWordTransliterations = [],
}: PuzzleClientProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(initialShowTransliteration);
  const [transliteration, setTransliteration] = useState(initialTransliteration);
  const [wordTransliterations, setWordTransliterations] = useState<Array<{ text: string; transliteration: string }>>(initialWordTransliterations);
  const [isLoadingTransliteration, setIsLoadingTransliteration] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [tafsirResource, setTafsirResource] = useState<string>('Tafsir Ibn Kathir');
  const [tafsirLanguage, setTafsirLanguage] = useState<string>('English');
  const [isTafsirFallback, setIsTafsirFallback] = useState(false);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
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

  const handleToggleTransliteration = async () => {
    const newValue = !showTransliteration;
    setShowTransliteration(newValue);

    // If enabling and we don't have word transliterations yet, fetch them
    if (newValue && wordTransliterations.length === 0 && puzzle.surah?.number && puzzle.content?.ayahNumber) {
      setIsLoadingTransliteration(true);
      try {
        const response = await fetch(
          `/api/verse/words?surah=${puzzle.surah.number}&ayah=${puzzle.content.ayahNumber}`
        );
        if (response.ok) {
          const data = await response.json();
          setWordTransliterations(data.words || []);
        }
        
        // Also fetch full transliteration for display at bottom
        const translitResponse = await fetch(
          `/api/verse/transliteration?surah=${puzzle.surah.number}&ayah=${puzzle.content.ayahNumber}`
        );
        if (translitResponse.ok) {
          const translitData = await translitResponse.json();
          setTransliteration(translitData.transliteration || '');
        }
      } catch (error) {
        showToast('Failed to load transliteration', 'error');
      } finally {
        setIsLoadingTransliteration(false);
      }
    }

    // Save preference to backend
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showTransliteration: newValue }),
      });
    } catch (error) {
      console.error('Failed to save transliteration preference:', error);
    }
  };

  const handleToggleTafsir = async () => {
    const newValue = !showTafsir;
    setShowTafsir(newValue);

    // If enabling and we don't have tafsir yet, fetch it
    if (newValue && !tafsir && puzzle.surah?.number && puzzle.content?.ayahNumber) {
      setIsLoadingTafsir(true);
      try {
        const response = await fetch(
          `/api/verse/tafsir?surah=${puzzle.surah.number}&ayah=${puzzle.content.ayahNumber}&language=en`
        );
        if (response.ok) {
          const data = await response.json();
          setTafsir(data.tafsir || '');
          setTafsirResource(data.resource || 'Tafsir Ibn Kathir');
          setTafsirLanguage(data.language || 'English');
          setIsTafsirFallback(data.isFallback || false);
        }
      } catch (error) {
        showToast('Failed to load tafsir', 'error');
      } finally {
        setIsLoadingTafsir(false);
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
    
    console.log('🚀 Will navigate to:', targetUrl);
    
    // Wait for success animation and word audio to complete before navigating
    // This allows the user to see the success animation and hear any playing word audio
    setTimeout(() => {
      console.log('✈️ Navigating now to:', targetUrl);
      router.replace(targetUrl);
    }, 1800); // 1.8 seconds delay to allow word audio to finish
  }, [puzzle, nextPuzzleId, nextPuzzleAyahNumber, isLastAyahInSurah, router, showToast]);

  const handleMistakeLimitExceeded = useCallback(() => {
    router.push(backUrl);
  }, [backUrl, router]);

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
                {isLastAyahInSurah ? '🎉 Surah completed!' : '✨ Moving to next ayah...'}
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
                className="flex items-center gap-2 p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0 group"
                title="Back to Mushaf view"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                <span className="hidden sm:inline text-sm text-gray-400 group-hover:text-gray-300">Mushaf</span>
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTransliteration}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  showTransliteration
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title={showTransliteration ? 'Hide transliteration' : 'Show transliteration'}
                data-tutorial="audio-button"
              >
                <Languages className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleTafsir}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  showTafsir
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title={showTafsir ? 'Hide tafsir' : 'Show tafsir'}
                data-tutorial="tafsir-button"
              >
                <BookText className="w-5 h-5" />
              </button>
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
                console.log('🔵 WordPuzzle onSolved callback invoked!', { isCorrect });
                handleSolved(isCorrect);
              }}
              onMistakeLimitExceeded={handleMistakeLimitExceeded}
              transliteration={showTransliteration ? transliteration : ''}
              wordTransliterations={showTransliteration ? wordTransliterations : []}
              isLoadingTransliteration={isLoadingTransliteration}
            />
          </div>

          {/* Tafsir Display */}
          <AnimatePresence>
            {showTafsir && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TafsirDisplay
                  surahNumber={puzzle.surah?.number || 1}
                  ayahNumber={puzzle.content?.ayahNumber || 1}
                  tafsir={tafsir}
                  resource={tafsirResource}
                  language={tafsirLanguage}
                  isFallback={isTafsirFallback}
                  isLoading={isLoadingTafsir}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
    </TutorialWrapper>
  );
}
