import { NextRequest, NextResponse } from 'next/server';
import { withCache, CACHE_TTL } from '@/lib/cache';
import { fetchTransliteration } from '@/lib/quran-api-adapter';

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

    const cacheKey = `verse-transliteration:${surah}:${ayah}`;

    const transliterationText = await withCache(
      cacheKey,
      async () => {
        // Use Quran.com API via adapter for consistent transliteration
        const result = await fetchTransliteration(
          parseInt(surah),
          parseInt(ayah),
          { next: { revalidate: 86400 } }
        );
        return result.data?.text || '';
      },
      CACHE_TTL.DAY // Cache for 24 hours
    );

    return NextResponse.json(
      { transliteration: transliterationText },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
        },
      }
    );
  } catch (error: any) {
    console.error('Transliteration API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transliteration' },
      { status: 500 }
    );
  }
}

