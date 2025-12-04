import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Puzzle, LikedAyat, User, Surah, Juz } from '@/lib/db';
import mongoose from 'mongoose';
import PuzzleClient from './PuzzleClient';

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

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Invalid puzzle ID</h1>
          <a href="/dashboard" className="text-green-500 hover:underline">
            Go back to dashboard
          </a>
        </div>
      </div>
    );
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Puzzle not found</h1>
          <a href="/dashboard" className="text-green-500 hover:underline">
            Go back to dashboard
          </a>
        </div>
      </div>
    );
  }

  const content = puzzle.content as { ayahText: string };
  const ayahText = content.ayahText || '';

  // Check if liked
  const likedAyat = await LikedAyat.findOne({
    userId: dbUser._id,
    puzzleId: puzzle._id,
  });

  // Serialize the puzzle for the client component
  const serializedPuzzle = {
    id: puzzle._id.toString(),
    type: puzzle.type,
    content: puzzle.content,
    difficulty: puzzle.difficulty,
    surah: puzzle.surahId ? {
      number: puzzle.surahId.number,
      nameEnglish: puzzle.surahId.nameEnglish,
      nameArabic: puzzle.surahId.nameArabic,
    } : null,
    juz: puzzle.juzId ? {
      number: puzzle.juzId.number,
      name: puzzle.juzId.name,
    } : null,
  };

  return (
    <PuzzleClient
      puzzle={serializedPuzzle}
      ayahText={ayahText}
      userId={user.id}
      isLiked={!!likedAyat}
    />
  );
}
