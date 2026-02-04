import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { connectDB, Puzzle, UserProgress, User, LikedAyat } from '@/lib/db';
import { requireDashboardAccess } from '@/lib/dashboard-access';
import { TOTAL_MUSHAF_PAGES, getJuzForPage } from '@/lib/mushaf-utils';
import MushafPageClient from './MushafPageClient';

// Quran.com API response types
interface QuranVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  chapter_id: number;
}

interface QuranPageResponse {
  verses: QuranVerse[];
}

export default async function MushafPage({
  params,
}: {
  params: Promise<{ pageNumber: string }>;
}) {
  const { pageNumber: pageNumStr } = await params;
  const pageNumber = parseInt(pageNumStr);
  
  // Validate page number
  if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_MUSHAF_PAGES) {
    notFound();
  }

  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Check dashboard access
  const dbUser = await requireDashboardAccess();
  await connectDB();

  // Fetch page data from Quran.com API
  let verses: QuranVerse[] = [];
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=false&fields=text_uthmani,verse_key,verse_number,page_number,juz_number,hizb_number,chapter_id`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    
    if (response.ok) {
      const data: QuranPageResponse = await response.json();
      verses = data.verses || [];
    }
  } catch (error) {
    console.error('Failed to fetch Quran page:', error);
  }

  if (verses.length === 0) {
    // Fallback: try to construct from our database
    notFound();
  }

  // Get unique surah:ayah combinations for this page
  const verseKeys = verses.map(v => ({
    surahNumber: v.chapter_id,
    ayahNumber: v.verse_number,
  }));

  // Find all puzzles that match these verses
  const puzzles = await Puzzle.find({
    $or: verseKeys.map(vk => ({
      'content.surahNumber': vk.surahNumber,
      'content.ayahNumber': vk.ayahNumber,
    })),
  }).lean() as any[];

  // Create a map of surah:ayah -> puzzleId
  const puzzleMap: { [key: string]: string } = {};
  puzzles.forEach((puzzle: any) => {
    const key = `${puzzle.content?.surahNumber}:${puzzle.content?.ayahNumber}`;
    puzzleMap[key] = puzzle._id.toString();
  });

  // Get user progress for these puzzles
  const puzzleIds = puzzles.map((p: any) => p._id);
  const progress = await UserProgress.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
    status: 'COMPLETED',
  }).lean() as any[];

  const completedPuzzleIds = new Set(progress.map((p: any) => p.puzzleId.toString()));

  // Get liked ayahs
  const likes = await LikedAyat.find({
    userId: dbUser._id,
    puzzleId: { $in: puzzleIds },
  }).lean() as any[];

  const likedPuzzleIds = new Set(likes.map((l: any) => l.puzzleId.toString()));

  // Serialize verses with puzzle info
  const serializedVerses = verses.map(verse => {
    const key = `${verse.chapter_id}:${verse.verse_number}`;
    const puzzleId = puzzleMap[key] || null;
    
    return {
      id: verse.id,
      verseKey: verse.verse_key,
      surahNumber: verse.chapter_id,
      ayahNumber: verse.verse_number,
      text: verse.text_uthmani,
      pageNumber: verse.page_number,
      juzNumber: verse.juz_number,
      puzzleId,
      isCompleted: puzzleId ? completedPuzzleIds.has(puzzleId) : false,
      isLiked: puzzleId ? likedPuzzleIds.has(puzzleId) : false,
    };
  });

  // Identify surahs that start on this page (first ayah of a surah)
  const surahStarts = serializedVerses
    .filter(v => v.ayahNumber === 1)
    .map(v => v.surahNumber);

  const currentJuz = getJuzForPage(pageNumber);
  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  return (
    <MushafPageClient
      pageNumber={pageNumber}
      verses={serializedVerses}
      surahStarts={surahStarts}
      currentJuz={currentJuz}
      totalPages={TOTAL_MUSHAF_PAGES}
      selectedTranslation={selectedTranslation}
    />
  );
}


