import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Juz, UserProgress, User, Puzzle } from '@/lib/db';
import DashboardContent from './DashboardContent';
import { getTrialDaysRemaining } from '@/lib/subscription';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Parallelize DB connection and user lookup
  const [dbConnection, dbUser] = await Promise.all([
    connectDB().catch(() => null), // Don't block if DB fails
    User.findOne({ clerkId: user.id }).lean() as Promise<any>,
  ]);
  
  if (!dbUser) {
    // User should exist from layout, but handle edge case
    redirect('/pricing?trial=true');
  }

  // Optimized: Get Juzs with puzzle counts using aggregation (single query instead of 30+)
  const juzsWithCounts = await Juz.aggregate([
    { $sort: { number: 1 } },
    {
      $lookup: {
        from: 'puzzles',
        localField: '_id',
        foreignField: 'juzId',
        as: 'puzzles',
      },
    },
    {
      $project: {
        _id: 1,
        number: 1,
        name: 1,
        nameTransliterated: 1,
        nameTranslated: 1,
        createdAt: 1,
        updatedAt: 1,
        _count: { puzzles: { $size: '$puzzles' } },
      },
    },
  ]);

  // Optimized: Get user progress with minimal data (no populate needed)
  const userProgress = await UserProgress.find({
    userId: dbUser._id,
    status: 'COMPLETED',
  })
    .select('puzzleId')
    .lean();
  
  // Get puzzle IDs for lookup
  const puzzleIds = userProgress.map((p: any) => p.puzzleId);
  
  // Get puzzle details in one query
  const puzzles = await Puzzle.find({
    _id: { $in: puzzleIds },
  })
    .select('juzId surahId')
    .lean();
  
  // Create lookup map
  const puzzleMap = new Map(puzzles.map((p: any) => [p._id.toString(), p]));

  // Calculate juzs explored and progress efficiently
  const juzProgressMap = new Map<string, number>();
  userProgress.forEach((p: any) => {
    const puzzle = puzzleMap.get(p.puzzleId?.toString());
    if (puzzle?.juzId) {
      const juzId = puzzle.juzId.toString();
      juzProgressMap.set(juzId, (juzProgressMap.get(juzId) || 0) + 1);
    }
  });
  
  const juzsExplored = juzProgressMap.size;
  
  const serializedJuzs = juzsWithCounts.map((juz: any) => {
    const juzId = juz._id.toString();
    const completedPuzzles = juzProgressMap.get(juzId) || 0;
    const totalPuzzles = juz._count?.puzzles || 0;
    const progress = totalPuzzles > 0 ? (completedPuzzles / totalPuzzles) * 100 : 0;

    return {
      _id: juzId,
      number: juz.number,
      name: juz.name,
      _count: { puzzles: totalPuzzles },
      progress,
      completedPuzzles,
    };
  });

  const trialDaysLeft = getTrialDaysRemaining(dbUser.trialEndsAt);

  return (
    <DashboardContent
      userFirstName={user.firstName}
      currentStreak={dbUser.currentStreak || 0}
      completedPuzzles={userProgress.length}
      juzsExplored={juzsExplored}
      selectedTranslation={dbUser.selectedTranslation || 'en.sahih'}
      trialDaysLeft={trialDaysLeft}
      subscriptionStatus={dbUser.subscriptionStatus}
      juzs={serializedJuzs}
    />
  );
}

