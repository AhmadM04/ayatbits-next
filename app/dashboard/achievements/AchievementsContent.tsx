'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { TutorialWrapper } from '@/components/tutorial';
import { achievementsTutorialSteps } from '@/lib/tutorial-configs';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();
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
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#4A3728] pb-20">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <TutorialWrapper sectionId="achievements_trophies" steps={achievementsTutorialSteps} delay={800}>
      <div className="min-h-screen bg-[#F8F9FA] text-[#4A3728] pb-20">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center h-14 gap-3" data-tutorial="achievements-header">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#8E7F71]" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-[#4A3728]">{t('achievements.title')}</h1>
                <p className="text-xs text-[#8E7F71]">
                  {t('achievements.unlockedOf', { unlocked: stats?.totalUnlocked || 0, total: stats?.totalAchievements || 0 })}
                </p>
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <>
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-8" data-tutorial="stats-overview">
              <motion.div 
                className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.02, borderColor: 'rgba(5, 150, 105, 0.5)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl font-bold text-[#059669]">
                  {stats.completedPuzzles}
                </div>
                <div className="text-xs text-[#8E7F71]">{t('achievements.puzzles')}</div>
              </motion.div>
              <motion.div 
                className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.02, borderColor: 'rgba(249, 115, 22, 0.5)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl font-bold text-orange-500">
                  {stats.longestStreak}
                </div>
                <div className="text-xs text-[#8E7F71]">{t('achievements.bestStreak')}</div>
              </motion.div>
              <motion.div 
                className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 text-center"
                whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl font-bold text-blue-500">
                  {stats.totalUnlocked}
                </div>
                <div className="text-xs text-[#8E7F71]">{t('achievements.trophies')}</div>
              </motion.div>
            </div>
          )}

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8" data-tutorial="unlocked-section">
              <h2 className="text-sm font-semibold text-[#8E7F71] mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-[#059669]" />
                {t('achievements.unlocked', { count: unlockedAchievements.length })}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.3
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 border border-[#059669]/30 shadow-sm rounded-2xl p-4"
                  >
                    <div className="text-3xl mb-2">
                      {achievement.icon}
                    </div>
                    <div className="font-semibold text-[#4A3728] text-sm mb-1">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-[#8E7F71]">
                      {achievement.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div data-tutorial="progress-section">
              <h2 className="text-sm font-semibold text-[#8E7F71] mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t('achievements.inProgress', { count: lockedAchievements.length })}
              </h2>
              <div className="space-y-3">
                {lockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-white border border-gray-100 shadow-sm hover:border-gray-200 rounded-2xl p-4 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl opacity-40 grayscale sepia">
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#4A3728] text-sm mb-1">
                          {achievement.name}
                        </div>
                        <div className="text-xs text-[#8E7F71] mb-2">
                          {achievement.description}
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-[#059669] to-emerald-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.03 }}
                          />
                        </div>
                        <div className="text-xs text-[#8E7F71]">
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
      </main>

      <BottomNav />
      </div>
    </TutorialWrapper>
  );
}
