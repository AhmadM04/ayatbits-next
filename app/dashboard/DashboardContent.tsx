'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Flame, BookOpen, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardContentProps {
  userFirstName: string | null | undefined;
  currentStreak: number;
  completedPuzzles: number;
  juzsExplored: number;
  juzs: Array<{
    _id: string;
    number: number;
    name: string;
    _count: { puzzles: number };
    progress: number;
    completedPuzzles: number;
  }>;
}

export default function DashboardContent({
  userFirstName,
  currentStreak,
  completedPuzzles,
  juzsExplored,
  juzs,
}: DashboardContentProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-green-600">
              AyatBits
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-orange-500">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">{currentStreak}</span>
              </div>
              <ThemeToggle />
              <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {userFirstName?.[0] || 'U'}
                </span>
              </Link>
              <SignOutButton>
                <button className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <LogOut className="w-5 h-5" />
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {t('dashboard.welcome', { name: userFirstName || t('dashboard.learner') })}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t('dashboard.continueJourney')}
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] rounded-lg p-6 shadow-sm border border-[var(--border-color)] transition-colors">
            <div className="text-sm text-[var(--text-secondary)] mb-2">{t('dashboard.completedPuzzles')}</div>
            <div className="text-3xl font-bold text-green-600">{completedPuzzles}</div>
          </div>
          <div className="bg-[var(--bg-card)] rounded-lg p-6 shadow-sm border border-[var(--border-color)] transition-colors">
            <div className="text-sm text-[var(--text-secondary)] mb-2">{t('dashboard.juzsExplored')}</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{juzsExplored}</div>
          </div>
          <div className="bg-[var(--bg-card)] rounded-lg p-6 shadow-sm border border-[var(--border-color)] transition-colors">
            <div className="text-sm text-[var(--text-secondary)] mb-2">{t('dashboard.currentStreak')}</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak} {t('dashboard.days')}</div>
          </div>
        </div>

        {/* Juz Selector */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              {t('dashboard.selectJuz')}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {juzs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-[var(--text-muted)]">
                <p>{t('dashboard.noJuzsFound')}</p>
              </div>
            ) : (
              juzs.map((juz) => (
                <Link
                  key={juz._id}
                  href={`/dashboard/juz/${juz.number}`}
                  className="bg-[var(--bg-card)] rounded-lg p-6 shadow-sm border border-[var(--border-color)] hover:border-green-500 hover:shadow-md transition-all group"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                      {juz.number}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mb-3">{juz.name}</div>
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 mb-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${juz.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {juz.completedPuzzles}/{juz._count.puzzles}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

