'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface JuzContentProps {
  juzName: string;
  surahs: Array<{
    _id: string;
    number: number;
    nameEnglish: string;
    nameArabic: string;
    puzzleCount: number;
    completedCount: number;
    startAyahNumber: number;
  }>;
  juzNumber: number;
}

export default function JuzContent({
  juzName,
  surahs,
  juzNumber,
}: JuzContentProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{juzName}</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {surahs.length} {t('common.surah')}s {t('dashboard.surahsAvailable') || 'available'}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {surahs.map((surah) => {
            const progress = surah.puzzleCount > 0 
              ? (surah.completedCount / surah.puzzleCount) * 100 
              : 0;

            return (
              <Link
                key={surah._id}
                href={`/dashboard/juz/${juzNumber}/surah/${surah.number}`}
                className="bg-[var(--bg-card)] rounded-lg p-6 shadow-sm border border-[var(--border-color)] hover:border-green-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                      {surah.nameEnglish}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mb-1" dir="rtl">{surah.nameArabic}</div>
                    {surah.startAyahNumber > 1 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {t('verse.ayahNumber', { number: surah.startAyahNumber })}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    #{surah.number}
                  </div>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {surah.completedCount}/{surah.puzzleCount} {t('puzzle.puzzles') || 'puzzles'}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
