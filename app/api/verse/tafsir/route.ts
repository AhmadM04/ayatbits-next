import { NextRequest, NextResponse } from 'next/server';
import { fetchTafsir, sanitizeTafsirHtml, TafsirType, getAvailableTafsirs } from '@/lib/tafsir-api';
import { withCache, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');
    const translationCode = searchParams.get('translation') || 'en';
    const tafsirType = searchParams.get('tafsir_type') as TafsirType | null;

    // Special endpoint to get available tafsirs for a translation
    if (searchParams.get('get_options') === 'true') {
      const options = getAvailableTafsirs(translationCode);
      return NextResponse.json(
        { options },
        {
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        }
      );
    }

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

    const cacheKey = `verse-tafsir:${surah}:${ayah}:${translationCode}:${tafsirType || 'default'}`;

    const tafsirData = await withCache(
      cacheKey,
      async () => {
        const result = await fetchTafsir(
          surahNum,
          ayahNum,
          translationCode,
          tafsirType || undefined,
          { next: { revalidate: 86400 } }
        );
        
        // Validate response structure
        if (!result || !result.data) {
          throw new Error('Invalid tafsir response structure');
        }
        
        // Sanitize HTML content if it exists
        if (result.data.text) {
          result.data.text = sanitizeTafsirHtml(result.data.text);
        }
        
        return result;
      },
      CACHE_TTL.DAY // Cache for 24 hours
    );

    // Validate final data structure before returning
    if (!tafsirData || !tafsirData.data || !tafsirData.data.text) {
      throw new Error('Tafsir data not available for this verse');
    }

    return NextResponse.json(
      {
        tafsir: tafsirData.data.text,
        resource: tafsirData.data.resource_name || 'Unknown',
        language: tafsirData.data.language_name || 'Unknown',
        isFallback: tafsirData.meta?.isFallback || false,
        tafsirType: tafsirType || 'default',
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

