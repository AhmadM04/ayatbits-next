'use client';

import { Calendar, CheckCircle, BookOpen, Crown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ProfileContentProps {
  user: {
    firstName?: string;
    email?: string;
    role?: 'admin' | 'user';
    subscriptionStatus?: string;
    subscriptionEndDate?: string;
  };
  stats: {
    joinedDate: string;
    planType: string;
    surahsCompleted: number;
    puzzlesSolved: number;
  };
  trialDaysLeft: number;
}

export default function ProfileContent({ user, stats, trialDaysLeft }: ProfileContentProps) {
  const { t } = useI18n();
  // Admins don't need to see subscription info
  const showSubscriptionBadge = user.role !== 'admin';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm rounded-2xl p-6 md:col-span-2 transition-colors hover:border-gray-300 dark:hover:border-white/20" data-tutorial="profile-stats">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-[#4A3728] dark:text-white mb-2">
              {user.firstName ? t('profile.userProfile', { name: user.firstName }) : t('profile.myProfile')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
              {user.email}
            </p>
          </div>
          {showSubscriptionBadge && (
            <div className={`px-4 py-2 rounded-xl text-sm font-medium capitalize flex items-center gap-2 transition-colors
              ${stats.planType === 'lifetime' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-900/30' : 
                stats.planType === 'monthly' || stats.planType === 'yearly' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' : 
                'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-900/30'}`}>
              <Crown className="w-4 h-4" />
              {stats.planType === 'trial' 
                ? t('profile.daysLeft', { days: trialDaysLeft })
                : t(`profile.${stats.planType}` as any)}
            </div>
          )}
          {user.role === 'admin' && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30">
              <Crown className="w-4 h-4" />
              {t('profile.admin')}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/30">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('profile.surahsCompleted')}</span>
        </div>
        <p className="text-4xl font-bold text-[#4A3728] dark:text-white">{stats.surahsCompleted}</p>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm rounded-2xl p-6 transition-colors hover:border-gray-300 dark:hover:border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('profile.puzzlesSolved')}</span>
        </div>
        <p className="text-4xl font-bold text-[#4A3728] dark:text-white">{stats.puzzlesSolved}</p>
      </div>

    </div>
  );
}
