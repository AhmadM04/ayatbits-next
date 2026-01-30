import { NextRequest, NextResponse } from 'next/server';
import { fetchTafsir, sanitizeTafsirHtml } from '@/lib/tafsir-api';
import { withCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');
    const language = searchParams.get('language') || 'en';

    if (!surah || !ayah) {
      return NextResponse.json(
        { error: 'Surah and ayah parameters are required' },
        { status: 400 }
      );
    }

    const surahNum = parseInt(surah);
    const ayahNum = parseInt(ayah);

    if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
      return NextResponse.json(
        { error: 'Invalid surah or ayah number' },
        { status: 400 }
      );
    }

    const cacheKey = `verse-tafsir:${surah}:${ayah}:${language}`;

    const tafsirData = await withCache(
      cacheKey,
      async () => {
        const result = await fetchTafsir(
          surahNum,
          ayahNum,
          language,
          { next: { revalidate: 86400 } }
        );
        
        // Sanitize HTML content
        result.data.text = sanitizeTafsirHtml(result.data.text);
        
        return result;
      },
      CACHE_TTL.DAY // Cache for 24 hours
    );

    return NextResponse.json(
      {
        tafsir: tafsirData.data.text,
        resource: tafsirData.data.resource_name,
        language: tafsirData.data.language_name,
        isFallback: tafsirData.meta?.isFallback || false,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
        },
      }
    );
  } catch (error: any) {
    console.error('Tafsir API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tafsir' },
      { status: 500 }
    );
  }
}

