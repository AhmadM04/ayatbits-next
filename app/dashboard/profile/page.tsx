import { UserProgress, Puzzle } from '@/lib/db';
import ProfileContent from './ProfileContent';
import TranslationSelector from './TranslationSelector';
import BillingSection from './BillingSection';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

  // Prepare user data with subscription info
  const userData = {
    firstName: user.firstName,
    email: user.email,
    isAdmin: user.isAdmin,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
  };

  return (
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

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Custom AyatBits Profile Stats */}
        <ProfileContent 
          user={userData}
          stats={JSON.parse(JSON.stringify(stats))}
          trialDaysLeft={trialDaysLeft}
        />

        {/* Translation Selector */}
        <TranslationSelector initialTranslation={user.selectedTranslation || 'en.sahih'} />

        {/* Billing Section */}
        <BillingSection 
          user={userData}
          stats={JSON.parse(JSON.stringify(stats))}
        />

        {/* Clerk Account Management */}
        <div>
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
    </div>
  );
}
