'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { LOCALE_NAMES, type Locale } from '@/lib/i18n-config';

export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const locales: Locale[] = ['en', 'ar', 'ru'];

  return (
    <div className="relative" ref={dropdownRef} data-tutorial="language-selector">
      {/* Desktop button - compact style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-[#8E7F71] dark:text-gray-400 hover:text-[#4A3728] dark:hover:text-white items-center gap-1"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
      </button>

      {/* Mobile button - full width style matching other items */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
        aria-label="Select language"
      >
        <div className="w-10 h-10 rounded-full bg-blue-50/50 flex items-center justify-center group-hover:bg-blue-100/50 transition-colors">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-sm text-[#4A3728] dark:text-white font-medium flex-1">
          {LOCALE_NAMES[locale]}
        </span>
        <svg className="w-5 h-5 text-[#8E7F71] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 md:mt-2 mt-1 w-full md:w-40 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                locale === loc
                  ? 'bg-emerald-50/50 text-[#4A3728] font-medium'
                  : 'text-[#8E7F71] hover:bg-gray-50 hover:text-[#4A3728]'
              }`}
            >
              {LOCALE_NAMES[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

