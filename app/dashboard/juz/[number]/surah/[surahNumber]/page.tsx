import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Surah, Juz, Puzzle, UserProgress, User, LikedAyat } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, Heart, Search } from 'lucide-react';
import VersePageClient from './VersePageClient';
import TranslationDisplay from './TranslationDisplay';
import AudioPlayer from './AudioPlayer';
import AyahSelectorClient from './AyahSelectorClient';
import { cleanAyahText } from '@/lib/ayah-utils';

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

  const juz = await Juz.findOne({ number: parseInt(juzNumber) }).lean() as any;
  const surah = await Surah.findOne({ number: parseInt(surahNumber) }).lean() as any;

  if (!juz || !surah) {
    notFound();
  }

  // Get puzzles for this surah in this juz
  const puzzles = await Puzzle.find({
    juzId: juz._id,
    surahId: surah._id,
  })
    .sort({ 'content.ayahNumber': 1 })
    .lean() as any[];

  // Get user's progress for these puzzles
  const puzzleIds = puzzles.map((p: any) => p._id);
  const progress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
    status: 'COMPLETED',
  }).lean() as any[];

  const completedPuzzleIds = new Set(progress.map((p: any) => p.puzzleId.toString()));

  // Get liked status
  const likedAyahs = await LikedAyat.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
  }).lean() as any[];

  const likedPuzzleIds = new Set(likedAyahs.map((l: any) => l.puzzleId.toString()));

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';
  const selectedAyah = ayahParam ? parseInt(ayahParam) : puzzles[0]?.content?.ayahNumber || 1;

  // Find the current puzzle
  const currentPuzzle = puzzles.find((p: any) => p.content?.ayahNumber === selectedAyah);
  const currentIndex = puzzles.findIndex((p: any) => p.content?.ayahNumber === selectedAyah);

  // Pre-fetch translation on server side for faster loading
  let initialTranslation = '';
  try {
    const translationResponse = await fetch(
      `https://api.alquran.cloud/v1/ayah/${parseInt(surahNumber)}:${selectedAyah}/${selectedTranslation}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    if (translationResponse.ok) {
      const translationData = await translationResponse.json();
      initialTranslation = translationData.data?.text || '';
    }
  } catch (error) {
    console.error('Failed to pre-fetch translation:', error);
    // Continue without initial translation - client will fetch it
  }

  // Calculate progress
  const totalAyahs = puzzles.length;
  const completedAyahs = completedPuzzleIds.size;
  const progressPercentage = totalAyahs > 0 ? (completedAyahs / totalAyahs) * 100 : 0;

  return (
    <VersePageClient translationCode={selectedTranslation}>
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-8">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center h-14 gap-4">
              <Link
                href={`/dashboard/juz/${juzNumber}`}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">{surah.nameEnglish}</h1>
                <p className="text-xs text-gray-500">{surah.nameArabic} • Juz {juz.number}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* Progress Bar and Search Button */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-green-400">
                    {completedAyahs}/{totalAyahs} Ayahs
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <button
                id="search-ayah-button"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all group"
              >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  Select Ayah
                </span>
              </button>
            </div>
          </div>

          {/* Ayah Selector */}
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
            <div className="space-y-6">
              {/* Arabic Text */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Ayah {selectedAyah}</span>
                  <div className="flex items-center gap-2">
                    {completedPuzzleIds.has(currentPuzzle._id.toString()) && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                <p
                  className="text-2xl md:text-3xl leading-loose text-white text-right"
                  dir="rtl"
                  style={{ fontFamily: 'var(--font-arabic, "Amiri", serif)' }}
                >
                  {cleanAyahText(
                    currentPuzzle.content?.ayahText || '',
                    parseInt(surahNumber),
                    selectedAyah
                  )}
                </p>
              </div>

              {/* Audio Player */}
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

              {/* Start Puzzle Button */}
              <Link
                href={`/puzzle/${currentPuzzle._id.toString()}`}
                className="group relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold transition-all overflow-hidden"
              >
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500 animate-pulse" />
                {/* Animated edge glow */}
                <div className="absolute inset-0 rounded-xl border-2 border-green-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] animate-shimmer" />
                <Play className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">Start Puzzle</span>
              </Link>
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
