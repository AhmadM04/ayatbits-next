'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, BookOpen, Target, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import TranslationSelectorClient from './TranslationSelectorClient';
import ThemeToggle from '@/components/ThemeToggle';

interface ProfileContentProps {
  userName: string;
  userEmail: string;
  userInitial: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  completedPuzzles: number;
  completionPercentage: number;
  uniqueJuzs: number;
  uniqueSurahs: number;
  selectedTranslation: string;
}

export default function ProfileContent({
  userName,
  userEmail,
  userInitial,
  currentStreak,
  longestStreak,
  lastActivityDate,
  completedPuzzles,
  completionPercentage,
  uniqueJuzs,
  uniqueSurahs,
  selectedTranslation,
}: ProfileContentProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('profile.title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SignOutButton>
                <button className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <LogOut className="w-5 h-5" />
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 mb-6 transition-colors">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-bold text-3xl">{userInitial}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)]">{userName}</h2>
              <p className="text-[var(--text-secondary)] mt-1">{userEmail}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">{t('profile.currentStreak')}</h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{currentStreak} {t('dashboard.days')}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {lastActivityDate === 'Never' 
                ? t('profile.never') 
                : t('profile.lastActive', { date: lastActivityDate })}
            </p>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">{t('profile.longestStreak')}</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{longestStreak} {t('dashboard.days')}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{t('profile.bestStreak')}</p>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">{t('profile.completedPuzzles')}</h3>
                <p className="text-3xl font-bold text-green-600">{completedPuzzles}</p>
              </div>
            </div>
            <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">{t('profile.ofAllPuzzles', { percentage: completionPercentage })}</p>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">{t('profile.juzsExplored')}</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{uniqueJuzs}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{t('profile.uniqueSurahs', { count: uniqueSurahs })}</p>
          </div>
        </div>

        {/* Translation Selector */}
        <TranslationSelectorClient initialSelectedTranslation={selectedTranslation} />

        {/* Streak Info */}
        <div className="bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] p-6 mt-6 transition-colors">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t('profile.aboutStreaks')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {t('profile.streakDescription1')}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {t('profile.streakDescription2')}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('profile.streakDescription3')}
          </p>
        </div>
      </main>
    </div>
  );
}
