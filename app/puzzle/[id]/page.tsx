import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Puzzle, LikedAyat, User } from '@/lib/db';
import PuzzleClient from './PuzzleClient';
import mongoose from 'mongoose';

export default async function PuzzlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const puzzle = await Puzzle.findById(id)
    .populate('surahId')
    .populate('juzId')
    .lean() as any;

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Puzzle not found</h1>
          <a href="/dashboard" className="text-green-600 hover:underline">
            Go back to dashboard
          </a>
        </div>
      </div>
    );
  }

  const content = puzzle.content as { ayahText: string; ayahNumber?: number };
  const ayahText = content.ayahText || '';
  const currentAyahNumber = content.ayahNumber || 1;

  // Check if liked
  const likedAyat = await LikedAyat.findOne({
    userId: dbUser._id,
    puzzleId: new mongoose.Types.ObjectId(id),
  }).lean();

  // Find next puzzle in the same surah and juz
  let nextPuzzle = null;
  if (puzzle.surahId && puzzle.juzId) {
    const nextPuzzles = await Puzzle.find({
      juzId: puzzle.juzId,
      surahId: puzzle.surahId,
    })
      .sort({ 'content.ayahNumber': 1 })
      .lean() as any;
    
    const currentIndex = nextPuzzles.findIndex(
      (p: any) => p._id.toString() === id
    );
    
    if (currentIndex >= 0 && currentIndex < nextPuzzles.length - 1) {
      nextPuzzle = nextPuzzles[currentIndex + 1];
    }
  }

  // Serialize puzzle for client component - convert ObjectIds to strings and map fields
  const serializedPuzzle = {
    id: puzzle._id.toString(),
    surah: puzzle.surahId ? {
      nameEnglish: (puzzle.surahId as any).nameEnglish || '',
      nameArabic: (puzzle.surahId as any).nameArabic || '',
      number: (puzzle.surahId as any).number || 0,
    } : null,
    juz: puzzle.juzId ? {
      number: (puzzle.juzId as any).number || 0,
    } : null,
    nextAyahUrl: nextPuzzle && puzzle.surahId && puzzle.juzId
      ? `/dashboard/juz/${(puzzle.juzId as any).number}/surah/${(puzzle.surahId as any).number}?ayah=${nextPuzzle.content.ayahNumber}`
      : null,
    ayahViewUrl: puzzle.surahId && puzzle.juzId && currentAyahNumber
      ? `/dashboard/juz/${(puzzle.juzId as any).number}/surah/${(puzzle.surahId as any).number}?ayah=${currentAyahNumber}`
      : null,
  };

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  return (
    <PuzzleClient
      puzzle={serializedPuzzle}
      ayahText={ayahText}
      userId={user.id}
      isLiked={!!likedAyat}
      translationCode={selectedTranslation}
    />
  );
}

