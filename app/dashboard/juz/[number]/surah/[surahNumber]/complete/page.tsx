import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Surah, Juz, Puzzle, UserProgress, User } from '@/lib/db';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import SurahCompleteClient from './SurahCompleteClient';

export default async function SurahCompletePage({
  params,
}: {
  params: Promise<{ number: string; surahNumber: string }>;
}) {
  const { number: juzNumber, surahNumber } = await params;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check dashboard access
  const dbUser = await requireDashboardAccess();

  await connectDB();

  const juz = await Juz.findOne({ number: parseInt(juzNumber) }).lean() as any;
  const surah = await Surah.findOne({ number: parseInt(surahNumber) }).lean() as any;

  if (!juz || !surah) {
    notFound();
  }

  // Get all surahs in this juz
  const allSurahsInJuz = await Surah.find({}).lean() as any[];
  
  // Get all puzzles for this juz
  const juzPuzzles = await Puzzle.find({ juzId: juz._id })
    .populate('surahId')
    .lean() as any[];

  // Group puzzles by surah
  const surahsWithPuzzles = new Map<string, { surah: any; puzzles: any[] }>();
  
  for (const puzzle of juzPuzzles) {
    if (!puzzle.surahId) continue;
    const surahId = puzzle.surahId._id.toString();
    if (!surahsWithPuzzles.has(surahId)) {
      surahsWithPuzzles.set(surahId, { surah: puzzle.surahId, puzzles: [] });
    }
    surahsWithPuzzles.get(surahId)!.puzzles.push(puzzle);
  }

  // Get user's progress for all puzzles in juz
  const allPuzzleIds = juzPuzzles.map(p => p._id);
  const progress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: allPuzzleIds },
    status: 'COMPLETED',
  }).lean() as any[];

  const completedPuzzleIds = new Set(progress.map((p: any) => p.puzzleId.toString()));

  // Calculate completion status for each surah
  const surahProgress = Array.from(surahsWithPuzzles.entries()).map(([surahId, data]) => {
    const totalPuzzles = data.puzzles.length;
    const completedPuzzles = data.puzzles.filter(p => completedPuzzleIds.has(p._id.toString())).length;
    const isCompleted = completedPuzzles === totalPuzzles;
    
    return {
      id: surahId,
      number: data.surah.number,
      nameEnglish: data.surah.nameEnglish,
      nameArabic: data.surah.nameArabic,
      totalAyahs: totalPuzzles,
      completedAyahs: completedPuzzles,
      isCompleted,
    };
  }).sort((a, b) => a.number - b.number);

  // Check if this is the first time completing this surah
  const currentSurahPuzzles = juzPuzzles.filter(p => p.surahId?._id.toString() === surah._id.toString());
  const currentSurahCompleted = currentSurahPuzzles.every(p => completedPuzzleIds.has(p._id.toString()));

  // Calculate juz progress
  const juzTotalPuzzles = juzPuzzles.length;
  const juzCompletedPuzzles = juzPuzzles.filter(p => completedPuzzleIds.has(p._id.toString())).length;
  const juzProgressPercentage = juzTotalPuzzles > 0 ? (juzCompletedPuzzles / juzTotalPuzzles) * 100 : 0;
  const isJuzCompleted = juzCompletedPuzzles === juzTotalPuzzles;

  // Find the next surah to continue with
  const incompleteSurahs = surahProgress.filter(s => !s.isCompleted && s.number !== parseInt(surahNumber));
  const nextSurah = incompleteSurahs[0] || null;

  // Determine achievements earned
  const achievements: { id: string; name: string; icon: string; description: string }[] = [];
  
  // Check for surah-specific achievements
  if (parseInt(surahNumber) === 1) {
    achievements.push({
      id: 'surah_fatiha',
      name: 'The Opening',
      icon: '🌟',
      description: 'Completed Surah Al-Fatiha',
    });
  }

  // Check for juz completion
  if (isJuzCompleted) {
    achievements.push({
      id: 'juz_complete',
      name: `Juz ${juz.number} Master`,
      icon: '📖',
      description: `Completed all ayahs in Juz ${juz.number}`,
    });
  }

  // Check puzzle milestones
  const totalCompleted = completedPuzzleIds.size;
  if (totalCompleted >= 100 && totalCompleted < 101) {
    achievements.push({
      id: 'puzzle_100',
      name: 'Century',
      icon: '💯',
      description: 'Completed 100 puzzles',
    });
  } else if (totalCompleted >= 50 && totalCompleted < 51) {
    achievements.push({
      id: 'puzzle_50',
      name: 'Dedicated Learner',
      icon: '⭐',
      description: 'Completed 50 puzzles',
    });
  } else if (totalCompleted >= 10 && totalCompleted < 11) {
    achievements.push({
      id: 'puzzle_10',
      name: 'Getting Started',
      icon: '📚',
      description: 'Completed 10 puzzles',
    });
  }

  return (
    <SurahCompleteClient
      surah={{
        number: surah.number,
        nameEnglish: surah.nameEnglish,
        nameArabic: surah.nameArabic,
      }}
      juz={{
        number: juz.number,
        name: juz.name,
      }}
      juzProgress={{
        totalPuzzles: juzTotalPuzzles,
        completedPuzzles: juzCompletedPuzzles,
        percentage: juzProgressPercentage,
        isCompleted: isJuzCompleted,
      }}
      surahProgress={surahProgress}
      achievements={achievements}
      nextSurah={nextSurah ? {
        number: nextSurah.number,
        nameEnglish: nextSurah.nameEnglish,
      } : null}
      juzNumber={parseInt(juzNumber)}
    />
  );
}


