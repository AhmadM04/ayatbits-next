import { UserProgress, Puzzle } from '@/lib/db';
import ProfileContent from './ProfileContent';
import TranslationSelector from './TranslationSelector';
import AudioSettings from './AudioSettings';
import BillingSection from './BillingSection';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TutorialWrapper } from '@/components/tutorial';
import { profileTutorialSteps } from '@/lib/tutorial-configs';

export default async function ProfilePage() {
  const user = await requireDashboardAccess();
  const trialDaysLeft = getTrialDaysRemaining(user);

  // Fetch user stats - get all completed progress
  const completedProgress = await UserProgress.find({ 
    userId: user._id, 
    status: 'COMPLETED' 
  }).populate('puzzleId').lean() as any[];

  // Count total puzzles solved
  const puzzlesSolved = completedProgress.length;

  // Calculate surahs completed
  // Group puzzles by surah and check if all puzzles in each surah are completed
  const completedPuzzleIds = new Set(completedProgress.map((p: any) => p.puzzleId?._id?.toString()).filter(Boolean));
  
  // Get all unique surahs from completed puzzles
  const uniqueSurahIds = new Set(
    completedProgress
      .map((p: any) => p.puzzleId?.surahId?.toString())
      .filter(Boolean)
  );

  // For each surah, check if all its puzzles are completed
  let surahsCompleted = 0;
  for (const surahId of uniqueSurahIds) {
    const surahPuzzles = await Puzzle.find({ surahId }).lean();
    const allCompleted = surahPuzzles.every((puzzle: any) => 
      completedPuzzleIds.has(puzzle._id.toString())
    );
    if (allCompleted && surahPuzzles.length > 0) {
      surahsCompleted++;
    }
  }

  const stats = {
    joinedDate: user.createdAt,
    // fallback to 'trial' if plan is undefined, since 'free' is removed
    planType: user.subscriptionPlan || 'trial', 
    surahsCompleted,
    puzzlesSolved,
  };

  // Prepare user data with subscription info
  const userData = {
    firstName: user.firstName,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
  };
  
  return (
    <TutorialWrapper
      sectionId="profile_settings"
      steps={profileTutorialSteps}
      delay={800}
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white">
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
              <h1 className="text-lg font-semibold">Profile</h1>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-6">
        {/* User Profile & Stats Section */}
        <div className="space-y-6">
          <ProfileContent 
            user={userData}
            stats={JSON.parse(JSON.stringify(stats))}
            trialDaysLeft={trialDaysLeft}
          />
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Settings</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <TranslationSelector initialTranslation={user.selectedTranslation || 'en.sahih'} />
          <AudioSettings initialEnabled={user.enableWordByWordAudio || false} />
        </div>

        {/* Billing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <BillingSection 
            user={userData}
            stats={JSON.parse(JSON.stringify(stats))}
          />
        </div>

        {/* Account Management Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</span>
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
    </div>
    </TutorialWrapper>
  );
}
