'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConditionalMotion, ConditionalAnimatePresence } from '@/components/ConditionalMotion';
import { useI18n } from '@/lib/i18n';

// Complete mapping of all 114 surahs to their primary juz
const SURAH_TO_JUZ: { [key: number]: number } = {
  1: 1,   // Al-Fatiha
  2: 1,   // Al-Baqarah (spans 1-3)
  3: 3,   // Ali 'Imran (spans 3-4)
  4: 4,   // An-Nisa (spans 4-6)
  5: 6,   // Al-Ma'idah (spans 6-7)
  6: 7,   // Al-An'am (spans 7-8)
  7: 8,   // Al-A'raf (spans 8-9)
  8: 9,   // Al-Anfal
  9: 10,  // At-Tawbah (spans 10-11)
  10: 11, // Yunus
  11: 11, // Hud (spans 11-12)
  12: 12, // Yusuf (spans 12-13)
  13: 13, // Ar-Ra'd
  14: 13, // Ibrahim
  15: 14, // Al-Hijr
  16: 14, // An-Nahl
  17: 15, // Al-Isra
  18: 15, // Al-Kahf (spans 15-16)
  19: 16, // Maryam
  20: 16, // Taha
  21: 17, // Al-Anbiya
  22: 17, // Al-Hajj
  23: 18, // Al-Mu'minun
  24: 18, // An-Nur
  25: 18, // Al-Furqan (spans 18-19)
  26: 19, // Ash-Shu'ara
  27: 19, // An-Naml (spans 19-20)
  28: 20, // Al-Qasas
  29: 20, // Al-'Ankabut (spans 20-21)
  30: 21, // Ar-Rum
  31: 21, // Luqman
  32: 21, // As-Sajdah
  33: 21, // Al-Ahzab (spans 21-22)
  34: 22, // Saba'
  35: 22, // Fatir
  36: 22, // Ya-Sin (spans 22-23)
  37: 23, // As-Saffat
  38: 23, // Sad
  39: 23, // Az-Zumar (spans 23-24)
  40: 24, // Ghafir
  41: 24, // Fussilat (spans 24-25)
  42: 25, // Ash-Shura
  43: 25, // Az-Zukhruf
  44: 25, // Ad-Dukhan
  45: 25, // Al-Jathiyah
  46: 26, // Al-Ahqaf
  47: 26, // Muhammad
  48: 26, // Al-Fath
  49: 26, // Al-Hujurat
  50: 26, // Qaf
  51: 26, // Adh-Dhariyat (spans 26-27)
  52: 27, // At-Tur
  53: 27, // An-Najm
  54: 27, // Al-Qamar
  55: 27, // Ar-Rahman
  56: 27, // Al-Waqi'ah
  57: 27, // Al-Hadid
  58: 28, // Al-Mujadilah
  59: 28, // Al-Hashr
  60: 28, // Al-Mumtahanah
  61: 28, // As-Saff
  62: 28, // Al-Jumu'ah
  63: 28, // Al-Munafiqun
  64: 28, // At-Taghabun
  65: 28, // At-Talaq
  66: 28, // At-Tahrim
  67: 29, // Al-Mulk
  68: 29, // Al-Qalam
  69: 29, // Al-Haqqah
  70: 29, // Al-Ma'arij
  71: 29, // Nuh
  72: 29, // Al-Jinn
  73: 29, // Al-Muzzammil
  74: 29, // Al-Muddaththir
  75: 29, // Al-Qiyamah
  76: 29, // Al-Insan
  77: 29, // Al-Mursalat
  78: 30, // An-Naba'
  79: 30, // An-Nazi'at
  80: 30, // 'Abasa
  81: 30, // At-Takwir
  82: 30, // Al-Infitar
  83: 30, // Al-Mutaffifin
  84: 30, // Al-Inshiqaq
  85: 30, // Al-Buruj
  86: 30, // At-Tariq
  87: 30, // Al-A'la
  88: 30, // Al-Ghashiyah
  89: 30, // Al-Fajr
  90: 30, // Al-Balad
  91: 30, // Ash-Shams
  92: 30, // Al-Layl
  93: 30, // Ad-Duha
  94: 30, // Ash-Sharh
  95: 30, // At-Tin
  96: 30, // Al-'Alaq
  97: 30, // Al-Qadr
  98: 30, // Al-Bayyinah
  99: 30, // Az-Zalzalah
  100: 30, // Al-'Adiyat
  101: 30, // Al-Qari'ah
  102: 30, // At-Takathur
  103: 30, // Al-'Asr
  104: 30, // Al-Humazah
  105: 30, // Al-Fil
  106: 30, // Quraysh
  107: 30, // Al-Ma'un
  108: 30, // Al-Kawthar
  109: 30, // Al-Kafirun
  110: 30, // An-Nasr
  111: 30, // Al-Masad
  112: 30, // Al-Ikhlas
  113: 30, // Al-Falaq
  114: 30, // An-Nas
};

