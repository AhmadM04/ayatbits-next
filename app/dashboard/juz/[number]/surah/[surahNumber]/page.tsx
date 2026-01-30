import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Surah, Juz, Puzzle, UserProgress, User, LikedAyat } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Play, Heart, CheckCircle, BookOpen } from 'lucide-react';
import VersePageClient from './VersePageClient';
import TranslationDisplay from './TranslationDisplay';
import TransliterationDisplay from './TransliterationDisplay';
import AudioPlayer from './AudioPlayer';
import AyahSelectorClient from './AyahSelectorClient';
import LikeButton from './LikeButton';
import AyahTextDisplay from './AyahTextDisplay';
import BismillahDisplay from './BismillahDisplay';
import VerseNavButtons from './VerseNavButtons';
import { cleanAyahText, extractBismillah, shouldShowBismillahSeparately } from '@/lib/ayah-utils';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { fetchTranslation, fetchTransliteration } from '@/lib/quran-api-adapter';

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

  // Fetch transliteration if user preference is enabled
  let initialTransliteration = '';
  if (dbUser.showTransliteration) {
    try {
      const transliterationData = await fetchTransliteration(
        parseInt(surahNumber),
        selectedAyah,
        { next: { revalidate: 86400 } }
      );
      initialTransliteration = transliterationData.data?.text || '';
    } catch (error) {
      // Transliteration fetch failed
    }
  }

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

  const totalAyahs = puzzles.length;
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
        <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10">
          <div className="max-w-3xl mx-auto px-3 sm:px-4">
            <div className="flex items-center h-14 gap-3">
              <Link
                href={`/dashboard/juz/${juzNumber}`}
                className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold truncate">{surah.nameEnglish}</h1>
                <p className="text-xs text-gray-500 truncate">Juz {juz.number} • {completedAyahs}/{totalAyahs} completed</p>
              </div>
              {mushafPageNumber && (
                <Link
                  href={`/dashboard/mushaf/page/${mushafPageNumber}`}
                  className="p-2 -mr-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="View in Mushaf"
                >
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </Link>
              )}
            </div>
          </div>
        </header>

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

              {/* Arabic Text Card with icons on top right */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-5">
                {/* Top icons row - explicitly right aligned */}
                <div className="flex items-center gap-2 mb-3" style={{ justifyContent: 'flex-end' }}>
                  {isMemorized && (
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center" title="Memorized">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                  <LikeButton
                    puzzleId={currentPuzzle._id.toString()}
                    isLiked={isLiked}
                    compact
                  />
                </div>

                {/* Arabic Text */}
                <AyahTextDisplay
                  ayahText={showBismillahSeparately ? remainingText : cleanAyahText(
                    currentPuzzle.content?.ayahText || '',
                    parseInt(surahNumber),
                    selectedAyah
                  )}
                  surahNumber={parseInt(surahNumber)}
                  ayahNumber={selectedAyah}
                />
              </div>

              {/* Audio Player - Redesigned */}
              <AudioPlayer
                surahNumber={parseInt(surahNumber)}
                ayahNumber={selectedAyah}
              />

              {/* Translation */}
              <TranslationDisplay
                surahNumber={parseInt(surahNumber)}
                ayahNumber={selectedAyah}
                selectedTranslation={selectedTranslation}
                initialTranslation={initialTranslation}
              />

              {/* Transliteration */}
              <TransliterationDisplay
                surahNumber={parseInt(surahNumber)}
                ayahNumber={selectedAyah}
                initialTransliteration={initialTransliteration}
                initialShowTransliteration={dbUser.showTransliteration || false}
              />

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
