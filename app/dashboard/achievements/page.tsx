'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

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

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.completedPuzzles}</div>
                  <div className="text-xs text-gray-500">Puzzles</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{stats.longestStreak}</div>
                  <div className="text-xs text-gray-500">Best Streak</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">{stats.totalUnlocked}</div>
                  <div className="text-xs text-gray-500">Trophies</div>
                </div>
              </div>
            )}

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Unlocked ({unlockedAchievements.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {unlockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4"
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="font-semibold text-white text-sm mb-1">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {achievement.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  In Progress ({lockedAchievements.length})
                </h2>
                <div className="space-y-3">
                  {lockedAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl opacity-50 grayscale">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm mb-1">
                            {achievement.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {achievement.description}
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 mb-1">
                            <div
                              className="bg-green-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${achievement.progress}%` }}
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
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

