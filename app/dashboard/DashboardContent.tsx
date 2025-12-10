'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Flame, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import DailyQuote from '@/components/DailyQuote';
import TrialBanner from '@/components/TrialBanner';
import VerseSearch from '@/components/VerseSearch';

interface DashboardContentProps {
  userFirstName: string | null | undefined;
  currentStreak: number;
  completedPuzzles: number;
  juzsExplored: number;
  selectedTranslation: string;
  trialDaysLeft?: number;
  subscriptionStatus?: string;
  juzs: Array<{
    _id: string;
    number: number;
    name: string;
    _count: { puzzles: number };
    progress: number;
    completedPuzzles: number;
  }>;
  stats: {
    surahsCompleted: number;
    totalAyahs: number;
    currentStreak: number;
  };
}

export default function DashboardContent({
  userFirstName,
  currentStreak,
  completedPuzzles,
  juzsExplored,
  selectedTranslation,
  trialDaysLeft,
  subscriptionStatus,
  juzs,
}: DashboardContentProps) {
  const { t } = useI18n();
  const showTrialBanner = subscriptionStatus === 'trialing' && trialDaysLeft && trialDaysLeft > 0;
  const needsSubscription = !subscriptionStatus || subscriptionStatus === 'inactive' || subscriptionStatus === 'INACTIVE';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Trial Banner */}
      {showTrialBanner && <TrialBanner daysLeft={trialDaysLeft} />}
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <Link href="/dashboard" className="text-xl font-bold text-green-500">
              AyatBits
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <VerseSearch />
              
              {/* Streak with hover animation */}
              <Link 
                href="/dashboard/achievements"
                className="group flex items-center gap-1.5 text-orange-500 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <Flame className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                </motion.div>
                <span className="font-semibold text-sm">{Number.isNaN(currentStreak) ? 0 : (currentStreak ?? 0)}</span>
              </Link>
              
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

        {/* Subscription Required Banner */}
        {needsSubscription && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-400 mb-2">
              Start your 7-day free trial to access all puzzles and features.
            </p>
            <Link
              href="/pricing?reason=needs_subscription"
              className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        )}

        {/* Daily Quote */}
        <div className="mb-6">
          <DailyQuote translationEdition={selectedTranslation} />
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
                        style={{ width: `${isNaN(juz.progress) ? 0 : Math.max(0, Math.min(100, juz.progress))}%` }}
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
