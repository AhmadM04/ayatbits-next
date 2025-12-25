import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User, UserProgress, LikedAyat } from '@/lib/db';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all user progress
    await UserProgress.deleteMany({ userId: user._id });

    // Delete all liked ayahs
    await LikedAyat.deleteMany({ userId: user._id });

    // Reset user stats (but keep subscription status)
    await User.updateOne(
      { clerkId: userId },
      {
        $set: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          lastPuzzleId: null,
          totalPuzzlesCompleted: 0,
          totalTimeSpent: 0,
        },
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'All learning data has been cleared. Your account and subscription remain active.'
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}









