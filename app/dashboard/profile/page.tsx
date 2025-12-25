import { UserProgress, Puzzle } from '@/lib/db';
import ProfileContent from './ProfileContent';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { UserProfile } from '@clerk/nextjs';

export default async function ProfilePage() {
  const user = await requireDashboardAccess();
  const trialDaysLeft = getTrialDaysRemaining(user);

  // Fetch user stats
  const progress = await UserProgress.find({ userId: user._id });
  
  // Calculate completed puzzles safely
  const completedPuzzleIds = progress.flatMap(p => p.completedPuzzles || []);
  const completedPuzzles = completedPuzzleIds.length > 0 
    ? await Puzzle.countDocuments({ _id: { $in: completedPuzzleIds } })
    : 0;

  const stats = {
    joinedDate: user.createdAt,
    // fallback to 'trial' if plan is undefined, since 'free' is removed
    planType: user.subscriptionPlan || 'trial', 
    surahsCompleted: progress.filter(p => p.progress === 100).length,
    puzzlesSolved: completedPuzzles,
  };

  return (
    <div className="space-y-8">
      {/* Custom AyatBits Profile Stats */}
      <ProfileContent 
        user={JSON.parse(JSON.stringify(user))}
        stats={JSON.parse(JSON.stringify(stats))}
        trialDaysLeft={trialDaysLeft}
      />

      {/* Clerk Account Management */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
        <div className="flex justify-center bg-[#111] p-6 rounded-2xl border border-white/10">
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none w-full",
                navbar: "hidden",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-400",
                profileSectionTitleText: "text-white",
                userPreviewMainIdentifier: "text-white",
                userPreviewSecondaryIdentifier: "text-gray-400",
                // Hide profile image section
                avatarBox: "hidden",
                avatarImage: "hidden",
                profileSection__profile: "hidden",
              }
            }}
            routing="hash" 
          />
        </div>
      </div>
    </div>
  );
}
