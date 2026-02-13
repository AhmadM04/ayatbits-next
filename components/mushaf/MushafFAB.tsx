'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStartPageForJuz } from '@/lib/mushaf-utils';
import { useI18n } from '@/lib/i18n';

interface MushafFABProps {
  juzNumber?: number;
  size?: 'default' | 'large';
}

export default function MushafFAB({ juzNumber, size = 'default' }: MushafFABProps) {
  const { t } = useI18n();
  const startPage = juzNumber ? getStartPageForJuz(juzNumber) : 1;
  const isLarge = size === 'large';

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
        href={`/dashboard/mushaf/page/${startPage}`}
        className={`group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-full shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:scale-105 ${
          isLarge 
            ? 'px-5 py-3.5 sm:px-6 sm:py-4 md:px-8 md:py-5' 
            : 'px-4 py-3'
        }`}
      >
        <BookOpen className={isLarge ? 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7' : 'w-5 h-5'} />
        <span className={`font-medium ${
          isLarge 
            ? 'text-sm sm:text-base md:text-lg' 
            : 'text-sm'
        }`}>
          {t('wordPuzzle.readMushaf')}
        </span>
      </Link>
      
      {/* Tooltip on hover */}
      <div className="absolute right-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-800 dark:bg-[#1a1a1a] border border-gray-700 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-100 dark:text-gray-300 whitespace-nowrap shadow-lg">
          {juzNumber ? `${t('mushaf.page')} ${startPage} (${t('mushaf.juz')} ${juzNumber})` : `${t('mushaf.page')} ${startPage}`}
        </div>
      </div>
    </motion.div>
  );
}

