'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Flame, BookOpen } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

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
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <Link href="/dashboard" className="text-xl font-bold text-green-500">
              AyatBits
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="font-semibold text-sm">{currentStreak}</span>
              </div>
              <Link 
                href="/dashboard/profile" 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"
              >
                <span className="text-white font-semibold text-sm">
                  {userFirstName?.[0] || 'U'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {t('dashboard.welcome', { name: userFirstName || t('dashboard.learner') })}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('dashboard.continueJourney')}
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="text-xs text-gray-500 mb-1">{t('dashboard.completedPuzzles')}</div>
            <div className="text-2xl font-bold text-green-500">{completedPuzzles}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="text-xs text-gray-500 mb-1">{t('dashboard.juzsExplored')}</div>
            <div className="text-2xl font-bold text-blue-500">{juzsExplored}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="text-xs text-gray-500 mb-1">{t('dashboard.currentStreak')}</div>
            <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
          </div>
        </div>

        {/* Juz Selector */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">{t('dashboard.selectJuz')}</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {juzs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p className="text-sm">{t('dashboard.noJuzsFound')}</p>
              </div>
            ) : (
              juzs.map((juz) => (
                <Link
                  key={juz._id}
                  href={`/dashboard/juz/${juz.number}`}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-green-500/50 transition-all group"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1 group-hover:scale-110 transition-transform">
                      {juz.number}
                    </div>
                    <div className="text-xs text-gray-500 mb-2 truncate">{juz.name}</div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-1">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${juz.progress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-600">
                      {juz.completedPuzzles}/{juz._count.puzzles}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
