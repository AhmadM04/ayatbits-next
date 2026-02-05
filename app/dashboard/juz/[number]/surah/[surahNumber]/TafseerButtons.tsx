'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookText, Sparkles, X, AlertCircle, Languages, Menu, Globe, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/Toast';

interface TafseerButtonsProps {
  surahNumber: number;
  ayahNumber: number;
  selectedTranslation: string;
  ayahText: string;
  subscriptionPlan?: string;
  initialShowTransliteration?: boolean;
}

// Translation names and options
const TRANSLATION_NAMES: Record<string, string> = {
  'en.sahih': 'Sahih International',
  'en.pickthall': 'Pickthall',
  'en.yusufali': 'Yusuf Ali',
  'ar.jalalayn': 'Tafsir Al-Jalalayn',
  'ar.tafseer': 'Tafsir Al-Muyassar',
  'fr.hamidullah': 'Hamidullah (French)',
  'es.cortes': 'Cortes (Spanish)',
  'de.bubenheim': 'Bubenheim (German)',
  'tr.yazir': 'Yazır (Turkish)',
  'ur.maududi': 'Maududi (Urdu)',
  'id.muntakhab': 'Muntakhab (Indonesian)',
  'ms.basmeih': 'Basmeih (Malay)',
  'bn.hoque': 'Hoque (Bengali)',
  'hi.hindi': 'Hindi',
  'ru.kuliev': 'Kuliev (Russian)',
  'zh.chinese': 'Chinese',
  'ja.japanese': 'Japanese',
  'nl.dutch': 'Dutch',
};

const TRANSLATION_OPTIONS = Object.entries(TRANSLATION_NAMES).map(([code, name]) => ({
  code,
  name,
}));

// Translations that support regular tafseer
const TAFSEER_SUPPORTED_TRANSLATIONS = [
  'ar.jalalayn',
  'ar.tafseer',
  'en.sahih',
  'en.pickthall',
  'en.yusufali',
  'ru.kuliev',
];

// Languages supported for AI tafseer
const AI_TAFSEER_LANGUAGES: Record<string, string> = {
  'en': 'English',
  'ar': 'Arabic',
  'ru': 'Russian',
};

