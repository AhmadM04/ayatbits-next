'use client';

import { useI18n } from '@/lib/i18n';
import { Calendar, CheckCircle, BookOpen, Crown } from 'lucide-react';

interface ProfileContentProps {
  user: any; // Add this prop
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profile Header */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.firstName ? `${user.firstName}'s Profile` : 'My Profile'}
            </h2>
            <p className="text-gray-400 text-sm">
              {user.email}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-medium capitalize flex items-center gap-2
            ${stats.planType === 'lifetime' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
              stats.planType === 'monthly' || stats.planType === 'yearly' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
              'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
            <Crown className="w-4 h-4" />
            {stats.planType === 'trial' 
              ? `${trialDaysLeft} Days Left` 
              : stats.planType}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-gray-400">Surahs Completed</span>
        </div>
        <p className="text-4xl font-bold text-white">{stats.surahsCompleted}</p>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-gray-400">Puzzles Solved</span>
        </div>
        <p className="text-4xl font-bold text-white">{stats.puzzlesSolved}</p>
      </div>
    </div>
  );
}