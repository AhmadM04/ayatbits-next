import { UserProgress, Juz } from '@/lib/db';
import DashboardContent from './DashboardContent';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';

export default async function DashboardPage() {
  const user = await requireDashboardAccess();
  
  // Fetch progress
  const progress = await UserProgress.find({ userId: user._id });
  
  // Calculate stats
  const stats = {
    surahsCompleted: progress.filter(p => p.progress === 100).length,
    totalAyahs: progress.reduce((acc, curr) => acc + (curr.completedAyahs?.length || 0), 0),
    currentStreak: 0, // Implement streak logic if needed
  };

  const trialDaysLeft = getTrialDaysRemaining(user);

  // Fetch juzs data
  const juzDocs = await Juz.find({}).sort({ number: 1 }).lean();
  const juzs = juzDocs.map((j: any) => ({
    _id: j._id.toString(),
    number: j.number,
    name: j.name,
    _count: { puzzles: 0 },
    progress: 0,
    completedPuzzles: 0,
  }));

  const translationCode = user.selectedTranslation || 'en.sahih';

  return (
    <DashboardContent 
      userFirstName={user.firstName?.split(' ')[0] || null}
      currentStreak={stats.currentStreak}
      completedPuzzles={stats.surahsCompleted}
      juzsExplored={new Set(progress.map(p => p.juzNumber)).size}
      selectedTranslation={translationCode}
      trialDaysLeft={trialDaysLeft}
      subscriptionStatus={user.subscriptionStatus}
      subscriptionEndDate={user.subscriptionEndDate?.toISOString()}
      juzs={juzs}
      stats={stats}
    />
  );
}
