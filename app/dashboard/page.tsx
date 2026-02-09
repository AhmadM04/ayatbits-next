import { UserProgress, Juz, Puzzle } from '@/lib/db';
import DashboardContent from './DashboardContent';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { requireDashboardAccess } from '@/lib/dashboard-access';

export default async function DashboardPage() {
  const user = await requireDashboardAccess();
  
  // OPTIMIZED: Fetch only puzzle IDs instead of full documents
  const completedProgress = await UserProgress.find({ 
    userId: user._id, 
    status: 'COMPLETED' 
  }).select('puzzleId').lean() as any[];
  
  // Get completed puzzle IDs
  const completedPuzzleIds = new Set(
    completedProgress
      .map((p: any) => p.puzzleId?.toString())
      .filter(Boolean)
  );

  // OPTIMIZED: Fetch all relevant puzzles in ONE query instead of N queries
  const allPuzzles = await Puzzle.find({
    _id: { $in: Array.from(completedPuzzleIds) }
  }).select('_id surahId juzId').lean() as any[];

  // Group puzzles by surah and juz in memory
  const uniqueSurahIds = new Set(
    allPuzzles.map((p: any) => p.surahId?.toString()).filter(Boolean)
  );

  const uniqueJuzIds = new Set(
    allPuzzles.map((p: any) => p.juzId?.toString()).filter(Boolean)
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

  // Calculate stats
  const stats = {
    surahsCompleted,
    totalAyahs: completedPuzzleIds.size, // Total unique puzzles completed
    currentStreak: user.currentStreak || 0,
  };

  const trialDaysLeft = getTrialDaysRemaining(user);

  // OPTIMIZED: Fetch all juzs and all puzzles in TWO queries instead of N+1
  const juzDocs = await Juz.find({}).sort({ number: 1 }).lean();
  const allJuzPuzzles = await Puzzle.find({}).select('_id juzId').lean() as any[];
  
  // Group puzzles by juz in memory
  const puzzlesByJuz = allJuzPuzzles.reduce((acc: any, puzzle: any) => {
    const juzId = puzzle.juzId?.toString();
    if (!juzId) return acc;
    if (!acc[juzId]) acc[juzId] = [];
    acc[juzId].push(puzzle);
    return acc;
  }, {});
  
  // Process juz data in memory (no database queries in loop)
  const juzs = juzDocs.map((j: any) => {
    const juzId = j._id.toString();
    const juzPuzzles = puzzlesByJuz[juzId] || [];
    const totalPuzzles = juzPuzzles.length;
    
    // Count completed puzzles for this juz
    const juzCompletedPuzzles = juzPuzzles.filter((puzzle: any) => 
      completedPuzzleIds.has(puzzle._id.toString())
    ).length;
    
    const progress = totalPuzzles > 0 ? (juzCompletedPuzzles / totalPuzzles) * 100 : 0;
    
    return {
      _id: juzId,
      number: j.number,
      name: j.name,
      _count: { puzzles: totalPuzzles },
      progress: Math.round(progress),
      completedPuzzles: juzCompletedPuzzles,
    };
  });

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
