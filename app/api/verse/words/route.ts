import { NextRequest, NextResponse } from 'next/server';
import { withCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');

    if (!surah || !ayah) {
      return NextResponse.json(
        { error: 'Surah and ayah parameters are required' },
        { status: 400 }
      );
    }

    const cacheKey = `verse-words:${surah}:${ayah}`;

    const wordsData = await withCache(
      cacheKey,
      async () => {
        // Use Quran.com API v4 for word-by-word data
        const response = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=transliteration,text_uthmani`,
          {
            next: { revalidate: 86400 }, // Cache for 24 hours
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch word data');
        }

        const data = await response.json();
        
        // Extract words with their transliterations
        const words = data.verse?.words || [];
        return words.map((word: any) => ({
          text: word.text_uthmani || '',
          transliteration: word.transliteration?.text || '',
        }));
      },
      CACHE_TTL.DAY // Cache for 24 hours
    );

    return NextResponse.json(
      { words: wordsData },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
        },
      }
    );
  } catch (error: any) {
    console.error('Word-by-word API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch word data' },
      { status: 500 }
    );
  }
}

