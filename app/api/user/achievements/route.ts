import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User, UserAchievement, UserProgress, LikedAyat, Juz, Puzzle, ACHIEVEMENTS } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      return NextResponse.json({ achievements: [], stats: {} });
    }

    // Get user's unlocked achievements
    const userAchievements = await UserAchievement.find({ userId: dbUser._id }).lean() as any[];
    
    // Calculate current progress for each achievement type
    const completedPuzzlesCount = await UserProgress.countDocuments({
      userId: dbUser._id,
      status: 'COMPLETED',
    });

    const likedAyahsCount = await LikedAyat.countDocuments({
      userId: dbUser._id,
    });

    // Count completed Juz (all puzzles in a juz completed)
    const allJuzs = await Juz.find().lean() as any[];
    let completedJuzCount = 0;
    
    for (const juz of allJuzs) {
      const puzzlesInJuz = await Puzzle.countDocuments({ juzId: juz._id });
      const completedInJuz = await UserProgress.countDocuments({
        userId: dbUser._id,
        status: 'COMPLETED',
        puzzleId: { $in: await Puzzle.find({ juzId: juz._id }).distinct('_id') },
      });
      if (puzzlesInJuz > 0 && completedInJuz >= puzzlesInJuz) {
        completedJuzCount++;
      }
    }

    // Map achievements with progress
    const achievementsWithProgress = ACHIEVEMENTS.map((achievement) => {
      const userAch = userAchievements.find((ua: any) => ua.achievementId === achievement.id);
      let currentProgress = 0;
      
      switch (achievement.type) {
        case 'puzzles_completed':
          currentProgress = completedPuzzlesCount;
          break;
        case 'streak':
          currentProgress = dbUser.longestStreak || 0;
          break;
        case 'juz_completed':
          currentProgress = completedJuzCount;
          break;
        case 'liked_ayahs':
          currentProgress = likedAyahsCount;
          break;
        case 'special_surah':
          // Check if the specific surah is completed
          currentProgress = 0; // TODO: implement surah completion check
          break;
      }

      const isUnlocked = userAch?.unlockedAt || currentProgress >= achievement.requirement;
      const progress = Math.min((currentProgress / achievement.requirement) * 100, 100);

      return {
        ...achievement,
        currentProgress,
        progress,
        isUnlocked,
        unlockedAt: userAch?.unlockedAt,
      };
    });

    // Auto-unlock achievements that have been reached
    for (const ach of achievementsWithProgress) {
      if (ach.isUnlocked && !ach.unlockedAt) {
        await UserAchievement.findOneAndUpdate(
          { userId: dbUser._id, achievementId: ach.id },
          { 
            userId: dbUser._id, 
            achievementId: ach.id, 
            unlockedAt: new Date(),
            progress: ach.currentProgress,
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({
      achievements: achievementsWithProgress,
      stats: {
        totalUnlocked: achievementsWithProgress.filter(a => a.isUnlocked).length,
        totalAchievements: ACHIEVEMENTS.length,
        completedPuzzles: completedPuzzlesCount,
        currentStreak: dbUser.currentStreak || 0,
        longestStreak: dbUser.longestStreak || 0,
        likedAyahs: likedAyahsCount,
        completedJuz: completedJuzCount,
      },
    });
  } catch (error: any) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get achievements' },
      { status: 500 }
    );
  }
}

