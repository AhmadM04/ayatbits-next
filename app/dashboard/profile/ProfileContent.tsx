'use client';

import { Calendar, CheckCircle, BookOpen, Crown } from 'lucide-react';

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
  // Admins don't need to see subscription info
  const showSubscriptionBadge = user.role !== 'admin';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Profile Header */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:col-span-2 transition-colors hover:border-white/20" data-tutorial="profile-stats">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2">
              {user.firstName ? `${user.firstName}'s Profile` : 'My Profile'}
            </h2>
            <p className="text-gray-400 text-sm truncate">
              {user.email}
            </p>
          </div>
          {showSubscriptionBadge && (
            <div className={`px-4 py-2 rounded-xl text-sm font-medium capitalize flex items-center gap-2 transition-colors
              ${stats.planType === 'lifetime' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25' : 
                stats.planType === 'monthly' || stats.planType === 'yearly' ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/25' : 
                'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25'}`}>
              <Crown className="w-4 h-4" />
              {stats.planType === 'trial' 
                ? `${trialDaysLeft} Days Left` 
                : stats.planType}
            </div>
          )}
          {user.role === 'admin' && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors hover:bg-purple-500/25">
              <Crown className="w-4 h-4" />
              Admin
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-sm text-gray-400 font-medium">Surahs Completed</span>
        </div>
        <p className="text-4xl font-bold text-white">{stats.surahsCompleted}</p>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 transition-colors hover:border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-sm text-gray-400 font-medium">Puzzles Solved</span>
        </div>
        <p className="text-4xl font-bold text-white">{stats.puzzlesSolved}</p>
      </div>

    </div>
  );
}
