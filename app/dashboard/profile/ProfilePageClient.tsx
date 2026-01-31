'use client';

import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import ProfileContent from './ProfileContent';
import TranslationSelector from './TranslationSelector';
import AudioSettings from './AudioSettings';
import BillingSection from './BillingSection';

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
  onboardingStatus: {
    completed: boolean;
    skipped: boolean;
  };
}

export default function ProfilePageClient({
  userData,
  stats,
  trialDaysLeft,
  initialTranslation,
  initialAudioEnabled,
  onboardingStatus,
}: ProfilePageClientProps) {
  const { t } = useI18n();

  // Show banner if user skipped onboarding and hasn't completed it
  const showOnboardingBanner = onboardingStatus.skipped && !onboardingStatus.completed;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{t('profile.myProfile')}</h1>
              <p className="text-xs text-gray-500">{t('tutorial.manageAccount')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-6">
        {/* Onboarding Completion Banner */}
        {showOnboardingBanner && (
          <Link
            href="/onboarding"
            className="block bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {t('onboarding.completeProfile')}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {t('onboarding.completeProfileDescription')}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-green-400">
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

        {/* Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tutorial.settings')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <TranslationSelector initialTranslation={initialTranslation} />
          <AudioSettings initialEnabled={initialAudioEnabled} />
        </div>

        {/* Billing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tutorial.billing')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <BillingSection 
            user={userData}
            stats={stats}
          />
        </div>

        {/* Account Management Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tutorial.account')}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden" data-tutorial="account-section">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full border-none",
                  navbar: "hidden",
                  headerTitle: "text-white",
                  headerSubtitle: "text-gray-400",
                  profileSectionTitleText: "text-white font-semibold",
                  profileSectionTitle: "text-white",
                  profileSectionContent: "text-gray-300",
                  formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white transition-colors",
                  formFieldInput: "bg-white/5 border-white/10 text-white",
                  formFieldLabel: "text-gray-300",
                  identityPreviewText: "text-gray-300",
                  identityPreviewEditButton: "text-gray-400 hover:text-white",
                  userPreviewMainIdentifier: "text-white",
                  userPreviewSecondaryIdentifier: "text-gray-400",
                  accordionTriggerButton: "text-white hover:bg-white/5",
                  accordionContent: "text-gray-300",
                  badge: "bg-green-600/20 text-green-400 border-green-600/30",
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

