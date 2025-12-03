import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, User, UserProgress, Puzzle } from '@/lib/db';
import ProfileContent from './ProfileContent';

export default async function ProfilePage() {
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

  // Get user stats
  const completedPuzzles = await UserProgress.countDocuments({
    userId: dbUser._id,
    status: 'COMPLETED',
  });

  const totalPuzzles = await Puzzle.countDocuments();
  const completionPercentage = totalPuzzles > 0 
    ? Math.round((completedPuzzles / totalPuzzles) * 100) 
    : 0;

  // Get unique juzs and surahs completed
  const userProgress = await UserProgress.find({
    userId: dbUser._id,
    status: 'COMPLETED',
  })
    .populate({
      path: 'puzzleId',
      select: 'juzId surahId',
    })
    .lean() as any;

  const uniqueJuzs = new Set(
    userProgress
      .map((p: any) => p.puzzleId?.juzId?.toString())
      .filter(Boolean)
  ).size;

  const uniqueSurahs = new Set(
    userProgress
      .map((p: any) => p.puzzleId?.surahId?.toString())
      .filter(Boolean)
  ).size;

  // Calculate streak
  const currentStreak = dbUser.currentStreak || 0;
  const longestStreak = dbUser.longestStreak || 0;
  const lastActivityDate = dbUser.lastActivityDate 
    ? new Date(dbUser.lastActivityDate).toLocaleDateString()
    : 'Never';

  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.emailAddresses[0]?.emailAddress || 'User';
  
  const userEmail = user.emailAddresses[0]?.emailAddress || '';
  const userInitial = user.firstName?.[0] || userEmail[0]?.toUpperCase() || 'U';
  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  return (
    <ProfileContent
      userName={userName}
      userEmail={userEmail}
      userInitial={userInitial}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      lastActivityDate={lastActivityDate}
      completedPuzzles={completedPuzzles}
      completionPercentage={completionPercentage}
      uniqueJuzs={uniqueJuzs}
      uniqueSurahs={uniqueSurahs}
      selectedTranslation={selectedTranslation}
    />
  );
}


