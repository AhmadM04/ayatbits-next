import { NextResponse } from 'next/server';
import { connectDB, Puzzle } from '@/lib/db';
import cache, { CACHE_TTL } from '@/lib/cache';
import { fetchVerseWithChapter, fetchTranslation } from '@/lib/quran-api-adapter';

// Get a deterministic "random" index based on the date
function getDailyIndex(max: number): number {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash % max);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const translationEdition = searchParams.get('translation') || 'en.sahih';
    
    // Create cache key based on date and translation
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `daily-quote:${today}:${translationEdition}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    await connectDB();
    
    // Get total number of puzzles from database
    const totalPuzzles = await Puzzle.countDocuments();
    
    if (totalPuzzles === 0) {
      return NextResponse.json({ success: false, error: 'No puzzles found' }, { status: 404 });
    }
    
    // Get a random puzzle based on today's date
    const puzzleIndex = getDailyIndex(totalPuzzles);
    
    const puzzle = await Puzzle.findOne()
      .skip(puzzleIndex)
      .populate('surahId')
      .populate('juzId')
      .lean() as any;
    
    if (!puzzle) {
      return NextResponse.json({ success: false, error: 'No puzzle found' }, { status: 404 });
    }
    
    const surahNumber = puzzle.content?.surahNumber || puzzle.surahId?.number || 1;
    const ayahInSurah = puzzle.content?.ayahNumber || 1;
    const juzNumber = puzzle.juzId?.number || 1;
    
    // Fetch Arabic text and translation in parallel using Quran.com API
    const [arabicResponse, translationResponse] = await Promise.all([
      fetchVerseWithChapter(surahNumber, ayahInSurah, { next: { revalidate: 86400 } })
        .then(data => ({ ok: true, data }))
        .catch(() => ({ ok: false, data: null })),
      fetchTranslation(surahNumber, ayahInSurah, translationEdition, { next: { revalidate: 86400 } })
        .then(data => ({ ok: true, data }))
        .catch(() => ({ ok: false, data: null })),
    ]);
    
    let arabicText = puzzle.content?.ayahText || '';
    let surahNameArabic = puzzle.surahId?.nameArabic || '';
    let surahNameEnglish = puzzle.surahId?.nameEnglish || '';
    let translation = '';
    
    if (arabicResponse.ok && arabicResponse.data) {
      arabicText = arabicResponse.data.data?.text || arabicText;
      surahNameArabic = arabicResponse.data.data?.surah?.name || surahNameArabic;
      surahNameEnglish = arabicResponse.data.data?.surah?.englishName || surahNameEnglish;
    }
    
    if (translationResponse.ok && translationResponse.data) {
      translation = translationResponse.data.data?.text || '';
    }
    
    const responseData = {
      success: true,
      data: {
        arabicText,
        translation,
        surahNumber,
        surahNameArabic,
        surahNameEnglish,
        ayahNumber: ayahInSurah,
        juzNumber,
        puzzleId: puzzle._id.toString(),
        date: today,
      },
    };
    
    // Cache for the rest of the day (approximately)
    cache.set(cacheKey, responseData, CACHE_TTL.HOUR);
    
    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Daily quote API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch daily quote' },
      { status: 500 }
    );
  }
}
