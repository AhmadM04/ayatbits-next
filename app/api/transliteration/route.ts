import { NextRequest, NextResponse } from 'next/server';
import { fetchTransliteration } from '@/lib/quran-api-adapter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surahParam = searchParams.get('surah');
    const ayahParam = searchParams.get('ayah');

    if (!surahParam || !ayahParam) {
      return NextResponse.json(
        { error: 'Missing surah or ayah parameter' },
        { status: 400 }
      );
    }

    const surahNumber = parseInt(surahParam, 10);
    const ayahNumber = parseInt(ayahParam, 10);

    if (isNaN(surahNumber) || isNaN(ayahNumber)) {
      return NextResponse.json(
        { error: 'Invalid surah or ayah number' },
        { status: 400 }
      );
    }

    // Fetch transliteration with caching
    const result = await fetchTransliteration(
      surahNumber,
      ayahNumber,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!result.data) {
      return NextResponse.json(
        { error: 'Transliteration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      text: result.data.text || '',
      surah: surahNumber,
      ayah: ayahNumber,
    });
  } catch (error) {
    console.error('Error in transliteration API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transliteration' },
      { status: 500 }
    );
  }
}

