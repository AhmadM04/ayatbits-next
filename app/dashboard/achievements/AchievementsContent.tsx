'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { QuranLoader, TrophyAnimation } from '@/components/animations';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: string;
  currentProgress: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface Stats {
  totalUnlocked: number;
  totalAchievements: number;
  completedPuzzles: number;
  currentStreak: number;
  longestStreak: number;
  likedAyahs: number;
  completedJuz: number;
}

export default function AchievementsContent() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/user/achievements')
      .then(res => res.json())
      .then(data => {
        setAchievements(data.achievements || []);
        setStats(data.stats || null);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  // Show loading during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3">
              <div className="w-9 h-9 bg-gray-800 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Achievements</h1>
              <p className="text-xs text-gray-500">
                {stats?.totalUnlocked || 0} of {stats?.totalAchievements || 0} unlocked
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <QuranLoader size={120} />
            </motion.div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <motion.div 
                className="grid grid-cols-3 gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-green-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                  >
                    {stats.completedPuzzles}
                  </motion.div>
                  <div className="text-xs text-gray-500">Puzzles</div>
                </motion.div>
                <motion.div 
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(249, 115, 22, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-orange-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    {stats.longestStreak}
                  </motion.div>
                  <div className="text-xs text-gray-500">Best Streak</div>
                </motion.div>
                <motion.div 
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {stats.totalUnlocked > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2 opacity-20"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <TrophyAnimation size={60} loop={false} />
                    </motion.div>
                  )}
                  <motion.div 
                    className="text-2xl font-bold text-purple-500 relative z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    {stats.totalUnlocked}
                  </motion.div>
                  <div className="text-xs text-gray-500 relative z-10">Trophies</div>
                </motion.div>
              </motion.div>
            )}

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </motion.div>
                  Unlocked ({unlockedAchievements.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {unlockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ 
                        delay: 0.3 + index * 0.1,
                        type: 'spring',
                        damping: 15
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="relative bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-4 overflow-hidden"
                    >
                      {/* Shine effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      <motion.div 
                        className="text-3xl mb-2"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                      >
                        {achievement.icon}
                      </motion.div>
                      <div className="font-semibold text-white text-sm mb-1">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {achievement.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  In Progress ({lockedAchievements.length})
                </h2>
                <div className="space-y-3">
                  {lockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ x: 5 }}
                      className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <motion.div 
                          className="text-2xl opacity-50 grayscale"
                          whileHover={{ scale: 1.2, opacity: 0.7 }}
                        >
                          {achievement.icon}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm mb-1">
                            {achievement.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {achievement.description}
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 mb-1 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-green-600 to-emerald-500 h-1.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${achievement.progress}%` }}
                              transition={{ duration: 0.8, delay: 0.6 + index * 0.05 }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">
                            {achievement.currentProgress} / {achievement.requirement}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}







