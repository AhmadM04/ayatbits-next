'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getStartPageForJuz } from '@/lib/mushaf-utils';
import { useI18n } from '@/lib/i18n';

const STORAGE_KEY = 'last_viewed_mushaf_page';

interface MushafFABProps {
  juzNumber?: number;
  size?: 'default' | 'large';
}

export default function MushafFAB({ juzNumber, size = 'default' }: MushafFABProps) {
  const { t } = useI18n();
  const isLarge = size === 'large';

  // Compute the fallback page synchronously (safe for SSR).
  // If a juzNumber is provided we fall back to that juz's first page;
  // otherwise we default to page 1.
  const fallbackPage = juzNumber ? getStartPageForJuz(juzNumber) : 1;

  // Page state is initialised with the fallback so the first render is
  // consistent between server and client (no hydration mismatch).
  // On mount the effect below overwrites it with the persisted value if
  // one exists, ensuring the href is correct before the user can click.
  const [targetPage, setTargetPage] = useState<number>(fallbackPage);

  useEffect(() => {
    // Read the persisted page once on mount. This runs only on the client,
    // so localStorage is always available here.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTargetPage(parsed);
        }
      }
    } catch {
      // localStorage unavailable (private browsing, storage full, etc.)
    }
    // Intentionally no deps — we only want to read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const href = `/dashboard/mushaf/page/${targetPage}`;

  // Build a human-readable tooltip label
  const tooltipLabel = juzNumber
    ? `${t('mushaf.page')} ${targetPage} (${t('mushaf.juz')} ${juzNumber})`
    : `${t('mushaf.page')} ${targetPage}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', damping: 15 }}
      className={`fixed z-40 ${
        isLarge
          ? 'bottom-24 right-4 sm:bottom-28 sm:right-6 lg:right-8'
          : 'bottom-24 right-4'
      }`}
    >
      <Link
        href={href}
        className={`group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-full shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:scale-105 ${
          isLarge
            ? 'px-5 py-3.5 sm:px-6 sm:py-4 md:px-8 md:py-5'
            : 'px-4 py-3'
        }`}
      >
        <BookOpen className={isLarge ? 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' : 'w-5 h-5'} />
        <span
          className={`font-medium ${
            isLarge ? 'text-sm sm:text-base md:text-lg' : 'text-sm'
          }`}
        >
          {t('wordPuzzle.readMushaf')}
        </span>
      </Link>

      {/* Tooltip on hover */}
      <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-800 dark:bg-[#1a1a1a] border border-gray-700 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-100 dark:text-gray-300 whitespace-nowrap shadow-lg">
          {tooltipLabel}
        </div>
      </div>
    </motion.div>
  );
}
