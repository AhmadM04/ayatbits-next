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

  // Check onboarding status
  const onboardingStatus = {
    completed: user.onboardingCompleted || false,
    skipped: user.onboardingSkipped || false,
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
        />
      </div>
    </TutorialWrapper>
  );
}
