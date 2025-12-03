import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User, LikedAyat, Puzzle } from '@/lib/db';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      return NextResponse.json({ likedAyahs: [] });
    }

    const likedAyahs = await LikedAyat.find({ userId: dbUser._id })
      .sort({ likedAt: -1 })
      .populate({
        path: 'puzzleId',
        populate: [
          { path: 'surahId' },
          { path: 'juzId' },
        ],
      })
      .lean() as any[];

    const formattedAyahs = likedAyahs.map((liked: any) => {
      const puzzle = liked.puzzleId;
      if (!puzzle) return null;

      return {
        id: liked._id.toString(),
        puzzleId: puzzle._id.toString(),
        ayahText: puzzle.content?.ayahText || '',
        ayahNumber: puzzle.content?.ayahNumber || 1,
        surahNumber: puzzle.surahId?.number || 1,
        surahNameEnglish: puzzle.surahId?.nameEnglish || 'Unknown',
        surahNameArabic: puzzle.surahId?.nameArabic || '',
        juzNumber: puzzle.juzId?.number || 1,
        likedAt: liked.likedAt,
      };
    }).filter(Boolean);

    return NextResponse.json({
      likedAyahs: formattedAyahs,
      total: formattedAyahs.length,
    });
  } catch (error: any) {
    console.error('Liked ayahs API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get liked ayahs' },
      { status: 500 }
    );
  }
}


