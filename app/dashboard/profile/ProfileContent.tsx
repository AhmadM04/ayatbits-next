'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, BookOpen, Target, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import TranslationSelectorClient from './TranslationSelectorClient';

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <h1 className="text-lg font-semibold">{t('profile.title')}</h1>
            </div>
            <SignOutButton>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
                <LogOut className="w-5 h-5" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* User Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{userInitial}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{userName}</h2>
              <p className="text-gray-500 text-sm truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Streak */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('profile.currentStreak')}</p>
            <p className="text-2xl font-bold text-orange-500">
              {currentStreak} <span className="text-base font-normal text-gray-500">{t('dashboard.days')}</span>
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {lastActivityDate === 'Never' 
                ? t('profile.never') 
                : t('profile.lastActive', { date: lastActivityDate })}
            </p>
          </div>

          {/* Longest Streak */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('profile.longestStreak')}</p>
            <p className="text-2xl font-bold text-purple-500">
              {longestStreak} <span className="text-base font-normal text-gray-500">{t('dashboard.days')}</span>
            </p>
            <p className="text-xs text-gray-600 mt-2">{t('profile.bestStreak')}</p>
          </div>

          {/* Completed Puzzles */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('profile.completedPuzzles')}</p>
            <p className="text-2xl font-bold text-green-500">{completedPuzzles}</p>
            <div className="mt-2">
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{t('profile.ofAllPuzzles', { percentage: completionPercentage })}</p>
            </div>
          </div>

          {/* Juzs Explored */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-1">{t('profile.juzsExplored')}</p>
            <p className="text-2xl font-bold text-blue-500">{uniqueJuzs}</p>
            <p className="text-xs text-gray-600 mt-2">{t('profile.uniqueSurahs', { count: uniqueSurahs })}</p>
          </div>
        </div>

        {/* Translation Selector */}
        <TranslationSelectorClient initialSelectedTranslation={selectedTranslation} />

        {/* Streak Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">{t('profile.aboutStreaks')}</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>{t('profile.streakDescription1')}</p>
            <p>{t('profile.streakDescription2')}</p>
            <p>{t('profile.streakDescription3')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
