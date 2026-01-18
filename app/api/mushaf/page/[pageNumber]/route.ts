import { NextRequest, NextResponse } from 'next/server';
import { withCache, CACHE_TTL } from '@/lib/cache';
import { connectDB, Puzzle, UserProgress, LikedAyat, User } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { TOTAL_MUSHAF_PAGES } from '@/lib/mushaf-utils';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageNumber: string }> }
) {
  try {
    const { pageNumber: pageNumStr } = await params;
    const pageNumber = parseInt(pageNumStr);

    // Validate page number
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_MUSHAF_PAGES) {
      return NextResponse.json(
        { error: 'Invalid page number. Must be between 1 and 604.' },
        { status: 400 }
      );
    }

    // Cache key for Quran API data (public, doesn't need user context)
    const cacheKey = `mushaf-page:${pageNumber}`;

    // Fetch from Quran API with caching
    const verses = await withCache(
      cacheKey,
      async () => {
        const response = await fetch(
          `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=false&fields=text_uthmani,verse_key,verse_number,page_number,juz_number,hizb_number,chapter_id`,
          { next: { revalidate: 86400 } }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch from Quran API');
        }

        const data: QuranPageResponse = await response.json();
        return data.verses || [];
      },
      CACHE_TTL.DAY
    );

    // Check if user is authenticated for user-specific data
    const user = await currentUser();
    
    let userProgress: string[] = [];
    let userLikes: string[] = [];

    if (user) {
      await connectDB();
      
      const dbUser = await User.findOne({ clerkId: user.id }).lean() as any;
      
      if (dbUser) {
        // Get verse keys for this page
        const verseKeys = verses.map((v: QuranVerse) => ({
          surahNumber: v.chapter_id,
          ayahNumber: v.verse_number,
        }));

        // Find puzzles for these verses
        const puzzles = await Puzzle.find({
          $or: verseKeys.map(vk => ({
            'content.surahNumber': vk.surahNumber,
            'content.ayahNumber': vk.ayahNumber,
          })),
        }).lean() as any[];

        const puzzleIds = puzzles.map((p: any) => p._id);

        // Get user progress
        const progress = await UserProgress.find({
          userId: dbUser._id,
          puzzleId: { $in: puzzleIds },
          status: 'COMPLETED',
        }).lean() as any[];

        // Get user likes
        const likes = await LikedAyat.find({
          userId: dbUser._id,
          puzzleId: { $in: puzzleIds },
        }).lean() as any[];

        // Create maps for quick lookup
        const puzzleMap: { [key: string]: string } = {};
        puzzles.forEach((puzzle: any) => {
          const key = `${puzzle.content?.surahNumber}:${puzzle.content?.ayahNumber}`;
          puzzleMap[key] = puzzle._id.toString();
        });

        const completedPuzzleIds = new Set(progress.map((p: any) => p.puzzleId.toString()));
        const likedPuzzleIds = new Set(likes.map((l: any) => l.puzzleId.toString()));

        // Serialize verses with puzzle info
        const enrichedVerses = verses.map((verse: QuranVerse) => {
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

        return NextResponse.json(
          {
            pageNumber,
            verses: enrichedVerses,
            surahStarts: enrichedVerses
              .filter((v: any) => v.ayahNumber === 1)
              .map((v: any) => v.surahNumber),
          },
          {
            headers: {
              'Cache-Control': 'private, max-age=60', // Shorter cache for user-specific data
            },
          }
        );
      }
    }

    // Return public data without user-specific info
    const publicVerses = verses.map((verse: QuranVerse) => ({
      id: verse.id,
      verseKey: verse.verse_key,
      surahNumber: verse.chapter_id,
      ayahNumber: verse.verse_number,
      text: verse.text_uthmani,
      pageNumber: verse.page_number,
      juzNumber: verse.juz_number,
      puzzleId: null,
      isCompleted: false,
      isLiked: false,
    }));

    return NextResponse.json(
      {
        pageNumber,
        verses: publicVerses,
        surahStarts: publicVerses
          .filter((v: any) => v.ayahNumber === 1)
          .map((v: any) => v.surahNumber),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours for public
        },
      }
    );
  } catch (error: any) {
    console.error('Mushaf API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch mushaf page' },
      { status: 500 }
    );
  }
}

