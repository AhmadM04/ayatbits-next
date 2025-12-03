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

  await connectDB();

  // Find or create user (layout handles subscription check)
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  let dbUser = await User.findOne({ clerkId: user.id });
  
  if (!dbUser) {
    // Check if user exists by email (created by admin before they signed in)
    dbUser = await User.findOne({ email: userEmail });
    
    if (dbUser) {
      // User was created by admin - update with Clerk ID and info
      dbUser = await User.findOneAndUpdate(
        { email: userEmail },
        {
          clerkId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.fullName,
          imageUrl: user.imageUrl,
        },
        { new: true }
      );
    } else {
      // New user - create
      dbUser = await User.create({
        clerkId: user.id,
        email: userEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
        subscriptionStatus: 'inactive',
      });
    }
  }

  // Fetch Juzs with puzzle counts
  const juzs = await Juz.find().sort({ number: 1 }).lean();
  const juzsWithCounts = await Promise.all(
    juzs.map(async (juz) => {
      const puzzleCount = await Puzzle.countDocuments({ juzId: juz._id });
      return { ...juz, _count: { puzzles: puzzleCount } };
    })
  );


  // Get user progress
  const userProgress = await UserProgress.find({
    userId: dbUser._id,
    status: 'COMPLETED',
  })
    .populate({
      path: 'puzzleId',
      select: 'juzId surahId',
    })
    .lean();

  const juzsExplored = new Set(userProgress.map((p: any) => p.puzzleId?.juzId?.toString()).filter(Boolean)).size;
  
  const serializedJuzs = juzsWithCounts.map((juz: any) => {
    const completedPuzzles = userProgress.filter(
      (p: any) => p.puzzleId?.juzId?.toString() === juz._id.toString()
    ).length;
    const totalPuzzles = juz._count.puzzles;
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

