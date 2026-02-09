import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Surah, Juz, Puzzle, UserProgress, User, LikedAyat } from '@/lib/db';
import VersePageClient from './VersePageClient';
import TranslationDisplay from './TranslationDisplay';
import AyahSelectorClient from './AyahSelectorClient';
import BismillahDisplay from './BismillahDisplay';
import VerseNavButtons from './VerseNavButtons';
import ArabicTextCard from './ArabicTextCard';
import SurahHeader from './SurahHeader';
import { cleanAyahText, extractBismillah, shouldShowBismillahSeparately } from '@/lib/ayah-utils';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { fetchTranslation } from '@/lib/quran-api-adapter';

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

  const juz = await Juz.findOne({ number: parseInt(juzNumber) }).lean() as any;
  const surah = await Surah.findOne({ number: parseInt(surahNumber) }).lean() as any;

  if (!juz || !surah) {
    notFound();
  }

  const puzzles = await Puzzle.find({
    juzId: juz._id,
    surahId: surah._id,
  })
    .sort({ 'content.ayahNumber': 1 })
    .lean() as any[];

  // Get total puzzles in the entire surah (not just this juz) for accurate total count
  const totalPuzzlesInSurah = await Puzzle.countDocuments({
    surahId: surah._id,
  });

  const puzzleIds = puzzles.map((p: any) => p._id);
  const progress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
    status: 'COMPLETED',
  }).lean() as any[];

  const completedPuzzleIds = new Set(progress.map((p: any) => p.puzzleId.toString()));

  const likedAyahs = await LikedAyat.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
  }).lean() as any[];

  const likedPuzzleIds = new Set(likedAyahs.map((l: any) => l.puzzleId.toString()));

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';
  const enableWordByWordAudio = dbUser.enableWordByWordAudio || false;
  const selectedAyah = ayahParam ? parseInt(ayahParam) : puzzles[0]?.content?.ayahNumber || 1;

  const currentPuzzle = puzzles.find((p: any) => p.content?.ayahNumber === selectedAyah);
  const currentIndex = puzzles.findIndex((p: any) => p.content?.ayahNumber === selectedAyah);
  
  const previousPuzzle = currentIndex > 0 ? puzzles[currentIndex - 1] : null;
  const nextPuzzle = currentIndex < puzzles.length - 1 ? puzzles[currentIndex + 1] : null;

  let initialTranslation = '';
  try {
    const translationData = await fetchTranslation(
      parseInt(surahNumber),
      selectedAyah,
      selectedTranslation,
      { next: { revalidate: 86400 } }
    );
    initialTranslation = translationData.data?.text || '';
  } catch (error) {
    // Translation fetch failed
  }

  // Transliteration is now loaded on-demand via the modal, not prefetched
  // AI Tafsir is also loaded on-demand to avoid blocking page load

  // Fetch page number for Mushaf navigation
  let mushafPageNumber: number | null = null;
  try {
    const pageResponse = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${selectedAyah}?fields=page_number`,
      { next: { revalidate: 86400 } }
    );
    if (pageResponse.ok) {
      const pageData = await pageResponse.json();
      mushafPageNumber = pageData.verse?.page_number || null;
    }
  } catch (error) {
    // Page number fetch failed
  }

  const totalAyahs = totalPuzzlesInSurah;
  const completedAyahs = completedPuzzleIds.size;
  const progressPercentage = totalAyahs > 0 ? (completedAyahs / totalAyahs) * 100 : 0;

  const rawAyahText = currentPuzzle?.content?.ayahText || '';
  const { bismillah, remainingText } = extractBismillah(rawAyahText, parseInt(surahNumber), selectedAyah);
  const showBismillahSeparately = shouldShowBismillahSeparately(parseInt(surahNumber)) && selectedAyah === 1;

  const isMemorized = currentPuzzle ? completedPuzzleIds.has(currentPuzzle._id.toString()) : false;
  const isLiked = currentPuzzle ? likedPuzzleIds.has(currentPuzzle._id.toString()) : false;

  return (
    <VersePageClient translationCode={selectedTranslation}>
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-6">
        {/* Header - Solid background */}
        <SurahHeader
          juzNumber={juzNumber}
          juzNumberValue={juz.number}
          surahName={surah.nameEnglish}
          completedAyahs={completedAyahs}
          totalAyahs={totalAyahs}
          currentPuzzle={currentPuzzle}
          surahNumber={parseInt(surahNumber)}
          selectedAyah={selectedAyah}
          selectedTranslation={selectedTranslation}
          ayahText={showBismillahSeparately ? remainingText : cleanAyahText(
            currentPuzzle?.content?.ayahText || '',
            parseInt(surahNumber),
            selectedAyah
          )}
          subscriptionPlan={dbUser.subscriptionPlan}
          mushafPageNumber={mushafPageNumber}
        />

        <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Ayah Selector with Modal */}
          <AyahSelectorClient
            puzzles={puzzles.map((p: any) => ({
              id: p._id.toString(),
              ayahNumber: p.content?.ayahNumber || 1,
              isCompleted: completedPuzzleIds.has(p._id.toString()),
              isLiked: likedPuzzleIds.has(p._id.toString()),
            }))}
            currentAyah={selectedAyah}
            juzNumber={parseInt(juzNumber)}
            surahNumber={parseInt(surahNumber)}
          />

          {currentPuzzle ? (
            <div className="space-y-4">
              {/* Bismillah - Shown separately for surahs 2-114 (except 9) on first ayah */}
              {showBismillahSeparately && bismillah && (
                <BismillahDisplay
                  bismillah={bismillah}
                  surahNumber={parseInt(surahNumber)}
                />
              )}

              {/* Arabic Text Card with Audio Player */}
              <div data-tutorial="arabic-text">
                <ArabicTextCard
                  surahNumber={parseInt(surahNumber)}
                  ayahNumber={selectedAyah}
                  ayahText={showBismillahSeparately ? remainingText : cleanAyahText(
                    currentPuzzle.content?.ayahText || '',
                    parseInt(surahNumber),
                    selectedAyah
                  )}
                  puzzleId={currentPuzzle._id.toString()}
                  isMemorized={isMemorized}
                  isLiked={isLiked}
                  enableWordByWordAudio={enableWordByWordAudio}
                />
              </div>

              {/* Translation */}
              <div data-tutorial="translation">
                <TranslationDisplay
                  surahNumber={parseInt(surahNumber)}
                  ayahNumber={selectedAyah}
                  selectedTranslation={selectedTranslation}
                  initialTranslation={initialTranslation}
                />
              </div>

              {/* Start Puzzle & Navigation Buttons */}
              <VerseNavButtons
                puzzleId={currentPuzzle._id.toString()}
                juzNumber={parseInt(juzNumber)}
                surahNumber={parseInt(surahNumber)}
                previousAyah={previousPuzzle?.content?.ayahNumber}
                nextAyah={nextPuzzle?.content?.ayahNumber}
                selectedAyah={selectedAyah}
                totalAyahs={totalAyahs}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No puzzles found for this selection.</p>
            </div>
          )}
        </main>
      </div>
    </VersePageClient>
  );
}