export default function TafseerButtons({
  surahNumber,
  ayahNumber,
  selectedTranslation,
  ayahText,
  subscriptionPlan,
  initialShowTransliteration = false,
}: TafseerButtonsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { showToast } = useToast();
  const [showTafsir, setShowTafsir] = useState(false);
  const [showAiTafsir, setShowAiTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [tafsirResource, setTafsirResource] = useState<string>('Tafsir Ibn Kathir');
  const [isTafsirFallback, setIsTafsirFallback] = useState(false);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [aiTafsir, setAiTafsir] = useState<string | null>(null);
  const [aiTafsirSource, setAiTafsirSource] = useState<string>('');
  const [isLoadingAiTafsir, setIsLoadingAiTafsir] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [requiresPro, setRequiresPro] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTransliteration, setShowTransliteration] = useState(initialShowTransliteration);
  const [transliteration, setTransliteration] = useState<string>('');
  const [wordTransliterations, setWordTransliterations] = useState<Array<{ text: string; transliteration: string }>>([]);
  const [isLoadingTransliteration, setIsLoadingTransliteration] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTranslationMenu, setShowTranslationMenu] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState(selectedTranslation);
  const [isUpdatingTranslation, setIsUpdatingTranslation] = useState(false);

  const isTafseerSupported = TAFSEER_SUPPORTED_TRANSLATIONS.includes(selectedTranslation);
  const isPro = subscriptionPlan?.toLowerCase().includes('pro');
  
  // Get current language from translation code
  const currentLang = selectedTranslation.split('.')[0];
  const isAiTafseerLanguageSupported = AI_TAFSEER_LANGUAGES.hasOwnProperty(currentLang);

  // Reset when verse changes
  useEffect(() => {
    setShowTafsir(false);
    setShowAiTafsir(false);
    setTafsir(null);
    setAiTafsir(null);
    setAiTafsirSource('');
    setAiError(null);
    setRequiresPro(false);
    setTranslation(null);
    setTransliteration('');
    setWordTransliterations([]);
    setShowMobileMenu(false);
    setShowTranslationMenu(false);
  }, [surahNumber, ayahNumber]);

  // Update current translation when prop changes
  useEffect(() => {
    setCurrentTranslation(selectedTranslation);
  }, [selectedTranslation]);

  const handleShowTafsir = useCallback(async () => {
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
        `/api/verse/tafsir?surah=${surahNumber}&ayah=${ayahNumber}&language=${selectedTranslation}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTafsir(data.tafsir || 'Tafsir not available');
        setTafsirResource(data.resource || 'Tafsir Ibn Kathir');
        setIsTafsirFallback(data.isFallback || false);
        setShowTafsir(true);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
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
  }, [surahNumber, ayahNumber, selectedTranslation, tafsir, showTafsir]);

  const handleShowTransliteration = useCallback(async () => {
    if (showTransliteration) {
      setShowTransliteration(false);
      return;
    }

    if (transliteration && wordTransliterations.length > 0) {
      setShowTransliteration(true);
      return;
    }

    try {
      setIsLoadingTransliteration(true);
      
      // Fetch word transliterations
      const wordsResponse = await fetch(
        `/api/verse/words?surah=${surahNumber}&ayah=${ayahNumber}`
      );
      if (wordsResponse.ok) {
        const wordsData = await wordsResponse.json();
        setWordTransliterations(wordsData.words || []);
      }

      // Fetch full transliteration
      const translitResponse = await fetch(
        `/api/verse/transliteration?surah=${surahNumber}&ayah=${ayahNumber}`
      );
      if (translitResponse.ok) {
        const translitData = await translitResponse.json();
        setTransliteration(translitData.transliteration || '');
      }

      setShowTransliteration(true);

      // Save preference to backend
      try {
        await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showTransliteration: true }),
        });
      } catch (error) {
        console.error('Failed to save transliteration preference:', error);
      }
    } catch (error) {
      console.error('Failed to fetch transliteration:', error);
    } finally {
      setIsLoadingTransliteration(false);
    }
  }, [showTransliteration, transliteration, wordTransliterations, surahNumber, ayahNumber]);

  const handleTranslationChange = useCallback(async (translationCode: string) => {
    if (translationCode === currentTranslation) {
      return;
    }

    setIsUpdatingTranslation(true);
    try {
      const response = await fetch('/api/user/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translation: translationCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to update translation');
      }

      setCurrentTranslation(translationCode);
      
      // Reload the page to fetch new translation
      window.location.reload();
    } catch (error) {
      console.error('Failed to update translation:', error);
    } finally {
      setIsUpdatingTranslation(false);
    }
  }, [currentTranslation]);

  const handleShowAiTafsir = useCallback(async () => {
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
          `/api/verse/translation?surah=${surahNumber}&ayah=${ayahNumber}&translation=${selectedTranslation}`
        );
        if (transResponse.ok) {
          const transData = await transResponse.json();
          translationText = transData.translation;
          setTranslation(translationText);
        }
      }

      // Call AI Tafsir API
      const response = await fetch('/api/ai/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: surahNumber,
          ayahNumber: ayahNumber,
          ayahText: ayahText,
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
      setAiTafsirSource(data.source || '');
      setShowAiTafsir(true);
    } catch (error) {
      console.error('Failed to fetch AI tafsir:', error);
      setAiError('Network error. Please try again.');
    } finally {
      setIsLoadingAiTafsir(false);
    }
  }, [surahNumber, ayahNumber, ayahText, selectedTranslation, aiTafsir, showAiTafsir, translation]);

  return (
    <>
      {/* Desktop Buttons - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Translation Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowTranslationMenu(!showTranslationMenu)}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors flex-shrink-0"
            title="Change Translation"
            data-tutorial="translation-button"
          >
            <Globe className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showTranslationMenu && (
              <>
                {/* Backdrop for translation menu */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTranslationMenu(false)}
                />

                {/* Translation dropdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Select Translation
                    </div>
                    {TRANSLATION_OPTIONS.map((option) => (
                      <button
                        key={option.code}
                        onClick={() => {
                          handleTranslationChange(option.code);
                          setShowTranslationMenu(false);
                        }}
                        disabled={isUpdatingTranslation}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                          currentTranslation === option.code
                            ? 'bg-green-500/10 text-white border border-green-500/30'
                            : 'text-gray-300 hover:bg-white/5'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="text-sm">{option.name}</span>
                        {currentTranslation === option.code && (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Transliteration Button */}
        <button
          onClick={handleShowTransliteration}
          disabled={isLoadingTransliteration}
          className={`
            p-2 rounded-lg transition-colors flex-shrink-0
            ${showTransliteration
              ? 'bg-teal-500/20 text-teal-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }
          `}
          title="Show Transliteration"
          data-tutorial="transliteration-button"
        >
          {isLoadingTransliteration ? (
            <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Languages className="w-5 h-5" />
          )}
        </button>

        {/* Regular Tafsir Button */}
        <button
          onClick={handleShowTafsir}
          disabled={isLoadingTafsir}
          className={`
            p-2 rounded-lg transition-colors flex-shrink-0
            ${showTafsir
              ? 'bg-purple-500/20 text-purple-400'
              : 'relative bg-white/5 text-gray-400 hover:bg-white/10'
            }
            ${!isTafseerSupported ? 'opacity-60' : ''}
          `}
          title={isTafseerSupported ? "Read Tafsir" : "Tafsir available only for select translations"}
          data-tutorial="tafsir-button"
        >
          {isLoadingTafsir ? (
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <BookText className="w-5 h-5" />
          )}
          {!isTafseerSupported && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-2 h-2 text-white" />
            </span>
          )}
        </button>

        {/* AI Tafsir Button */}
        <button
          onClick={handleShowAiTafsir}
          disabled={isLoadingAiTafsir}
          className={`
            p-2 rounded-lg transition-colors flex-shrink-0 relative
            ${showAiTafsir
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }
            ${!isAiTafseerLanguageSupported ? 'opacity-60' : ''}
          `}
          title={isAiTafseerLanguageSupported ? "AI Tafsir (Pro)" : `AI Tafsir available in ${Object.values(AI_TAFSEER_LANGUAGES).join(', ')}`}
          data-tutorial="ai-tafsir-button"
        >
          {isLoadingAiTafsir ? (
            <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {!isPro && (
            <span className="absolute -top-1 -right-1 px-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded text-[8px] font-bold text-white">
              PRO
            </span>
          )}
        </button>
      </div>

      {/* Mobile Burger Menu */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
          title="Options"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showMobileMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setShowMobileMenu(false)}
              />

              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setShowTranslationMenu(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>Translation</span>
                </button>

                <button
                  onClick={() => {
                    handleShowTransliteration();
                    setShowMobileMenu(false);
                  }}
                  disabled={isLoadingTransliteration}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                >
                  {isLoadingTransliteration ? (
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Languages className={`w-4 h-4 ${showTransliteration ? 'text-teal-400' : 'text-gray-400'}`} />
                  )}
                  <span className={showTransliteration ? 'text-teal-400' : ''}>Transliteration</span>
                </button>

                <button
                  onClick={() => {
                    handleShowTafsir();
                    setShowMobileMenu(false);
                  }}
                  disabled={isLoadingTafsir}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                >
                  {isLoadingTafsir ? (
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <BookText className={`w-4 h-4 ${showTafsir ? 'text-purple-400' : 'text-gray-400'}`} />
                  )}
                  <span className={showTafsir ? 'text-purple-400' : ''}>Tafsir</span>
                </button>

                <button
                  onClick={() => {
                    handleShowAiTafsir();
                    setShowMobileMenu(false);
                  }}
                  disabled={isLoadingAiTafsir}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                >
                  {isLoadingAiTafsir ? (
                    <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className={`w-4 h-4 ${showAiTafsir ? 'text-pink-400' : 'text-gray-400'}`} />
                  )}
                  <span className={showAiTafsir ? 'text-pink-400' : ''}>
                    AI Tafsir {!isPro && <span className="text-[10px] ml-1 px-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded">PRO</span>}
                  </span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Translation Menu Modal */}
        <AnimatePresence>
          {showTranslationMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowTranslationMenu(false)}
              />

              {/* Translation Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-4 right-4 bottom-6 z-50 max-w-md mx-auto"
              >
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[70vh] flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <p className="text-sm font-medium text-white">Select Translation</p>
                    </div>
                    <button
                      onClick={() => setShowTranslationMenu(false)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 overflow-y-auto flex-1">
                    <div className="space-y-1">
                      {TRANSLATION_OPTIONS.map((option) => (
                        <button
                          key={option.code}
                          onClick={() => {
                            handleTranslationChange(option.code);
                            setShowTranslationMenu(false);
                          }}
                          disabled={isUpdatingTranslation}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                            currentTranslation === option.code
                              ? 'bg-green-500/10 text-white border border-green-500/30'
                              : 'text-gray-300 hover:bg-white/5'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span className="text-sm">{option.name}</span>
                          {currentTranslation === option.code && (
                            <Check className="w-4 h-4 text-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Tafsir/Transliteration Modal/Panel */}
      <AnimatePresence>
        {(showTafsir || showAiTafsir || showTransliteration) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => {
                setShowTafsir(false);
                setShowAiTafsir(false);
                setShowTransliteration(false);
              }}
            />

            {/* Content Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-4 right-4 bottom-6 z-50 max-w-3xl mx-auto"
            >
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {showTransliteration ? 'Transliteration' : showTafsir ? 'Tafsir' : 'AI Tafsir'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Surah {surahNumber}, Ayah {ayahNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTafsir(false);
                      setShowAiTafsir(false);
                      setShowTransliteration(false);
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                  {showTransliteration && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Languages className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">
                          Transliteration
                        </span>
                      </div>
                      
                      {isLoadingTransliteration ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : transliteration ? (
                        <div className="text-base text-gray-300 leading-relaxed italic">
                          {transliteration}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">No transliteration available</div>
                      )}
                    </div>
                  )}

                  {showTafsir && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookText className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">
                          {tafsirResource}
                        </span>
                      </div>
                      
                      {/* Warning for unsupported translations */}
                      {!isTafseerSupported && (
                        <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Translation Notice</p>
                              <p>Regular Tafsir works best with these translations: Arabic Tafsirs, English (Sahih, Pickthall, Yusuf Ali), and Russian (Kuliev). You may see a fallback to English tafsir.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {isTafsirFallback && (
                        <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                          ℹ️ Showing English tafsir (native tafsir not available in your language)
                        </div>
                      )}
                      
                      <div 
                        className="text-sm text-gray-300 leading-relaxed prose prose-sm prose-invert max-w-none
                          prose-p:my-2 prose-strong:text-white prose-strong:font-semibold
                          prose-em:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: tafsir || 'Loading...' }}
                      />
                    </div>
                  )}

                  {showAiTafsir && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-xs font-medium text-pink-400 uppercase tracking-wide">
                          AI-Generated Tafsir
                        </span>
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded text-[9px] font-bold text-white">
                          PRO
                        </span>
                        {isAiTafseerLanguageSupported && (
                          <span className="text-xs text-gray-500">
                            • {AI_TAFSEER_LANGUAGES[currentLang]}
                          </span>
                        )}
                      </div>

                      {!isAiTafseerLanguageSupported && (
                        <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Language Notice</p>
                              <p>AI Tafsir is currently available in {Object.values(AI_TAFSEER_LANGUAGES).join(', ')}. Please switch to one of these translations to use AI Tafsir.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {aiError ? (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          {aiError}
                          {requiresPro && (
                            <a 
                              href="/pricing" 
                              className="block mt-2 text-pink-400 hover:text-pink-300 font-medium"
                            >
                              View Pro Plans →
                            </a>
                          )}
                        </div>
                      ) : aiTafsir ? (
                        <>
                          <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                            ⚠️ AI-generated content. Please consult traditional scholars for authoritative guidance.
                          </div>
                          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {aiTafsir}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">Loading...</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

