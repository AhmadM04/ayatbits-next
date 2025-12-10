import { NextRequest, NextResponse } from 'next/server';
import { withCache, CACHE_TTL } from '@/lib/cache';

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
        // Use single ayah endpoint - much faster than fetching entire surah
        const response = await fetch(
          `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${translation}`,
          {
            next: { revalidate: 86400 }, // Cache for 24 hours
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch translation');
        }

        const data = await response.json();
        return data.data?.text || '';
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


