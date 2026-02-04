'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import WordPuzzle from '@/components/WordPuzzle';
import { useToast } from '@/components/Toast';
import { apiPost, apiDelete, getErrorMessage, NetworkError } from '@/lib/api-client';
import { ArrowLeft, Heart, Languages, BookText, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessAnimation, SparkleAnimation } from '@/components/animations';
import { TutorialWrapper, useTutorial } from '@/components/tutorial';
import { puzzleTutorialSteps } from '@/lib/tutorial-configs';
import { resetTutorial } from '@/lib/tutorial-manager';
import TafsirDisplay from '@/components/TafsirDisplay';
import { useI18n } from '@/lib/i18n';

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
  initialAiTafsir?: string;
  initialAiTafsirSource?: string;
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
  initialAiTafsir = '',
  initialAiTafsirSource = '',
}: PuzzleClientProps) {
  const { t } = useI18n();
  const { startTutorial } = useTutorial();
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
  const [tafsirType, setTafsirType] = useState<string>('ibn_kathir');
  const [availableTafsirs, setAvailableTafsirs] = useState<Array<{ type: string; name: string }>>([]);
  const [isTafsirFallback, setIsTafsirFallback] = useState(false);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [userTranslation, setUserTranslation] = useState<string>('en.sahih');
  const [showAiTafsir, setShowAiTafsir] = useState(false);
  const [aiTafsir, setAiTafsir] = useState<string | null>(initialAiTafsir || null);
  const [aiTafsirSource, setAiTafsirSource] = useState<string>(initialAiTafsirSource);
  const [isLoadingAiTafsir, setIsLoadingAiTafsir] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [requiresPro, setRequiresPro] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  
  const hasHandledCompletion = useRef(false);
  const backUrl = versePageUrl || '/dashboard';

  // Reset completion handler when puzzle changes
  useEffect(() => {
    hasHandledCompletion.current = false;
  }, [puzzle.id]);

  // Fetch user's selected translation and available tafsirs
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setUserTranslation(data.translation || 'en.sahih');
          
          // Fetch available tafsirs for this translation
          const tafsirOptionsResponse = await fetch(
            `/api/verse/tafsir?get_options=true&translation=${data.translation || 'en.sahih'}`
          );
          if (tafsirOptionsResponse.ok) {
            const tafsirOptionsData = await tafsirOptionsResponse.json();
            setAvailableTafsirs(tafsirOptionsData.options || []);
            // Set default tafsir type if available
            if (tafsirOptionsData.options?.length > 0) {
              setTafsirType(tafsirOptionsData.options[0].type);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      }
    };

    fetchUserSettings();
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
        showToast(t('puzzle.failedToLoadTransliteration'), 'error');
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
      await fetchTafsirContent(tafsirType);
    }
  };

  const fetchTafsirContent = async (type: string) => {
    if (!puzzle.surah?.number || !puzzle.content?.ayahNumber) return;

    setIsLoadingTafsir(true);
    try {
      const response = await fetch(
        `/api/verse/tafsir?surah=${puzzle.surah.number}&ayah=${puzzle.content.ayahNumber}&translation=${userTranslation}&tafsir_type=${type}`
      );
      if (response.ok) {
        const data = await response.json();
        setTafsir(data.tafsir || '');
        setTafsirResource(data.resource || 'Tafsir Ibn Kathir');
        setTafsirLanguage(data.language || 'English');
        setIsTafsirFallback(data.isFallback || false);
        setTafsirType(type);
      } else {
        // Handle error responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch tafsir:', response.status, errorData);
        showToast(`${t('puzzle.failedToLoadTafsir')}: ${errorData.error || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Tafsir fetch error:', error);
      showToast(t('puzzle.failedToLoadTafsir'), 'error');
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  const handleTafsirTypeChange = async (type: string) => {
    await fetchTafsirContent(type);
  };

  const handleToggleAiTafsir = async () => {
    const newValue = !showAiTafsir;
    setShowAiTafsir(newValue);

    // If enabling and we already have pre-generated AI tafsir, just show it
    if (newValue && aiTafsir) {
      return; // Already loaded, just toggle visibility
    }

    // If enabling and we don't have AI tafsir yet, fetch it
    if (newValue && !aiTafsir && puzzle.surah?.number && puzzle.content?.ayahNumber) {
      setIsLoadingAiTafsir(true);
      setAiError(null);
      try {
        // Fetch translation text for the verse in user's language
        let translationText = '';
        try {
          const translationResponse = await fetch(
            `/api/verse/translation?surah=${puzzle.surah.number}&ayah=${puzzle.content.ayahNumber}&translation=${userTranslation}`
          );
          if (translationResponse.ok) {
            const translationData = await translationResponse.json();
            translationText = translationData.translation || '';
          }
        } catch (error) {
          console.error('Failed to fetch translation for AI tafsir:', error);
        }

        const response = await fetch('/api/ai/tafsir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surahNumber: puzzle.surah.number,
            ayahNumber: puzzle.content.ayahNumber,
            ayahText: ayahText,
            translation: translationText,
            translationCode: userTranslation,
            targetLanguage: userTranslation, // Pass user's selected translation language
          }),
        });

        if (response.status === 403) {
          const data = await response.json();
          if (data.requiresPro) {
            setRequiresPro(true);
            setAiError(t('puzzle.aiTafsirPro'));
            showToast(t('puzzle.aiTafsirPro'), 'error');
          } else {
            setAiError(data.error || 'Access denied');
            showToast(data.error || 'Access denied', 'error');
          }
          return;
        }

        if (response.status === 429) {
          const data = await response.json();
          setAiError(data.error || 'Rate limit exceeded');
          showToast(data.error || 'Rate limit exceeded', 'error');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          setAiError(errorData.error || t('puzzle.failedToLoadTafsir'));
          showToast(errorData.error || t('puzzle.failedToLoadTafsir'), 'error');
          return;
        }

        const data = await response.json();
        setAiTafsir(data.tafsir);
        setAiTafsirSource(data.source || '');
        showToast(t('puzzle.aiTafsirGenerated'), 'success');
      } catch (error) {
        setAiError(t('puzzle.networkError'));
        showToast(t('puzzle.failedToLoadTafsir'), 'error');
      } finally {
        setIsLoadingAiTafsir(false);
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
              <Link
                href={backUrl}
                className="flex items-center gap-2 p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0 group"
                title={t('puzzle.backToMushaf')}
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                <span className="hidden sm:inline text-sm text-gray-400 group-hover:text-gray-300"></span>
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
                title={showTransliteration ? t('puzzle.hideTransliteration') : t('puzzle.showTransliteration')}
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
                title={showTafsir ? t('puzzle.hideTafsir') : t('puzzle.showTafsir')}
                data-tutorial="tafsir-button"
              >
                <BookText className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleAiTafsir}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 relative ${
                  showAiTafsir
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title={showAiTafsir ? t('puzzle.hideAiTafsir') : t('puzzle.showAiTafsir')}
                data-tutorial="ai-tafsir-button"
              >
                {isLoadingAiTafsir ? (
                  <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded text-[8px] font-bold text-white">
                      PRO
                    </span>
                  </>
                )}
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
                  availableTafsirs={availableTafsirs}
                  selectedTafsirType={tafsirType}
                  onTafsirTypeChange={handleTafsirTypeChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Tafsir Display */}
          <AnimatePresence>
            {showAiTafsir && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-semibold text-pink-400">{t('puzzle.aiGeneratedTafsir')}</span>
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded text-[10px] font-bold text-white">
                      PRO
                    </span>
                  </div>
                  
                  {aiError ? (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {aiError}
                      {requiresPro && (
                        <Link 
                          href="/pricing" 
                          className="block mt-2 text-pink-400 hover:text-pink-300 font-medium underline"
                        >
                          View Pro Plans →
                        </Link>
                      )}
                    </div>
                  ) : aiTafsir ? (
                    <>
                      <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                        ⚠️ AI-generated content. Please consult traditional scholars for authoritative guidance.
                      </div>
                      <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {aiTafsir}
                      </div>
                      {aiTafsirSource && (
                        <div className="mt-3 text-xs text-gray-500 italic">
                          Source: {aiTafsirSource}
                        </div>
                      )}
                    </>
                  ) : isLoadingAiTafsir ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
    </TutorialWrapper>
  );
}
