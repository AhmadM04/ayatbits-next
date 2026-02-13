'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface VerseNavButtonsProps {
  puzzleId: string;
  juzNumber: number;
  surahNumber: number;
  previousAyah?: number;
  nextAyah?: number;
  selectedAyah: number;
  totalAyahs: number;
}

export default function VerseNavButtons({
  puzzleId,
  juzNumber,
  surahNumber,
  previousAyah,
  nextAyah,
  selectedAyah,
  totalAyahs,
}: VerseNavButtonsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Ayah Selector Button */}
      <div className="flex items-center justify-center mb-4">
        <button
          id="search-ayah-button"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-[#E5E7EB] dark:border-white/10 rounded-lg transition-all"
        >
          <span className="text-sm font-medium text-[#059669]">
            {t('wordPuzzle.ayahOf', { current: selectedAyah, total: totalAyahs })}
          </span>
          <svg className="w-4 h-4 text-[#8E7F71] dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </div>

      {/* Start Puzzle Button */}
      <Link
        href={`/puzzle/${puzzleId}`}
        className="group flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-[#059669] to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 rounded-2xl font-bold text-lg text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
      >
        <Play className="w-6 h-6 fill-current" />
        <span>{t('wordPuzzle.startPuzzle')}</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {previousAyah && (
          <Link
            href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${previousAyah}`}
            className="text-sm text-[#8E7F71] dark:text-gray-400 hover:text-[#4A3728] dark:hover:text-white transition-colors"
          >
            ← {t('wordPuzzle.previous')}
          </Link>
        )}
        {previousAyah && nextAyah && (
          <span className="text-[#E5E7EB]">•</span>
        )}
        {nextAyah && (
          <Link
            href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${nextAyah}`}
            className="text-sm text-[#8E7F71] dark:text-gray-400 hover:text-[#4A3728] dark:hover:text-white transition-colors"
          >
            {t('wordPuzzle.next')} →
          </Link>
        )}
      </div>
    </>
  );
}

