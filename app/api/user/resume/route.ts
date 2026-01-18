import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User, Puzzle } from '@/lib/db';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: user.id });
    if (!dbUser) {
      return NextResponse.json({ resumeUrl: null });
    }

    if (!dbUser.lastPuzzleId) {
      return NextResponse.json({ resumeUrl: null });
    }

    const puzzle = await Puzzle.findById(dbUser.lastPuzzleId)
      .populate('juzId')
      .populate('surahId')
      .lean() as any;

    if (!puzzle) {
      return NextResponse.json({ resumeUrl: null });
    }

    const ayahNumber = puzzle.content?.ayahNumber || 1;
    const juzNumber = puzzle.juzId?.number || 1;
    const surahNumber = puzzle.surahId?.number || 1;

    return NextResponse.json({
      resumeUrl: `/dashboard/juz/${juzNumber}/surah/${surahNumber}?ayah=${ayahNumber}`,
      puzzleId: puzzle._id.toString(),
      juzNumber,
      surahNumber,
      ayahNumber,
      surahName: puzzle.surahId?.nameEnglish || 'Unknown',
    });
  } catch (error: any) {
    console.error('Resume API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get resume data' },
      { status: 500 }
    );
  }
}










