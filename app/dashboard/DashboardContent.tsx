'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Flame, BookOpen, AlertTriangle, HelpCircle, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import BottomNav from '@/components/BottomNav';
import DailyQuote from '@/components/DailyQuote';
import TrialBanner from '@/components/TrialBanner';
import LanguageSelector from '@/components/LanguageSelector';

// OPTIMIZED: Lazy load VerseSearch modal for better initial page load
const VerseSearch = dynamic(() => import('@/components/VerseSearch'), {
  ssr: false,
});
import { SparkleAnimation } from '@/components/animations';
import { TutorialWrapper, useTutorial, TutorialStep } from '@/components/tutorial';
import { dashboardTutorialSteps, languageSelectorTutorialStep } from '@/lib/tutorial-configs';
import { resetTutorial } from '@/lib/tutorial-manager';
import { MushafFAB } from '@/components/mushaf';
import { useI18n } from '@/lib/i18n';

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
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const { startTutorial } = useTutorial();
  const { t } = useI18n();
  
  const showTrialBanner = Boolean(subscriptionStatus === 'trialing' && trialDaysLeft && trialDaysLeft > 0);
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
  
  // Create dynamic tutorial steps based on whether user has a streak
  const tutorialSteps = useMemo<TutorialStep[]>(() => {
    // For users with 0 streak, show trophies button instead of streak button
    if (currentStreak === 0) {
      return [
        dashboardTutorialSteps[0], // welcome-section
        {
          id: 'dashboard-awards',
          target: '[data-tutorial="awards-button"]',
          title: 'tutorial.trackProgress',
          message: 'tutorial.trackProgressAwardsMsg',
          placement: 'bottom',
          offset: { y: 120 }, // Position more toward center of screen
        },
        languageSelectorTutorialStep, // language selector - NEW
        dashboardTutorialSteps[2], // daily-quote
        dashboardTutorialSteps[3], // juz-grid
        dashboardTutorialSteps[4], // bottom-nav
      ];
    }
    // For users with streak > 0, use the original steps
    return dashboardTutorialSteps;
  }, [currentStreak]);
  
  const handleRestartTutorial = () => {
    resetTutorial('dashboard_intro');
    startTutorial('dashboard_intro', tutorialSteps);
    setShowHelpMenu(false);
  };

  return (
    <TutorialWrapper
      sectionId="dashboard_intro"
      steps={tutorialSteps}
      delay={800}
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Trial Banner */}
      {showTrialBanner && <TrialBanner daysLeft={trialDaysLeft!} />}
      
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
                width={180} 
                height={48}
                className="h-9 w-auto"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              {/* Search - Make it more prominent */}
              <div className="min-w-[200px]">
                <VerseSearch />
              </div>
              
              {/* Streak with hover animation - only show if streak > 0 */}
              {currentStreak > 0 && (
                <Link 
                  href="/dashboard/achievements"
                  className="group flex items-center gap-1.5 text-orange-500 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors"
                  data-tutorial="stats-cards"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Flame className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                  </motion.div>
                  <span className="font-semibold text-sm">{currentStreak}</span>
                </Link>
              )}
              
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Help Button */}
              <div className="relative">
                <button
                  onClick={() => setShowHelpMenu(!showHelpMenu)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                  aria-label="Help"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showHelpMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-20"
                        onClick={() => setShowHelpMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-12 bg-gray-900 border border-white/10 rounded-lg shadow-2xl p-2 min-w-[200px] z-30"
                      >
                        <button
                          onClick={handleRestartTutorial}
                          className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-md text-sm transition-colors"
                        >
                          🎓 {t('dashboard.restartTutorial')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={() => setShowSignOutConfirm(true)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              
              <Link 
                href="/dashboard/profile" 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"
              >
                <span className="text-white font-semibold text-sm">
                  {userFirstName?.[0] || 'U'}
                </span>
              </Link>
            </div>

            {/* Mobile Burger Menu */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                aria-label="Menu"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0a0a0a]/98 backdrop-blur-md overflow-hidden"
            >
              <div className="max-w-6xl mx-auto px-4 py-4 space-y-2">
                {/* User Profile Section */}
                <div className="mb-2">
                  <Link 
                    href="/dashboard/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors border border-white/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-base">
                        {userFirstName?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{userFirstName || 'User'}</div>
                      <div className="text-xs text-gray-400">View Profile</div>
                    </div>
                    <div className="text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>

                {/* Stats Section */}
                {currentStreak > 0 && (
                  <Link 
                    href="/dashboard/achievements"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/30 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">Current Streak</div>
                      <div className="text-sm font-semibold text-white">{currentStreak} days 🔥</div>
                    </div>
                  </Link>
                )}

                {/* Divider */}
                <div className="h-px bg-white/5 my-3" />

                {/* Quick Access Section */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 px-1 mb-2">Quick Access</div>
                  
                  {/* Search Button */}
                  <div className="w-full">
                    <VerseSearch />
                  </div>

                  {/* Language Selector */}
                  <div className="w-full">
                    <LanguageSelector />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/5 my-3" />

                {/* Settings Section */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 px-1 mb-2">Settings</div>
                  
                  {/* Help */}
                  <button
                    onClick={() => {
                      handleRestartTutorial();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <HelpCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm text-white font-medium">🎓 {t('dashboard.restartTutorial')}</span>
                  </button>

                  {/* Logout */}
                  <button 
                    onClick={() => {
                      setShowSignOutConfirm(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl transition-colors text-left group border border-white/5 hover:border-red-500/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-sm text-white font-medium">{t('common.signOut')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6" data-tutorial="welcome-section">
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
        <div className="mb-6" data-tutorial="daily-quote">
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
            <h2 className="text-lg font-semibold">{t('dashboard.selectJuz')}</h2>
          </motion.div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3" data-tutorial="juz-grid">
            {juzs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p className="text-sm">{t('dashboard.noJuzsFound')}</p>
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

      {/* Mushaf FAB - Opens Mushaf from the beginning */}
      <MushafFAB />

      <BottomNav />
    </div>

    {/* Sign Out Confirmation Dialog - Positioned outside main container for proper centering */}
    {showSignOutConfirm && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] animate-in fade-in">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl w-[90%] max-w-md p-6 animate-in zoom-in-95 mx-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {t('settings.signOutTitle')}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {t('settings.signOutMessage')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSignOutConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <SignOutButton>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white font-medium transition-colors">
                {t('common.signOut')}
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    )}
    </TutorialWrapper>
  );
}
