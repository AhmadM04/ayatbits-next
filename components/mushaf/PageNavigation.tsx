'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOTAL_MUSHAF_PAGES, getJuzForPage } from '@/lib/mushaf-utils';
import { useI18n } from '@/lib/i18n';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  currentJuz: number;
}

export default function PageNavigation({
  currentPage,
  totalPages,
  currentJuz,
}: PageNavigationProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  useEffect(() => {
    if (showDropdown && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(`/dashboard/mushaf/page/${page}`);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      navigateToPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      navigateToPage(currentPage + 1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(searchValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setShowDropdown(false);
      setSearchValue('');
      navigateToPage(pageNum);
    }
  };

  const handleQuickSelect = (page: number) => {
    setShowDropdown(false);
    setSearchValue('');
    navigateToPage(page);
  };

  // Generate page ranges for quick selection
  const pageRanges = [];
  for (let i = 1; i <= 30; i++) {
    const startPage = (i - 1) * 20 + 1;
    const endPage = Math.min(i * 20, totalPages);
    if (startPage <= totalPages) {
      pageRanges.push({ label: `${startPage}-${endPage}`, start: startPage });
    }
  }

  return (
    <div className="flex items-center justify-between">
      {/* Previous Button - SEPIA THEME */}
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className={`
          p-1.5 sm:p-2 rounded-lg transition-colors
          ${canGoPrevious 
            ? 'hover:bg-gray-100 dark:hover:bg-white/5 text-[#4A3728] dark:text-white' 
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }
        `}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Page Info & Dropdown - SEPIA THEME */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="text-center">
            <span className="text-[#4A3728] dark:text-white font-medium text-sm sm:text-base">{t('common.page')} {currentPage}</span>
            <span className="text-[#8E7F71] dark:text-gray-400 text-xs sm:text-sm ml-1 sm:ml-2">{t('common.of')} {totalPages}</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8E7F71] dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Panel - SEPIA THEME */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[90vw] max-w-xs bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="p-3 border-b border-gray-200 dark:border-white/10">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="number"
                    min={1}
                    max={totalPages}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Go to page..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-[#4A3728] dark:text-white placeholder-[#8E7F71] dark:placeholder-gray-500 focus:outline-none focus:border-[#059669] dark:focus:border-green-500 focus:ring-1 focus:ring-[#059669] dark:focus:ring-green-500 text-sm"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => setSearchValue('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded"
                    >
                      <X className="w-4 h-4 text-[#8E7F71] dark:text-gray-400" />
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Select - Juz Based */}
              <div className="p-2 max-h-64 overflow-y-auto">
                <p className="text-xs text-[#8E7F71] dark:text-gray-400 px-2 py-1 mb-1">Quick Jump by {t('common.juz')}</p>
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                    const startPage = (juz - 1) * 20 + 1;
                    const isCurrentJuz = juz === currentJuz;
                    return (
                      <button
                        key={juz}
                        onClick={() => handleQuickSelect(startPage > totalPages ? totalPages : startPage)}
                        className={`
                          p-2 rounded-lg text-xs font-medium transition-colors
                          ${isCurrentJuz 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-[#059669] dark:text-green-400 border border-[#059669]/30 dark:border-green-500/30' 
                            : 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#4A3728] dark:text-white border border-gray-200 dark:border-white/10'
                          }
                        `}
                      >
                        {juz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Info */}
              <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <p className="text-xs text-[#8E7F71] dark:text-gray-400 text-center">
                  Currently in {t('common.juz')} {currentJuz}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Button - SEPIA THEME */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`
          p-1.5 sm:p-2 rounded-lg transition-colors
          ${canGoNext 
            ? 'hover:bg-gray-100 dark:hover:bg-white/5 text-[#4A3728] dark:text-white' 
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }
        `}
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}

