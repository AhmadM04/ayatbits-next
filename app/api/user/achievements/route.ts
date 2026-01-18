import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User, UserAchievement, UserProgress, LikedAyat, ACHIEVEMENTS } from '@/lib/db';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: user.id }).lean() as any;
    if (!dbUser) {
      return NextResponse.json({ achievements: [], stats: {} });
    }

    // Parallelize all independent queries for speed
    const [userAchievements, completedPuzzlesCount, likedAyahsCount] = await Promise.all([
      UserAchievement.find({ userId: dbUser._id }).lean() as Promise<any[]>,
      UserProgress.countDocuments({ userId: dbUser._id, status: 'COMPLETED' }),
      LikedAyat.countDocuments({ userId: dbUser._id }),
    ]);

    // For juz completion, we'll use the user's stored progress (simplified)
    // This avoids expensive loop queries - we track juz completion separately
    const completedJuzCount = 0; // TODO: Track in user document for performance

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
          currentProgress = 0;
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

    // Auto-unlock achievements in the background (don't block response)
    const achievementsToUnlock = achievementsWithProgress.filter(
      ach => ach.isUnlocked && !ach.unlockedAt
    );
    
    if (achievementsToUnlock.length > 0) {
      // Fire and forget - don't await
      Promise.all(
        achievementsToUnlock.map(ach =>
          UserAchievement.findOneAndUpdate(
            { userId: dbUser._id, achievementId: ach.id },
            { 
              userId: dbUser._id, 
              achievementId: ach.id, 
              unlockedAt: new Date(),
              progress: ach.currentProgress,
            },
            { upsert: true }
          )
        )
      ).catch(err => console.error('Background achievement unlock error:', err));
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
