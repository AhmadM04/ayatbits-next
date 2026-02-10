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
import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage() {
  const user = await requireDashboardAccess();
  const trialDaysLeft = getTrialDaysRemaining(user);

  // OPTIMIZED: Fetch only puzzle IDs instead of full documents
  const completedProgress = await UserProgress.find({ 
    userId: user._id, 
    status: 'COMPLETED' 
  }).select('puzzleId').lean() as any[];

  // Count total puzzles solved
  const puzzlesSolved = completedProgress.length;

  // Get completed puzzle IDs
  const completedPuzzleIds = new Set(
    completedProgress.map((p: any) => p.puzzleId?.toString()).filter(Boolean)
  );

  // OPTIMIZED: Fetch all completed puzzles in ONE query to get surah info
  const completedPuzzles = await Puzzle.find({
    _id: { $in: Array.from(completedPuzzleIds) }
  }).select('_id surahId').lean() as any[];
  
  // Get all unique surahs from completed puzzles
  const uniqueSurahIds = new Set(
    completedPuzzles
      .map((p: any) => p.surahId?.toString())
      .filter(Boolean)
  );

  // OPTIMIZED: Fetch all puzzles for unique surahs in ONE query (not N queries)
  const allSurahPuzzles = await Puzzle.find({ 
    surahId: { $in: Array.from(uniqueSurahIds) } 
  }).select('_id surahId').lean() as any[];

  // Group by surah in memory
  const puzzlesBySurah = allSurahPuzzles.reduce((acc: any, puzzle: any) => {
    const surahId = puzzle.surahId?.toString();
    if (!surahId) return acc;
    if (!acc[surahId]) acc[surahId] = [];
    acc[surahId].push(puzzle);
    return acc;
  }, {});

  // Calculate surahs completed
  let surahsCompleted = 0;
  for (const surahId of uniqueSurahIds) {
    const surahPuzzles = puzzlesBySurah[surahId] || [];
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

  // Check onboarding status
  const onboardingStatus = {
    completed: user.onboardingCompleted || false,
    skipped: user.onboardingSkipped || false,
  };

  // Get user preferences
  const userPreferences = {
    themePreference: user.themePreference || 'dark',
    emailNotifications: user.emailNotifications ?? true,
    inAppNotifications: user.inAppNotifications ?? true,
  };
  
  return (
    <TutorialWrapper
      sectionId="profile_settings"
      steps={profileTutorialSteps}
      delay={800}
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <ProfilePageClient
          userData={userData}
          stats={JSON.parse(JSON.stringify(stats))}
          trialDaysLeft={trialDaysLeft}
          initialTranslation={user.selectedTranslation || 'en.sahih'}
          initialAudioEnabled={user.enableWordByWordAudio || false}
          onboardingStatus={onboardingStatus}
          userPreferences={userPreferences}
        />
      </div>
    </TutorialWrapper>
  );
}
