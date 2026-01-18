import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Puzzle, LikedAyat, User, Surah, Juz } from '@/lib/db';
import mongoose from 'mongoose';
import PuzzleClient from './PuzzleClient';
import { cleanAyahText } from '@/lib/ayah-utils';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { fetchTransliteration } from '@/lib/quran-api-adapter';

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

  // Get user (already checked access above)
  const dbUser = await User.findOne({ clerkId: user.id });
  if (!dbUser) {
    redirect('/sign-in');
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

  // Find previous and next puzzles in the same surah/juz
  const puzzles = await Puzzle.find({
    juzId: puzzle.juzId,
    surahId: puzzle.surahId,
  })
    .sort({ 'content.ayahNumber': 1 })
    .lean() as any[];

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

  // Fetch transliteration if user preference is enabled
  let initialTransliteration = '';
  let initialWordTransliterations: Array<{ text: string; transliteration: string }> = [];
  
  if (dbUser.showTransliteration) {
    try {
      // Fetch full-ayah transliteration using adapter
      const transliterationData = await fetchTransliteration(
        surahNum,
        ayahNum,
        { next: { revalidate: 86400 } }
      );
      initialTransliteration = transliterationData.data?.text || '';
      
      // Fetch word-by-word transliteration from Quran.com
      const wordsResponse = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${surahNum}:${ayahNum}?words=true&word_fields=transliteration,text_uthmani`,
        { next: { revalidate: 86400 } }
      );
      if (wordsResponse.ok) {
        const wordsData = await wordsResponse.json();
        const words = wordsData.verse?.words || [];
        initialWordTransliterations = words.map((word: any) => ({
          text: word.text_uthmani || '',
          transliteration: word.transliteration?.text || '',
        }));
      }
    } catch (error) {
      console.error('Failed to pre-fetch transliteration:', error);
    }
  }

  // Check if liked
  const likedAyat = await LikedAyat.findOne({
    userId: dbUser._id,
    puzzleId: puzzle._id,
  });

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
      initialTransliteration={initialTransliteration}
      initialWordTransliterations={initialWordTransliterations}
      initialShowTransliteration={dbUser.showTransliteration || false}
    />
  );
}
