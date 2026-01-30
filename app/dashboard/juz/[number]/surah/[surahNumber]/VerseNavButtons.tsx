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
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
        >
          <span className="text-sm font-medium text-green-400">
            {t('wordPuzzle.ayahOf', { current: selectedAyah, total: totalAyahs })}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </div>

      {/* Start Puzzle Button */}
      <Link
        href={`/puzzle/${puzzleId}`}
        className="group flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-2xl font-bold text-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all active:scale-[0.98]"
      >
        <Play className="w-6 h-6 fill-current" />
        <span>{t('wordPuzzle.startPuzzle')}</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {previousAyah && (
          <Link
            href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${previousAyah}`}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← {t('wordPuzzle.previous')}
          </Link>
        )}
        {previousAyah && nextAyah && (
          <span className="text-gray-700">•</span>
        )}
        {nextAyah && (
          <Link
            href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${nextAyah}`}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t('wordPuzzle.next')} →
          </Link>
        )}
      </div>
    </>
  );
}

