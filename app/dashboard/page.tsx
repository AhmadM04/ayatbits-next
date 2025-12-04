import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Juz, Puzzle, UserProgress, User } from '@/lib/db';
import DashboardContent from './DashboardContent';
import DashboardI18nProvider from './DashboardI18nProvider';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  await connectDB();

  // Find or create user
  let dbUser = await User.findOne({ clerkId: user.id });
  if (!dbUser) {
    dbUser = await User.create({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.fullName,
      imageUrl: user.imageUrl,
    });
  }

  // Fetch all Juzs
  const juzs = await Juz.find().sort({ number: 1 }).lean() as any[];

  // Get puzzle counts for each juz
  const juzsWithData = await Promise.all(
    juzs.map(async (juz: any) => {
      const puzzleCount = await Puzzle.countDocuments({ juzId: juz._id });
      const puzzles = await Puzzle.find({ juzId: juz._id }).select('_id').lean() as any[];
      const puzzleIds = puzzles.map((p: any) => p._id);
      
      const completedCount = await UserProgress.countDocuments({
        userId: dbUser._id,
        puzzleId: { $in: puzzleIds },
        status: 'COMPLETED',
      });

      const progress = puzzleCount > 0 ? Math.round((completedCount / puzzleCount) * 100) : 0;

      return {
        _id: juz._id.toString(),
        number: juz.number,
        name: juz.name,
        _count: { puzzles: puzzleCount },
        completedPuzzles: completedCount,
        progress,
      };
    })
  );

  // Get user progress stats
  const totalCompletedPuzzles = await UserProgress.countDocuments({
    userId: dbUser._id,
    status: 'COMPLETED',
  });

  // Get unique juzs explored
  const completedProgress = await UserProgress.find({
    userId: dbUser._id,
    status: 'COMPLETED',
  })
    .populate({
      path: 'puzzleId',
      select: 'juzId',
    })
    .lean() as any[];

  const juzsExplored = new Set(
    completedProgress
      .map((p: any) => p.puzzleId?.juzId?.toString())
      .filter(Boolean)
  ).size;

  // Get user settings
  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';
  
  // Calculate streak (simplified - you may want more complex logic)
  const currentStreak = dbUser.currentStreak || 0;

  // Trial and subscription info
  const trialDaysLeft = dbUser.trialEndDate 
    ? Math.max(0, Math.ceil((new Date(dbUser.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <DashboardI18nProvider translationCode={selectedTranslation}>
      <DashboardContent
        userFirstName={user.firstName}
        currentStreak={currentStreak}
        completedPuzzles={totalCompletedPuzzles}
        juzsExplored={juzsExplored}
        selectedTranslation={selectedTranslation}
        trialDaysLeft={trialDaysLeft}
        subscriptionStatus={dbUser.subscriptionStatus}
        juzs={juzsWithData}
      />
    </DashboardI18nProvider>
  );
}
