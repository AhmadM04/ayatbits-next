import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Juz, Surah, Puzzle, UserProgress, User } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Menu, Search, Moon, Lightbulb } from 'lucide-react';
import { fetchSurah } from '@/lib/quran-api';
import AyahSelectorClient from './AyahSelectorClient';
import VersePageClient from './VersePageClient';
import VerseContent from './VerseContent';

export default async function JuzSurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string; surahNumber: string }>;
  searchParams: Promise<{ ayah?: string }>;
}) {
  const { number, surahNumber } = await params;
  const { ayah } = await searchParams;
  const juzNumber = parseInt(number);
  const surahNum = parseInt(surahNumber);
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

  const juz = await Juz.findOne({ number: juzNumber }).lean() as any;
  const surah = await Surah.findOne({ number: surahNum }).lean() as any;

  if (!juz || !surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not found</h1>
          <Link href="/dashboard" className="text-green-600 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Get puzzles for this surah in this juz, sorted by ayah number
  const puzzles = await Puzzle.find({ 
    juzId: juz._id,
    surahId: surah._id 
  }).sort({ 'content.ayahNumber': 1 }).lean() as any;

  if (puzzles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No puzzles found</h1>
          <Link href={`/dashboard/juz/${juz.number}`} className="text-green-600 hover:underline">
            Go back to Juz {juz.number}
          </Link>
        </div>
      </div>
    );
  }

  // Get the selected ayah number from query params, or default to first puzzle
  const selectedAyahNumber = ayah ? parseInt(ayah) : null;
  const selectedPuzzle = selectedAyahNumber
    ? puzzles.find((p: any) => p.content.ayahNumber === selectedAyahNumber) || puzzles[0]
    : puzzles[0];
  
  const puzzleContent = selectedPuzzle.content as { 
    ayahText?: string; 
    ayahNumber?: number;
    surahNumber?: number;
  };
  
  // Get the current ayah number
  const currentAyahNumber = puzzleContent.ayahNumber || 1;
  
  // Find current puzzle index to get next and previous puzzles
  const currentPuzzleIndex = puzzles.findIndex(
    (p: any) => p.content.ayahNumber === currentAyahNumber
  );
  const nextPuzzle = currentPuzzleIndex >= 0 && currentPuzzleIndex < puzzles.length - 1
    ? {
        content: {
          ayahNumber: puzzles[currentPuzzleIndex + 1].content.ayahNumber,
        },
      }
    : null;
  const previousPuzzle = currentPuzzleIndex > 0
    ? {
        content: {
          ayahNumber: puzzles[currentPuzzleIndex - 1].content.ayahNumber,
        },
      }
    : null;
  
  // Fetch surah data from API to get the current ayah text and translation
  let ayahText = puzzleContent.ayahText || '';
  let ayahTranslation = '';
  
  // Get user's selected translation
  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';
  
  try {
    const apiSurah = await fetchSurah(surahNum);
    const currentAyah = apiSurah.ayahs.find((a: any) => a.numberInSurah === currentAyahNumber);
    if (currentAyah) {
      ayahText = currentAyah.text;
      // Get translation using user's selected translation
      const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${selectedTranslation}`);
      if (translationResponse.ok) {
        const translationData = await translationResponse.json();
        const translatedAyah = translationData.data.ayahs.find((a: any) => a.number === currentAyah.number);
        if (translatedAyah) {
          ayahTranslation = translatedAyah.text;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching surah data:', error);
  }

  // Calculate progress
  const puzzleIds = puzzles.map((p: any) => p._id);
  const userProgress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
    status: 'COMPLETED',
  }).lean() as any;

  const completedCount = userProgress.length;
  const progressPercentage = puzzles.length > 0 ? Math.round((completedCount / puzzles.length) * 100) : 0;

  // Get user progress for all puzzles
  const allUserProgress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
  }).lean() as any;

  const progressMap = new Map(
    allUserProgress.map((p: any) => [p.puzzleId.toString(), p.status === 'COMPLETED'])
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/dashboard/juz/${juz.number}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-semibold text-gray-900" dir="rtl">{surah.nameArabic}</h1>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            {/* Desktop: Individual Icons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                id="search-ayah-button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Search Ayah"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Moon className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Lightbulb className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Mobile: Burger Menu */}
            <button
              id="search-ayah-button-mobile"
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <VersePageClient translationCode={selectedTranslation}>
        <VerseContent
          ayahText={ayahText}
          currentAyahNumber={currentAyahNumber}
          surahNum={surahNum}
          selectedTranslation={selectedTranslation}
          initialTranslation={ayahTranslation}
          puzzleId={selectedPuzzle._id.toString()}
          previousPuzzle={previousPuzzle}
          nextPuzzle={nextPuzzle}
          juzNumber={juz.number}
          surahNumber={surah.number}
        />
        {/* Ayah Selector Modal */}
        <AyahSelectorClient
          puzzles={puzzles.map((p: any) => ({
            _id: p._id.toString(),
            content: {
              ayahNumber: p.content.ayahNumber,
            },
          }))}
          currentAyahNumber={currentAyahNumber}
          juzNumber={juzNumber}
          surahNumber={surahNum}
        />
      </VersePageClient>
    </div>
  );
}

