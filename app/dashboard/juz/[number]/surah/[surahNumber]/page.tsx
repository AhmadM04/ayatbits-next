import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Surah, Juz, Puzzle, UserProgress, User, LikedAyat } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, Heart } from 'lucide-react';
import VersePageClient from './VersePageClient';
import TranslationDisplay from './TranslationDisplay';
import AudioPlayer from './AudioPlayer';
import AyahSelectorClient from './AyahSelectorClient';

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
                  {currentPuzzle.content?.ayahText}
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
              />

              {/* Start Puzzle Button */}
              <Link
                href={`/puzzle/${currentPuzzle._id.toString()}`}
                className="flex items-center justify-center gap-3 w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Puzzle
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
