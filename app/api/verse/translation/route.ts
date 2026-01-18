import { NextRequest, NextResponse } from 'next/server';
import { withCache, CACHE_TTL } from '@/lib/cache';
import { fetchTranslation } from '@/lib/quran-api-adapter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');
    const translation = searchParams.get('translation') || 'en.sahih';

    if (!surah || !ayah) {
      return NextResponse.json(
        { error: 'Surah and ayah parameters are required' },
        { status: 400 }
      );
    }

    const cacheKey = `verse-translation:${surah}:${ayah}:${translation}`;

    const translationText = await withCache(
      cacheKey,
      async () => {
        // Use Quran.com API via adapter for consistent Uthmani text
        const result = await fetchTranslation(
          parseInt(surah),
          parseInt(ayah),
          translation,
          { next: { revalidate: 86400 } }
        );
        return result.data?.text || '';
      },
      CACHE_TTL.DAY // Cache for 24 hours
    );

    return NextResponse.json(
      { translation: translationText },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
        },
      }
    );
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch translation' },
      { status: 500 }
    );
  }
}







