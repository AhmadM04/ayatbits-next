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

    const cacheKey = `verse-transliteration:${surah}:${ayah}`;

    const transliterationText = await withCache(
      cacheKey,
      async () => {
        // Use single ayah endpoint with transliteration edition
        const response = await fetch(
          `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.transliteration`,
          {
            next: { revalidate: 86400 }, // Cache for 24 hours
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch transliteration');
        }

        const data = await response.json();
        return data.data?.text || '';
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

