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
        className="hidden md:flex p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white items-center gap-1"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
      </button>

      {/* Mobile button - full width style matching other items */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
        aria-label="Select language"
      >
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
          <Globe className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-sm text-white font-medium flex-1">
          {LOCALE_NAMES[locale]}
        </span>
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 md:mt-2 mt-1 w-full md:w-40 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                locale === loc
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
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

