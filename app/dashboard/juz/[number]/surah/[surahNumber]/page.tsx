import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Puzzle, UserProgress, LikedAyat } from '@/lib/db';
import VersePageClient from './VersePageClient';
import AyahPageContent from './AyahPageContent';
import SurahHeader from './SurahHeader';
import { cleanAyahText, extractBismillah, shouldShowBismillahSeparately } from '@/lib/ayah-utils';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { fetchTranslation } from '@/lib/quran-api-adapter';
import { getCachedSurahVerses } from '@/lib/quran-data';

export default async function SurahVersePage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string; surahNumber: string }>;
  searchParams: Promise<{ ayah?: string }>;
}) {
  const { number: juzNumber, surahNumber } = await params;
  const { ayah: ayahParam } = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await requireDashboardAccess();

  await connectDB();

  const juzNum = parseInt(juzNumber);
  const surahNum = parseInt(surahNumber);

  // OPTIMIZATION 1: Fetch cached surah data (instant if cached, ~300ms if cold)
  const cachedData = await getCachedSurahVerses(juzNum, surahNum);

  if (!cachedData) {
    notFound();
  }

  const { juz, surah, puzzles } = cachedData;
  
  // Get puzzle IDs for parallel queries
  const puzzleIds = puzzles.map((p: any) => p._id);
  
  // OPTIMIZATION 2: Parallel fetch of user-specific data (all run simultaneously)
  const [totalPuzzlesInSurah, progress, likedAyahs] = await Promise.all([
    // Count total puzzles in the entire surah
    Puzzle.countDocuments({ surahId: surah._id }),
    // Fetch user progress
    UserProgress.find({
      userId: dbUser._id,
      puzzleId: { $in: puzzleIds },
      status: 'COMPLETED',
    })
      .select('puzzleId')
      .lean(),
    // Fetch liked ayahs
    LikedAyat.find({
      userId: dbUser._id,
      puzzleId: { $in: puzzleIds },
    })
      .select('puzzleId')
      .lean(),
  ]);

  const completedPuzzleIds = new Set(progress.map((p: any) => p.puzzleId.toString()));
  const likedPuzzleIds = new Set(likedAyahs.map((l: any) => l.puzzleId.toString()));

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';
  const enableWordByWordAudio = dbUser.enableWordByWordAudio || false;
  const selectedAyah = ayahParam ? parseInt(ayahParam) : puzzles[0]?.ayahNumber || 1;

  const currentPuzzle = puzzles.find((p: any) => p.ayahNumber === selectedAyah);
  const currentIndex = puzzles.findIndex((p: any) => p.ayahNumber === selectedAyah);
  
  const previousPuzzle = currentIndex > 0 ? puzzles[currentIndex - 1] : null;
  const nextPuzzle = currentIndex < puzzles.length - 1 ? puzzles[currentIndex + 1] : null;

  // OPTIMIZATION 3: Parallel fetch of non-critical data (translation & page number)
  const [translationResult, pageResult] = await Promise.allSettled([
    fetchTranslation(
      surahNum,
      selectedAyah,
      selectedTranslation,
      { next: { revalidate: 86400 } }
    ),
    fetch(
      `https://api.quran.com/api/v4/verses/by_key/${surahNum}:${selectedAyah}?fields=page_number`,
      { next: { revalidate: 86400 } }
    ).then(res => res.ok ? res.json() : null),
  ]);

  // Extract results with fallbacks
  const initialTranslation = translationResult.status === 'fulfilled' 
    ? translationResult.value?.data?.text || ''
    : '';
  
  const mushafPageNumber = pageResult.status === 'fulfilled' 
    ? pageResult.value?.verse?.page_number || null
    : null;

  const totalAyahs = totalPuzzlesInSurah;
  const completedAyahs = completedPuzzleIds.size;
  const progressPercentage = totalAyahs > 0 ? (completedAyahs / totalAyahs) * 100 : 0;

  const rawAyahText = currentPuzzle?.ayahText || '';
  const { bismillah, remainingText } = extractBismillah(rawAyahText, surahNum, selectedAyah);
  const showBismillahSeparately = shouldShowBismillahSeparately(surahNum) && selectedAyah === 1;

  const isMemorized = currentPuzzle ? completedPuzzleIds.has(currentPuzzle._id) : false;
  const isLiked = currentPuzzle ? likedPuzzleIds.has(currentPuzzle._id) : false;

  // Prepare initial data for client-side data manager
  const initialAyahData = {
    ayahText: cleanAyahText(currentPuzzle?.ayahText || '', surahNum, selectedAyah),
    ayahNumber: selectedAyah,
    translation: initialTranslation,
    mushafPageNumber,
    puzzleId: currentPuzzle?._id || '',
    isMemorized,
    isLiked,
    previousAyah: previousPuzzle?.ayahNumber || null,
    nextAyah: nextPuzzle?.ayahNumber || null,
    completedAyahs,
    totalAyahs,
    progressPercentage,
    surahName: surah.nameEnglish,
    surahNameArabic: surah.nameArabic,
    juzNumber: juz.number,
    selectedTranslation,
    enableWordByWordAudio,
    subscriptionPlan: dbUser.subscriptionPlan || 'FREE',
    puzzles: puzzles.map((p: any) => ({
      id: p._id.toString(),
      ayahNumber: p.ayahNumber || 1,
      isCompleted: completedPuzzleIds.has(p._id),
      isLiked: likedPuzzleIds.has(p._id),
    })),
  };

  return (
    <VersePageClient translationCode={selectedTranslation}>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0a] text-[#4A3728] dark:text-white pb-6">
        {/* Header - Solid background */}
        <SurahHeader
          juzNumber={juzNumber}
          juzNumberValue={juz.number}
          surahName={surah.nameEnglish}
          completedAyahs={completedAyahs}
          totalAyahs={totalAyahs}
          currentPuzzle={currentPuzzle ? {
            _id: currentPuzzle._id,
            content: {
              ayahNumber: currentPuzzle.ayahNumber,
              ayahText: currentPuzzle.ayahText,
            },
          } : null}
          surahNumber={surahNum}
          selectedAyah={selectedAyah}
          selectedTranslation={selectedTranslation}
          ayahText={showBismillahSeparately ? remainingText : cleanAyahText(
            currentPuzzle?.ayahText || '',
            surahNum,
            selectedAyah
          )}
          subscriptionPlan={dbUser.subscriptionPlan}
          mushafPageNumber={mushafPageNumber}
        />

        <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
          {currentPuzzle ? (
            <AyahPageContent
              initialData={initialAyahData}
              juzNumber={juzNum}
              surahNumber={surahNum}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-[#8E7F71] dark:text-gray-400">No puzzles found for this selection.</p>
            </div>
          )}
        </main>
      </div>
    </VersePageClient>
  );
}
