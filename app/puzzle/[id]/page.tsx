import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Puzzle, LikedAyat, User, UserProgress } from '@/lib/db';
import mongoose from 'mongoose';
import PuzzleClient from './PuzzleClient';
import { cleanAyahText } from '@/lib/ayah-utils';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { checkProAccess } from '@/lib/subscription';

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

  // Check dashboard access (redirects if no access, except admin bypass)
  await requireDashboardAccess();

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

  // PERFORMANCE FIX: Parallel fetching - fetch User and Puzzle simultaneously
  const [dbUser, puzzle] = await Promise.all([
    User.findOne({ clerkIds: user.id }).lean(),
    Puzzle.findById(id)
      .populate('surahId')
      .populate('juzId')
      .lean() as any,
  ]);

  if (!dbUser) {
    redirect('/sign-in');
  }

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

  // PERFORMANCE FIX: Parallel fetching - fetch puzzles, liked status, AND user progress simultaneously
  const [puzzles, likedAyat, userProgress] = await Promise.all([
    Puzzle.find({
      juzId: puzzle.juzId,
      surahId: puzzle.surahId,
    })
      .sort({ 'content.ayahNumber': 1 })
      .lean() as Promise<any[]>,
    LikedAyat.findOne({
      userId: dbUser._id,
      puzzleId: puzzle._id,
    }).lean(),
    UserProgress.findOne({
      userId: dbUser._id,
      puzzleId: puzzle._id,
    }).lean(),
  ]);

  const currentIndex = puzzles.findIndex((p: any) => p._id.toString() === id);
  const previousPuzzle = currentIndex > 0 ? puzzles[currentIndex - 1] : null;
  const nextPuzzle = currentIndex < puzzles.length - 1 ? puzzles[currentIndex + 1] : null;
  const isLastAyahInSurah = currentIndex === puzzles.length - 1;

  const content = puzzle.content as { ayahText: string; ayahNumber?: number; surahNumber?: number };
  const rawAyahText = content.ayahText || '';
  const surahNum = puzzle.surahId?.number || content.surahNumber || 1;
  const ayahNum = content.ayahNumber || 1;
  
  // Remove bismillah from first ayah of surahs (except Al-Fatiha)
  const ayahText = cleanAyahText(rawAyahText, surahNum, ayahNum);

  // PERFORMANCE FIX: Don't fetch transliteration/AI on server - let client load it in background
  // This prevents 10-15 second blocking on OpenAI API calls
  // User sees page instantly, then data streams in
  
  // Just pass flags to client about what to fetch
  const hasPro = checkProAccess(dbUser as any);
  const shouldFetchTransliteration = dbUser.showTransliteration || false;
  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  // Serialize the puzzle for the client component
  const serializedPuzzle = {
    id: puzzle._id.toString(),
    type: puzzle.type,
    content: {
      ...puzzle.content,
      ayahNumber: content.ayahNumber,
    },
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

  // Build verse page URL - always provide a valid URL for consistent hydration
  const versePageUrl = puzzle.surahId && puzzle.juzId && puzzle.content?.ayahNumber
    ? `/dashboard/juz/${puzzle.juzId.number}/surah/${puzzle.surahId.number}?ayah=${puzzle.content.ayahNumber}`
    : '/dashboard';

  // Extract next puzzle ayah number safely
  const nextPuzzleContent = nextPuzzle?.content as { ayahNumber?: number } | undefined;
  const nextPuzzleAyahNumber = nextPuzzleContent?.ayahNumber ?? null;

  // Serialize user progress for client (convert MongoDB objects to plain JSON)
  const serializedProgress = userProgress 
    ? JSON.parse(JSON.stringify(userProgress)) 
    : null;

  return (
    <PuzzleClient
      puzzle={serializedPuzzle}
      ayahText={ayahText}
      userId={user.id}
      isLiked={!!likedAyat}
      previousPuzzleId={previousPuzzle?._id.toString() || null}
      nextPuzzleId={nextPuzzle?._id.toString() || null}
      nextPuzzleAyahNumber={nextPuzzleAyahNumber}
      versePageUrl={versePageUrl}
      isLastAyahInSurah={isLastAyahInSurah}
      enableWordByWordAudio={dbUser.enableWordByWordAudio || false}
      // PERFORMANCE FIX: Pass flags instead of pre-fetched data
      shouldFetchTransliteration={shouldFetchTransliteration}
      shouldFetchAiTafsir={hasPro}
      selectedTranslation={selectedTranslation}
      surahNumber={surahNum}
      ayahNumber={ayahNum}
      // OPTIMIZATION: Pass initial progress data (fetched in parallel on server)
      initialProgress={serializedProgress}
    />
  );
}
