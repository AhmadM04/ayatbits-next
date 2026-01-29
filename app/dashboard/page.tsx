import { UserProgress, Juz, Puzzle } from '@/lib/db';
import DashboardContent from './DashboardContent';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';

export default async function DashboardPage() {
  const user = await requireDashboardAccess();
  
  // Fetch all completed progress with populated puzzle data
  const completedProgress = await UserProgress.find({ 
    userId: user._id, 
    status: 'COMPLETED' 
  }).populate('puzzleId').lean() as any[];
  
  // Get completed puzzle IDs
  const completedPuzzleIds = new Set(
    completedProgress
      .map((p: any) => p.puzzleId?._id?.toString())
      .filter(Boolean)
  );

  // Calculate surahs completed
  // Group puzzles by surah and check if all puzzles in each surah are completed
  const uniqueSurahIds = new Set(
    completedProgress
      .map((p: any) => p.puzzleId?.surahId?.toString())
      .filter(Boolean)
  );

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

  // Calculate stats
  const stats = {
    surahsCompleted,
    totalAyahs: completedPuzzleIds.size, // Total unique puzzles completed
    currentStreak: user.currentStreak || 0,
  };

  const trialDaysLeft = getTrialDaysRemaining(user);

  // Get unique juz IDs that user has interacted with
  const uniqueJuzIds = new Set(
    completedProgress
      .filter((p: any) => p.puzzleId && p.puzzleId.juzId)
      .map((p: any) => p.puzzleId.juzId.toString())
  );

  // Fetch all juzs and calculate their progress
  const juzDocs = await Juz.find({}).sort({ number: 1 }).lean();
  
  const juzs = await Promise.all(
    juzDocs.map(async (j: any) => {
      // Get all puzzles for this juz
      const juzPuzzles = await Puzzle.find({ juzId: j._id }).lean();
      const totalPuzzles = juzPuzzles.length;
      
      // Count completed puzzles for this juz
      const juzCompletedPuzzles = juzPuzzles.filter((puzzle: any) => 
        completedPuzzleIds.has(puzzle._id.toString())
      ).length;
      
      const progress = totalPuzzles > 0 ? (juzCompletedPuzzles / totalPuzzles) * 100 : 0;
      
      return {
        _id: j._id.toString(),
        number: j.number,
        name: j.name,
        _count: { puzzles: totalPuzzles },
        progress: Math.round(progress),
        completedPuzzles: juzCompletedPuzzles,
      };
    })
  );

  const translationCode = user.selectedTranslation || 'en.sahih';

  return (
    <DashboardContent 
      userFirstName={user.firstName?.split(' ')[0] || null}
      currentStreak={stats.currentStreak}
      completedPuzzles={stats.surahsCompleted}
      juzsExplored={uniqueJuzIds.size}
      selectedTranslation={translationCode}
      trialDaysLeft={trialDaysLeft}
      subscriptionStatus={user.subscriptionStatus}
      subscriptionEndDate={user.subscriptionEndDate?.toISOString()}
      juzs={juzs}
      stats={stats}
    />
  );
}
