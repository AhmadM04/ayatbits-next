'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import TranslationDisplay from './TranslationDisplay';

interface VerseContentProps {
  ayahText: string;
  currentAyahNumber: number;
  surahNum: number;
  selectedTranslation: string;
  initialTranslation: string;
  puzzleId: string;
  previousPuzzle: { content: { ayahNumber: number } } | null;
  nextPuzzle: { content: { ayahNumber: number } } | null;
  juzNumber: number;
  surahNumber: number;
}

export default function VerseContent({
  ayahText,
  currentAyahNumber,
  surahNum,
  selectedTranslation,
  initialTranslation,
  puzzleId,
  previousPuzzle,
  nextPuzzle,
  juzNumber,
  surahNumber,
}: VerseContentProps) {
  const { t } = useI18n();

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Arabic Verse */}
        <div className="bg-[var(--bg-card)] rounded-xl p-8 mb-6 shadow-sm border border-[var(--border-color)] transition-colors">
          <div className="text-center" dir="rtl">
            <div className="mb-4">
              <span className="text-sm font-medium text-[var(--text-muted)]">
                {t('verse.ayahNumber', { number: currentAyahNumber })}
              </span>
            </div>
            <p className="text-3xl font-medium leading-relaxed text-[var(--text-primary)] mb-6">
              {ayahText}
            </p>
            <AudioPlayer surahNumber={surahNum} ayahNumber={currentAyahNumber} />
          </div>
        </div>

        {/* Translation */}
        <TranslationDisplay
          surahNumber={surahNum}
          ayahNumber={currentAyahNumber}
          selectedTranslation={selectedTranslation}
          initialTranslation={initialTranslation}
        />

        {/* Ready to Start Puzzle Button */}
        <Link
          href={`/puzzle/${puzzleId}`}
          className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-4 px-6 rounded-lg transition-colors mb-8"
        >
          {t('verse.readyToStartPuzzle')}
        </Link>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] shadow-lg transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-2">
            {/* Left: Previous Button */}
            <div className="flex items-center">
              {previousPuzzle ? (
                <Link 
                  href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${previousPuzzle.content.ayahNumber}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-lg hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{t('common.prev')}</span>
                </Link>
              ) : (
                <div className="w-20"></div>
              )}
            </div>
            
            {/* Center: Reset Button */}
            <div className="flex flex-col items-center gap-1">
              <button className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all shadow-md hover:shadow-lg bg-[var(--bg-card)]">
                <span className="text-[var(--text-secondary)] text-xl font-bold">↻</span>
              </button>
              <span className="text-xs text-[var(--text-muted)] font-medium">{t('common.reset')}</span>
            </div>
            
            {/* Right: Next Button */}
            <div className="flex items-center">
              {nextPuzzle ? (
                <Link 
                  href={`/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${nextPuzzle.content.ayahNumber}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-lg hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all shadow-sm hover:shadow-md"
                >
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{t('common.next')}</span>
                  <ArrowRight className="w-5 h-5 text-[var(--text-secondary)]" />
                </Link>
              ) : (
                <div className="w-20"></div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
