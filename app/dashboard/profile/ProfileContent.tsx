'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, BookOpen, Target, LogOut, CreditCard, Settings, ChevronRight, HelpCircle, FileText, MessageCircleQuestion, X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import TranslationSelectorClient from './TranslationSelectorClient';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';

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
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  trialDaysLeft?: number;
  hasBypass?: boolean;
  hasStripeCustomer?: boolean;
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
  subscriptionStatus,
  subscriptionPlan,
  trialDaysLeft,
  hasBypass,
  hasStripeCustomer,
}: ProfileContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [loadingClearData, setLoadingClearData] = useState(false);
  const [clearDataError, setClearDataError] = useState('');

  const handleClearData = async () => {
    setLoadingClearData(true);
    setClearDataError('');
    try {
      const response = await fetch('/api/user/clear-data', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setShowClearDataModal(false);
        router.refresh();
      } else {
        setClearDataError(data.error || 'Failed to clear data');
      }
    } catch (error) {
      console.error('Clear data error:', error);
      setClearDataError('Failed to clear data. Please try again.');
    } finally {
      setLoadingClearData(false);
    }
  };

  const handleManageBilling = async () => {
    setLoadingBilling(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Could not open billing portal');
        setLoadingBilling(false);
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Failed to open billing portal');
      setLoadingBilling(false);
    }
  };

  const getSubscriptionLabel = () => {
    if (hasBypass) return t('settings.lifetimeAccess');
    if (subscriptionStatus === 'active') return subscriptionPlan === 'yearly' ? t('settings.proYearly') : t('settings.proMonthly');
    if (subscriptionStatus === 'trialing') return t('settings.trial', { days: trialDaysLeft || 0 });
    if (subscriptionStatus === 'canceled') return t('settings.canceled');
    return t('settings.inactive');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <h1 className="text-lg font-semibold">{t('profile.title')}</h1>
            </div>
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

        {/* Settings & Billing */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">{t('settings.title')}</h3>
          </div>
          
          {/* Subscription Status */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasBypass || subscriptionStatus === 'active' 
                  ? 'bg-green-500/20' 
                  : subscriptionStatus === 'trialing' 
                    ? 'bg-blue-500/20' 
                    : 'bg-gray-500/20'
              }`}>
                <CreditCard className={`w-5 h-5 ${
                  hasBypass || subscriptionStatus === 'active' 
                    ? 'text-green-500' 
                    : subscriptionStatus === 'trialing' 
                      ? 'text-blue-500' 
                      : 'text-gray-500'
                }`} />
              </div>
              <div>
                <p className="font-medium">{t('settings.subscription')}</p>
                <p className={`text-xs ${
                  hasBypass || subscriptionStatus === 'active' 
                    ? 'text-green-500' 
                    : subscriptionStatus === 'trialing' 
                      ? 'text-blue-500' 
                      : 'text-gray-500'
                }`}>{getSubscriptionLabel()}</p>
              </div>
            </div>
          </div>

          {/* Manage Billing - only show if they have Stripe customer */}
          {hasStripeCustomer && !hasBypass && (
            <button
              onClick={handleManageBilling}
              disabled={loadingBilling}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{loadingBilling ? t('common.loading') : t('settings.manageBilling')}</p>
                  <p className="text-xs text-gray-500">{t('settings.manageBillingDesc')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Upgrade button for trial users */}
          {subscriptionStatus === 'trialing' && (
            <Link
              href="/pricing"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t('settings.viewPlans')}</p>
                  <p className="text-xs text-gray-500">{t('settings.viewPlansDesc')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Link>
          )}

          <button
            onClick={() => window.open('https://accounts.clerk.dev/user', '_blank')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">{t('settings.accountSettings')}</p>
                <p className="text-xs text-gray-500">{t('settings.accountSettingsDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <Link
            href="mailto:support@ayatbits.com"
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">{t('settings.helpSupport')}</p>
                <p className="text-xs text-gray-500">{t('settings.helpSupportDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Link>

          <Link
            href="/faq"
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="font-medium">{t('settings.faq')}</p>
                <p className="text-xs text-gray-500">{t('settings.faqDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Link>

          <Link
            href="/terms"
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium">{t('settings.termsOfService')}</p>
                <p className="text-xs text-gray-500">{t('settings.termsOfServiceDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Link>

          {/* Clear Data */}
          <button
            onClick={() => setShowClearDataModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-500">{t('settings.clearData')}</p>
                <p className="text-xs text-gray-500">{t('settings.clearDataDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-500/50" />
          </button>
        </div>

        {/* Streak Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">{t('profile.aboutStreaks')}</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>{t('profile.streakDescription1')}</p>
            <p>{t('profile.streakDescription2')}</p>
            <p>{t('profile.streakDescription3')}</p>
          </div>
        </div>

        {/* Sign Out */}
        <button 
          onClick={() => setShowSignOutModal(true)}
          className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-medium py-3 px-4 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </main>

      <BottomNav />

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowSignOutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('settings.signOutTitle')}</h3>
                <p className="text-gray-400 text-sm mb-6">
                  {t('settings.signOutMessage')}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignOutModal(false)}
                    className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <SignOutButton>
                    <button className="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors">
                      {t('common.signOut')}
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation Modal */}
      <AnimatePresence>
        {showClearDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => !loadingClearData && setShowClearDataModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('settings.clearDataTitle')}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {t('settings.clearDataMessage')}
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6">
                  <p className="text-yellow-500 text-xs">
                    {t('settings.clearDataWarning')}
                  </p>
                </div>
                
                {clearDataError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                    <p className="text-red-500 text-xs">{clearDataError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearDataModal(false)}
                    disabled={loadingClearData}
                    className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleClearData}
                    disabled={loadingClearData}
                    className="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingClearData ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        {t('settings.clearDataConfirm')}
                      </>
                    )}
                  </button>
                </div>

                {/* Clerk option */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">{t('settings.clearDataClerkInfo')}</p>
                  <button
                    onClick={() => window.open('https://accounts.clerk.dev/user', '_blank')}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    {t('settings.manageViaClerk')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
