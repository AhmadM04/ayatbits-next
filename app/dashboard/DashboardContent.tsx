'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Flame, BookOpen, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import DailyQuote from '@/components/DailyQuote';
import TrialBanner from '@/components/TrialBanner';
import VerseSearch from '@/components/VerseSearch';
import { SparkleAnimation } from '@/components/animations';

interface DashboardContentProps {
  userFirstName: string | null | undefined;
  currentStreak: number;
  completedPuzzles: number;
  juzsExplored: number;
  selectedTranslation: string;
  trialDaysLeft?: number;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
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
  subscriptionEndDate,
  juzs,
}: DashboardContentProps) {
  const showTrialBanner = subscriptionStatus === 'trialing' && trialDaysLeft && trialDaysLeft > 0;
  const needsSubscription = !subscriptionStatus || subscriptionStatus === 'inactive' || subscriptionStatus === 'INACTIVE';
  
  // Calculate subscription days left if applicable
  let subscriptionDaysLeft: number | null = null;
  if (subscriptionEndDate && (subscriptionStatus === 'active' || subscriptionStatus === 'ACTIVE')) {
    const endDate = new Date(subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    subscriptionDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  const showSubscriptionWarning = subscriptionDaysLeft !== null && subscriptionDaysLeft > 0 && subscriptionDaysLeft <= 7;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Trial Banner */}
      {showTrialBanner && <TrialBanner daysLeft={trialDaysLeft} />}
      
      {/* Subscription Expiry Warning */}
      {showSubscriptionWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full px-4 py-2 flex items-center justify-center gap-3 text-sm bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-orange-500/20"
        >
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-white">
            Your subscription expires in <span className="font-semibold">{subscriptionDaysLeft === 1 ? '1 day' : `${subscriptionDaysLeft} days`}</span>
          </span>
          <Link 
            href="/pricing"
            className="inline-flex items-center gap-1 font-medium hover:underline text-orange-400"
          >
            Renew now
          </Link>
        </motion.div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <Image 
                src="/ayatbits-logo.svg" 
                alt="AyatBits" 
                width={150} 
                height={40}
                className="h-7 w-auto"
              />
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
            Welcome back, {userFirstName || 'Learner'}!
          </h1>
          <p className="text-gray-500 text-sm">
            Continue your Quranic journey
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
          <motion.div 
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <BookOpen className="w-5 h-5 text-green-500" />
            </motion.div>
            <h2 className="text-lg font-semibold">Select a Juz</h2>
          </motion.div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {juzs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p className="text-sm">No Juz available</p>
              </div>
            ) : (
              juzs.map((juz, index) => (
                <motion.div
                  key={juz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Link
                    href={`/dashboard/juz/${juz.number}`}
                    className="relative block bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-green-500/50 transition-all group overflow-hidden"
                  >
                    {/* Completion badge with sparkle animation */}
                    {juz.progress >= 100 && (
                      <motion.div 
                        className="absolute -top-1 -right-1 z-10"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10 }}
                      >
                        <SparkleAnimation size={35} loop={true} />
                      </motion.div>
                    )}
                    
                    <div className="text-center relative z-0">
                      <motion.div 
                        className="text-2xl font-bold text-green-500 mb-1"
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {juz.number}
                      </motion.div>
                      <div className="text-xs text-gray-500 mb-2 truncate">{juz.name}</div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 mb-1 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-green-600 to-emerald-500 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${isNaN(juz.progress) ? 0 : Math.max(0, Math.min(100, juz.progress))}%` }}
                          transition={{ duration: 0.8, delay: index * 0.03 + 0.2, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-600">
                        {juz.completedPuzzles}/{juz._count.puzzles}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
