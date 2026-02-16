import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, Puzzle, UserProgress, LikedAyat, User } from '@/lib/db';
import { fetchTranslation } from '@/lib/quran-api-adapter';
import { getCachedSurahVerses } from '@/lib/quran-data';
import { cleanAyahText } from '@/lib/ayah-utils';

/**
 * Lightweight API route for Ayah transitions
 * Returns only the essential JSON data needed to render an Ayah
 * Uses .lean() for faster Mongoose queries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const juzNumber = searchParams.get('juz');
    const surahNumber = searchParams.get('surah');
    const ayahNumber = searchParams.get('ayah');

    // Validate params
    if (!juzNumber || !surahNumber || !ayahNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters: juz, surah, ayah' },
        { status: 400 }
      );
    }

    // Auth check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const juzNum = parseInt(juzNumber);
    const surahNum = parseInt(surahNumber);
    const ayahNum = parseInt(ayahNumber);

    // ========================================================================
    // OPTIMIZATION: Parallel data fetching with .lean()
    // ========================================================================
    const [cachedData, dbUser] = await Promise.all([
      getCachedSurahVerses(juzNum, surahNum),
      User.findOne({ clerkUserId: user.id })
        .select('selectedTranslation enableWordByWordAudio subscriptionPlan')
        .lean(),
    ]);

    if (!cachedData || !dbUser) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { juz, surah, puzzles } = cachedData;

    // Find current puzzle
    const currentPuzzle = puzzles.find((p: any) => p.ayahNumber === ayahNum);
    const currentIndex = puzzles.findIndex((p: any) => p.ayahNumber === ayahNum);

    if (!currentPuzzle) {
      return NextResponse.json({ error: 'Ayah not found' }, { status: 404 });
    }

    const previousPuzzle = currentIndex > 0 ? puzzles[currentIndex - 1] : null;
    const nextPuzzle = currentIndex < puzzles.length - 1 ? puzzles[currentIndex + 1] : null;

    // Get puzzle IDs for parallel queries
    const puzzleIds = puzzles.map((p: any) => p._id);

    // ========================================================================
    // OPTIMIZATION: Parallel fetch with .lean() (no hydration overhead)
    // ========================================================================
    const [totalPuzzlesInSurah, progress, likedAyahs, translationResult, pageResult] = 
      await Promise.allSettled([
        Puzzle.countDocuments({ surahId: surah._id }),
        UserProgress.find({
          userId: dbUser._id,
          puzzleId: { $in: puzzleIds },
          status: 'COMPLETED',
        })
          .select('puzzleId')
          .lean(), // ← .lean() for performance
        LikedAyat.find({
          userId: dbUser._id,
          puzzleId: { $in: puzzleIds },
        })
          .select('puzzleId')
          .lean(), // ← .lean() for performance
        fetchTranslation(
          surahNum,
          ayahNum,
          dbUser.selectedTranslation || 'en.sahih',
          { next: { revalidate: 86400 } }
        ),
        fetch(
          `https://api.quran.com/api/v4/verses/by_key/${surahNum}:${ayahNum}?fields=page_number`,
          { next: { revalidate: 86400 } }
        ).then(res => res.ok ? res.json() : null),
      ]);

    // Extract results with fallbacks
    const totalAyahs = totalPuzzlesInSurah.status === 'fulfilled' ? totalPuzzlesInSurah.value : 0;
    const completedPuzzleIds = progress.status === 'fulfilled'
      ? new Set(progress.value.map((p: any) => p.puzzleId.toString()))
      : new Set();
    const likedPuzzleIds = likedAyahs.status === 'fulfilled'
      ? new Set(likedAyahs.value.map((l: any) => l.puzzleId.toString()))
      : new Set();
    const translation = translationResult.status === 'fulfilled'
      ? translationResult.value?.data?.text || ''
      : '';
    const mushafPageNumber = pageResult.status === 'fulfilled'
      ? pageResult.value?.verse?.page_number || null
      : null;

    const completedAyahs = completedPuzzleIds.size;
    const progressPercentage = totalAyahs > 0 ? (completedAyahs / totalAyahs) * 100 : 0;

    // Clean ayah text
    const ayahText = cleanAyahText(currentPuzzle.ayahText || '', surahNum, ayahNum);

    // ========================================================================
    // Return minimal JSON payload (fast!)
    // ========================================================================
    return NextResponse.json({
      success: true,
      data: {
        // Ayah data
        ayahText,
        ayahNumber: ayahNum,
        translation,
        mushafPageNumber,
        
        // Puzzle info
        puzzleId: currentPuzzle._id.toString(),
        isMemorized: completedPuzzleIds.has(currentPuzzle._id.toString()),
        isLiked: likedPuzzleIds.has(currentPuzzle._id.toString()),
        
        // Navigation
        previousAyah: previousPuzzle?.ayahNumber || null,
        nextAyah: nextPuzzle?.ayahNumber || null,
        
        // Progress
        completedAyahs,
        totalAyahs,
        progressPercentage,
        
        // Surah info
        surahName: surah.nameEnglish,
        surahNameArabic: surah.nameArabic,
        juzNumber: juz.number,
        
        // User settings
        selectedTranslation: dbUser.selectedTranslation || 'en.sahih',
        enableWordByWordAudio: dbUser.enableWordByWordAudio || false,
        subscriptionPlan: dbUser.subscriptionPlan,
        
        // All puzzles for ayah selector
        puzzles: puzzles.map((p: any) => ({
          id: p._id.toString(),
          ayahNumber: p.ayahNumber || 1,
          isCompleted: completedPuzzleIds.has(p._id.toString()),
          isLiked: likedPuzzleIds.has(p._id.toString()),
        })),
      },
    });

  } catch (error) {
    console.error('[API /api/ayah] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

