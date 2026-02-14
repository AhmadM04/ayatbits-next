'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import ProfileContent from './ProfileContent';
import TranslationSelector from './TranslationSelector';
import AudioSettings from './AudioSettings';
import BillingSection from './BillingSection';
import UserPreferences from './UserPreferences';
import LanguageSelectorProfile from './LanguageSelectorProfile';

// Dynamically import UserProfile to ensure UI components are loaded
const UserProfile = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserProfile),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-[#E5E7EB] dark:border-white/10 p-8 flex items-center justify-center shadow-sm">
        <div className="flex items-center gap-3 text-[#8E7F71] dark:text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#059669] border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }
);

interface ProfilePageClientProps {
  userData: {
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
  initialTranslation: string;
  initialAudioEnabled: boolean;
  initialLanguage?: string;
  onboardingStatus: {
    completed: boolean;
    skipped: boolean;
  };
  userPreferences?: {
    themePreference?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    inAppNotifications?: boolean;
  };
}

export default function ProfilePageClient({
  userData,
  stats,
  trialDaysLeft,
  initialTranslation,
  initialAudioEnabled,
  initialLanguage,
  onboardingStatus,
  userPreferences,
}: ProfilePageClientProps) {
  const { t } = useI18n();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  // Track theme changes from DOM
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    // Initial check
    updateTheme();

    // Watch for class changes on html element
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Show banner if user skipped onboarding and hasn't completed it
  const showOnboardingBanner = onboardingStatus.skipped && !onboardingStatus.completed;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8E7F71] dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#4A3728] dark:text-white">{t('profile.myProfile')}</h1>
              <p className="text-xs text-[#8E7F71] dark:text-gray-400">{t('tutorial.manageAccount')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-6">
        {/* Onboarding Completion Banner */}
        {showOnboardingBanner && (
          <Link
            href="/onboarding"
            className="block bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all shadow-sm dark:shadow-none"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl border border-emerald-300 dark:border-emerald-500/30 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#4A3728] dark:text-white mb-1">
                  {t('onboarding.completeProfile')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {t('onboarding.completeProfileDescription')}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <span>{t('onboarding.finish')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}
        {/* User Profile & Stats Section */}
        <div className="space-y-6">
          <ProfileContent 
            user={userData}
            stats={stats}
            trialDaysLeft={trialDaysLeft}
          />
        </div>

        {/* User Preferences Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-[#8E7F71] dark:text-gray-500 uppercase tracking-wider">{t('preferences.title')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
          </div>

          <UserPreferences 
            initialTheme={userPreferences?.themePreference || 'dark'}
            initialEmailNotifications={userPreferences?.emailNotifications ?? true}
            initialInAppNotifications={userPreferences?.inAppNotifications ?? true}
          />
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-[#8E7F71] dark:text-gray-500 uppercase tracking-wider">{t('tutorial.settings')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
          </div>

          <LanguageSelectorProfile initialLanguage={initialLanguage as any} />
          <TranslationSelector initialTranslation={initialTranslation} />
          <AudioSettings initialEnabled={initialAudioEnabled} />
        </div>

        {/* Billing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-[#8E7F71] dark:text-gray-500 uppercase tracking-wider">{t('tutorial.billing')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
          </div>

          <BillingSection 
            user={userData}
            stats={stats}
          />
        </div>

        {/* Account Management Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-[#8E7F71] dark:text-gray-500 uppercase tracking-wider">{t('tutorial.account')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
          </div>

          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden" data-tutorial="account-section">
            <UserProfile 
              appearance={{
                variables: {
                  colorPrimary: "#10b981",
                  colorBackground: currentTheme === 'dark' ? "#0a0a0a" : "#ffffff",
                  colorInputBackground: currentTheme === 'dark' ? "#1a1a1a" : "#f9fafb",
                  colorText: currentTheme === 'dark' ? "#ffffff" : "#4A3728",
                  colorTextSecondary: currentTheme === 'dark' ? "#9ca3af" : "#8E7F71",
                  colorInputText: currentTheme === 'dark' ? "#ffffff" : "#4A3728",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full border-none",
                  navbar: "hidden",
                  headerTitle: currentTheme === 'dark' ? "text-white" : "text-[#4A3728]",
                  headerSubtitle: currentTheme === 'dark' ? "text-gray-400" : "text-[#8E7F71]",
                  profileSectionTitleText: currentTheme === 'dark' ? "text-white font-semibold" : "text-[#4A3728] font-semibold",
                  profileSectionTitle: currentTheme === 'dark' ? "text-white" : "text-[#4A3728]",
                  profileSectionContent: currentTheme === 'dark' ? "text-gray-300" : "text-[#4A3728]",
                  formButtonPrimary: "bg-[#059669] hover:bg-emerald-700 text-white transition-colors",
                  formFieldInput: currentTheme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-[#4A3728]",
                  formFieldLabel: currentTheme === 'dark' ? "text-gray-400" : "text-[#4A3728]",
                  identityPreviewText: currentTheme === 'dark' ? "text-white" : "text-[#4A3728]",
                  identityPreviewEditButton: currentTheme === 'dark' ? "text-gray-400 hover:text-white" : "text-[#8E7F71] hover:text-[#4A3728]",
                  userPreviewMainIdentifier: currentTheme === 'dark' ? "text-white" : "text-[#4A3728]",
                  userPreviewSecondaryIdentifier: currentTheme === 'dark' ? "text-gray-400" : "text-[#8E7F71]",
                  accordionTriggerButton: currentTheme === 'dark' ? "text-white hover:bg-white/5" : "text-[#4A3728] hover:bg-gray-50",
                  accordionContent: currentTheme === 'dark' ? "text-gray-300" : "text-[#4A3728]",
                  badge: currentTheme === 'dark' ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-[#059669] border-emerald-200",
                  formFieldSuccessText: currentTheme === 'dark' ? "text-green-400" : "text-green-600",
                  formFieldErrorText: currentTheme === 'dark' ? "text-red-400" : "text-red-600",
                  footerActionLink: "text-green-500 hover:text-green-400",
                  // Hide profile image section
                  avatarBox: "hidden",
                  avatarImage: "hidden",
                  profileSection__profile: "hidden",
                  // Remove modal overlay styling
                  modalBackdrop: "hidden",
                  modalContent: "shadow-none",
                }
              }}
              routing="hash" 
            />
          </div>
        </div>
      </div>
    </>
  );
}

