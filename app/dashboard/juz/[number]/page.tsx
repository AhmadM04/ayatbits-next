import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Juz, Surah, Puzzle, UserProgress } from '@/lib/db';
import mongoose from 'mongoose';
import JuzContent from './JuzContent';
import DashboardI18nProvider from '../../DashboardI18nProvider';
import { requireDashboardAccess } from '@/lib/dashboard-access';

export default async function JuzPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const juzNumber = parseInt(number);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check dashboard access (redirects if no access, except admin bypass)
  const dbUser = await requireDashboardAccess();

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';
  const juz = await Juz.findOne({ number: juzNumber }).lean() as any;

  if (!juz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Juz not found</h1>
          <a href="/dashboard" className="text-green-600 hover:underline">
            Go back to dashboard
          </a>
        </div>
      </div>
    );
  }

  // OPTIMIZED: Fetch all puzzles in this juz with necessary fields in ONE query
  const allJuzPuzzles = await Puzzle.find({ juzId: juz._id })
    .select('_id surahId content.ayahNumber')
    .sort({ 'content.ayahNumber': 1 })
    .lean() as any;
  
  const uniqueSurahIds: string[] = [...new Set(allJuzPuzzles.map((p: any) => p.surahId?.toString()).filter(Boolean))] as string[];
  
  // Get surahs that appear in this juz
  const surahs = await Surah.find({
    _id: { $in: uniqueSurahIds.map((id) => new mongoose.Types.ObjectId(id)) }
  }).sort({ number: 1 }).lean() as any;

  // OPTIMIZED: Fetch all user progress for this juz in ONE query
  const allPuzzleIds = allJuzPuzzles.map((p: any) => p._id);
  const allUserProgress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: allPuzzleIds },
    status: 'COMPLETED',
  }).select('puzzleId').lean() as any[];
  
  // Create a set of completed puzzle IDs for fast lookup
  const completedPuzzleIds = new Set(
    allUserProgress.map((p: any) => p.puzzleId?.toString()).filter(Boolean)
  );

  // Group puzzles by surah in memory
  const puzzlesBySurah = allJuzPuzzles.reduce((acc: any, puzzle: any) => {
    const surahId = puzzle.surahId?.toString();
    if (!surahId) return acc;
    if (!acc[surahId]) acc[surahId] = [];
    acc[surahId].push(puzzle);
    return acc;
  }, {});

  // Process surah data in memory (no database queries in loop)
  const surahsWithData = surahs.map((surah: any) => {
    const surahId = surah._id.toString();
    const surahPuzzles = puzzlesBySurah[surahId] || [];
    
    // Get the first puzzle to find where this juz starts in the surah
    const firstPuzzle = surahPuzzles[0];
    const startAyahNumber = firstPuzzle?.content?.ayahNumber || 1;
    
    // Count completed puzzles for this surah
    const completedCount = surahPuzzles.filter((p: any) => 
      completedPuzzleIds.has(p._id.toString())
    ).length;

    return {
      ...surah,
      puzzleCount: surahPuzzles.length,
      completedCount,
      startAyahNumber,
    };
  });

  const serializedSurahs = surahsWithData.map((surah: any) => ({
    _id: surah._id.toString(),
    number: surah.number,
    nameEnglish: surah.nameEnglish,
    nameArabic: surah.nameArabic,
    puzzleCount: surah.puzzleCount,
    completedCount: surah.completedCount,
    startAyahNumber: surah.startAyahNumber,
  }));

  return (
    <DashboardI18nProvider translationCode={selectedTranslation}>
      <JuzContent
        juzName={juz.name}
        surahs={serializedSurahs}
        juzNumber={juz.number}
      />
    </DashboardI18nProvider>
  );
}