export default function VerseSearch() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Global keyboard shortcut: Press "F" to open search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if:
      // - "F" key is pressed
      // - Not already in an input/textarea
      // - Modal is not already open
      if (
        e.key === 'f' &&
        !isOpen &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const parseQuery = (input: string): { surah: number; ayah: number } | null => {
    const trimmed = input.trim();
    
    // Format: surah:ayah (e.g., 2:255)
    if (trimmed.includes(':')) {
      const [surahPart, ayahPart] = trimmed.split(':');
      const surah = parseInt(surahPart);
      const ayah = parseInt(ayahPart);
      
      if (!isNaN(surah) && !isNaN(ayah) && surah >= 1 && surah <= 114 && ayah >= 1) {
        return { surah, ayah };
      }
    }
    
    // Format: just surah number (e.g., 2)
    const surahNum = parseInt(trimmed);
    if (!isNaN(surahNum) && surahNum >= 1 && surahNum <= 114) {
      return { surah: surahNum, ayah: 1 };
    }
    
    return null;
  };

  const handleSearch = async () => {
    const result = parseQuery(query);
    
    if (!result) {
      setError(t('search.invalidFormat'));
      return;
    }

    // Validate surah number
    if (result.surah < 1 || result.surah > 114) {
      setError(t('search.surahNotFound'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if the puzzle exists by calling an API
      const response = await fetch(`/api/search/verse?surah=${result.surah}&ayah=${result.ayah}`);
      const data = await response.json();

      if (data.found && data.juz) {
        // Navigate to the verse
        router.push(`/dashboard/juz/${data.juz}/surah/${result.surah}?ayah=${result.ayah}`);
        setIsOpen(false);
        setQuery('');
        setError('');
      } else {
        // Use the static mapping as fallback
        const juz = SURAH_TO_JUZ[result.surah];
        if (juz) {
          router.push(`/dashboard/juz/${juz}/surah/${result.surah}?ayah=${result.ayah}`);
          setIsOpen(false);
          setQuery('');
          setError('');
        } else {
          setError('This verse is not available yet');
        }
      }
    } catch {
      // Fallback to static mapping if API fails
      const juz = SURAH_TO_JUZ[result.surah];
      if (juz) {
        router.push(`/dashboard/juz/${juz}/surah/${result.surah}?ayah=${result.ayah}`);
        setIsOpen(false);
        setQuery('');
        setError('');
      } else {
        setError('This verse is not available yet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setError('');
    }
  };

  return (
    <>
      {/* Search Button - Desktop style */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-[#E5E7EB] dark:border-white/10 rounded-xl transition-colors w-full sm:w-auto"
      >
        <Search className="w-4 h-4 text-[#8E7F71] dark:text-gray-400" />
        <span className="text-sm text-[#8E7F71] dark:text-gray-400 flex-1 text-left sm:flex-initial">{t('common.search')}</span>
        <span className="text-xs text-[#8E7F71] dark:text-gray-500 hidden sm:inline">F</span>
      </button>

      {/* Search Button - Mobile style matching other items */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-50/50 dark:bg-green-500/10 flex items-center justify-center group-hover:bg-emerald-100/50 dark:group-hover:bg-green-500/20 transition-colors">
          <Search className="w-5 h-5 text-emerald-600 dark:text-green-400" />
        </div>
        <span className="text-sm text-[#4A3728] dark:text-white font-medium flex-1">{t('common.search')}</span>
        <span className="text-xs text-[#8E7F71] dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded">F</span>
      </button>

      {/* Search Modal - rendered at root level */}
      <ConditionalAnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - truly fixed, covers entire viewport */}
            <ConditionalMotion
              as="div"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
                setError('');
              }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md"
            />
            
            {/* Modal */}
            <ConditionalMotion
              as="div"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="fixed left-4 right-4 top-20 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[101]"
            >
              <div className="bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB] dark:border-white/10">
                  <span className="text-sm text-[#8E7F71] dark:text-gray-400">{t('search.searchVerse')}</span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      setError('');
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-[#8E7F71] dark:text-gray-400" />
                  </button>
                </div>
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-[#E5E7EB] dark:border-white/10">
                  <Search className="w-5 h-5 text-[#8E7F71] dark:text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t('search.placeholder')}
                    className="flex-1 bg-transparent text-[#4A3728] dark:text-white placeholder-[#8E7F71] dark:placeholder-gray-400 outline-none text-base"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery('');
                        setError('');
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-[#8E7F71] dark:text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="px-4 py-3 bg-red-50/50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-500/30">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        setError('');
                        router.push('/dashboard');
                      }}
                      className="mt-2 text-xs text-[#8E7F71] dark:text-gray-400 hover:text-[#4A3728] dark:hover:text-white underline"
                    >
                      {t('search.goToDashboard')}
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="p-3">
                  <p className="text-xs text-[#8E7F71] dark:text-gray-400 mb-2 px-1">{t('search.examples')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {['1', '2:255', '36', '67:1'].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          setQuery(example);
                          setError('');
                        }}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-[#4A3728] dark:text-white text-sm rounded-lg transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Go Button */}
                {query && (
                  <div className="p-3 pt-0">
                    <button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#059669] to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4" />
                          <span>{t('search.startLearning')}</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </ConditionalMotion>
          </>
        )}
      </ConditionalAnimatePresence>
    </>
  );
}
