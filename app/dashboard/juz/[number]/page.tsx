import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, Juz, Surah, Puzzle, UserProgress, User } from '@/lib/db';
import mongoose from 'mongoose';
import JuzContent from './JuzContent';
import DashboardI18nProvider from '../../DashboardI18nProvider';

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

  // Get all puzzles in this juz to find unique surahs
  const puzzles = await Puzzle.find({ juzId: juz._id }).select('surahId').lean() as any;
  const uniqueSurahIds: string[] = [...new Set(puzzles.map((p: any) => p.surahId?.toString()).filter(Boolean))] as string[];
  
  // Get surahs that appear in this juz
  const surahs = await Surah.find({
    _id: { $in: uniqueSurahIds.map((id) => new mongoose.Types.ObjectId(id)) }
  }).sort({ number: 1 }).lean() as any;

  // Get puzzle counts and progress for each surah
  // Also find the starting ayah number for each surah in this juz
  const surahsWithData = await Promise.all(
    surahs.map(async (surah: any) => {
      const surahPuzzles = await Puzzle.find({ 
        juzId: juz._id,
        surahId: surah._id 
      }).sort({ 'content.ayahNumber': 1 }).lean() as any;
      
      // Get the first puzzle to find where this juz starts in the surah
      const firstPuzzle = surahPuzzles[0];
      const startAyahNumber = firstPuzzle?.content?.ayahNumber || 1;
      
      const puzzleIds = surahPuzzles.map((p: any) => p._id);
      const userProgress = await UserProgress.find({
        userId: dbUser._id,
        puzzleId: { $in: puzzleIds },
        status: 'COMPLETED',
      }).lean() as any;

      return {
        ...surah,
        puzzleCount: surahPuzzles.length,
        completedCount: userProgress.length,
        startAyahNumber,
      };
    })
  );

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
