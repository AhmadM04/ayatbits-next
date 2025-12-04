import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Juz, Puzzle, UserProgress, User } from '@/lib/db';
import mongoose from 'mongoose';
import DashboardContent from './DashboardContent';
import DashboardI18nProvider from './DashboardI18nProvider';
import { checkSubscriptionAccess } from '@/lib/subscription';
import { getTrialDaysRemaining } from '@/lib/subscription';

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

  // Check subscription access - allow inactive users to see dashboard but show pricing prompts
  const access = checkSubscriptionAccess(dbUser);
  // Don't redirect - let them see the dashboard but they'll need to subscribe to use features

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  // Fetch all Juzs
  const juzs = await Juz.find().sort({ number: 1 }).lean() as any[];

  // Get puzzle counts for each juz
  const puzzleCounts = await Puzzle.aggregate([
    { $group: { _id: '$juzId', count: { $sum: 1 } } }
  ]);

  const puzzleCountMap = new Map(
    puzzleCounts.map((p: any) => [p._id.toString(), p.count])
  );

  // Get user progress
  const userProgress = await UserProgress.find({
    userId: dbUser._id,
    status: 'COMPLETED',
  })
    .populate('puzzleId')
    .lean() as any[];

  // Calculate progress for each juz
  const juzsWithProgress = juzs.map((juz: any) => {
    const totalPuzzles = puzzleCountMap.get(juz._id.toString()) || 0;
    const completedPuzzles = userProgress.filter(
      (p: any) => p.puzzleId?.juzId?.toString() === juz._id.toString()
    ).length;
    const progress = totalPuzzles > 0 ? (completedPuzzles / totalPuzzles) * 100 : 0;

    return {
      _id: juz._id.toString(),
      number: juz.number,
      name: juz.name,
      _count: { puzzles: totalPuzzles },
      progress,
      completedPuzzles,
    };
  });

  // Calculate stats
  const completedPuzzles = userProgress.length;
  const uniqueJuzs = new Set(
    userProgress
      .map((p: any) => p.puzzleId?.juzId?.toString())
      .filter(Boolean)
  ).size;

  const currentStreak = dbUser.currentStreak ?? 0;
  const trialDaysLeft = getTrialDaysRemaining(dbUser.trialEndDate);

  return (
    <DashboardI18nProvider translationCode={selectedTranslation}>
      <DashboardContent
        userFirstName={user.firstName}
        currentStreak={currentStreak}
        completedPuzzles={completedPuzzles}
        juzsExplored={uniqueJuzs}
        selectedTranslation={selectedTranslation}
        trialDaysLeft={trialDaysLeft}
        subscriptionStatus={dbUser.subscriptionStatus}
        juzs={juzsWithProgress}
      />
    </DashboardI18nProvider>
  );
}
