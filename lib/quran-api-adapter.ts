/**
 * Adapter to use Quran.com API but return data in AlQuran.cloud format
 * This ensures consistency in Uthmani text across the app
 */

// Quran.com API base URL
const QURAN_COM_API = 'https://api.quran.com/api/v4';

// Map AlQuran.cloud translation identifiers to Quran.com resource IDs
const TRANSLATION_MAP: Record<string, number> = {
  'en.sahih': 131,        // Saheeh International
  'en.pickthall': 19,     // Pickthall
  'en.yusufali': 22,      // Yusuf Ali
  'en.hilali': 18,        // Hilali & Khan
  'ar.muyassar': 48,      // Arabic Tafsir Muyassar
  // Add more mappings as needed
};

interface AlQuranCloudFormat {
  data: {
    text: string;
    numberInSurah?: number;
    surah?: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
    };
    audio?: string;
  };
}

/**
 * Fetch Uthmani text for a verse from Quran.com
 * Returns data in AlQuran.cloud format for compatibility
 */
export async function fetchUthmaniVerse(
  surahNumber: number,
  ayahNumber: number,
  options?: RequestInit
): Promise<AlQuranCloudFormat> {
  const response = await fetch(
    `${QURAN_COM_API}/verses/by_key/${surahNumber}:${ayahNumber}?` +
    `fields=text_uthmani&` +
    `translations=false`,
    options
  );

  if (!response.ok) {
    throw new Error('Failed to fetch verse from Quran.com');
  }

  const data = await response.json();
  const verse = data.verse;

  // Transform to AlQuran.cloud format
  return {
    data: {
      text: verse.text_uthmani || '',
      numberInSurah: verse.verse_number,
      surah: verse.chapter ? {
        number: verse.chapter.id,
        name: verse.chapter.name_arabic || '',
        englishName: verse.chapter.name_simple || '',
        englishNameTranslation: verse.chapter.translated_name?.name || '',
        numberOfAyahs: verse.chapter.verses_count || 0,
      } : undefined,
    },
  };
}

/**
 * Fetch translation for a verse from Quran.com
 * Returns data in AlQuran.cloud format for compatibility
 */
export async function fetchTranslation(
  surahNumber: number,
  ayahNumber: number,
  translationId: string = 'en.sahih',
  options?: RequestInit
): Promise<AlQuranCloudFormat> {
  // Map AlQuran.cloud ID to Quran.com resource ID
  const resourceId = TRANSLATION_MAP[translationId] || 131; // Default to Saheeh International

  const response = await fetch(
    `${QURAN_COM_API}/verses/by_key/${surahNumber}:${ayahNumber}?` +
    `translations=${resourceId}&` +
    `fields=text_uthmani`,
    options
  );

  if (!response.ok) {
    throw new Error('Failed to fetch translation from Quran.com');
  }

  const data = await response.json();
  const verse = data.verse;
  const translation = verse.translations?.[0];

  return {
    data: {
      text: translation?.text || '',
      numberInSurah: verse.verse_number,
    },
  };
}

/**
 * Fetch word-by-word transliteration from Quran.com
 * Returns sentence-style transliteration like AlQuran.cloud
 */
export async function fetchTransliteration(
  surahNumber: number,
  ayahNumber: number,
  options?: RequestInit
): Promise<AlQuranCloudFormat> {
  const response = await fetch(
    `${QURAN_COM_API}/verses/by_key/${surahNumber}:${ayahNumber}?` +
    `words=true&` +
    `word_fields=transliteration`,
    options
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transliteration from Quran.com');
  }

  const data = await response.json();
  const words = data.verse?.words || [];
  
  // Combine word transliterations into a sentence (like AlQuran.cloud does)
  const transliterationText = words
    .filter((w: any) => w.char_type_name !== 'end')
    .map((w: any) => w.transliteration?.text || '')
    .join(' ');

  return {
    data: {
      text: transliterationText,
      numberInSurah: data.verse?.verse_number,
    },
  };
}

/**
 * Get audio URL for a verse
 * Uses the same everyayah.com source as AlQuran.cloud
 */
export function getAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  reciter: 'alafasy' | 'husary' = 'alafasy'
): string {
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  const paddedAyah = ayahNumber.toString().padStart(3, '0');
  
  const reciterMap = {
    alafasy: 'Alafasy_128kbps',
    husary: 'Husary_128kbps',
  };
  
  return `https://everyayah.com/data/${reciterMap[reciter]}/${paddedSurah}${paddedAyah}.mp3`;
}

/**
 * Fetch verse with chapter info from Quran.com
 * Includes surah metadata in AlQuran.cloud format
 */
export async function fetchVerseWithChapter(
  surahNumber: number,
  ayahNumber: number,
  options?: RequestInit
): Promise<AlQuranCloudFormat> {
  const [verseResponse, chapterResponse] = await Promise.all([
    fetch(
      `${QURAN_COM_API}/verses/by_key/${surahNumber}:${ayahNumber}?fields=text_uthmani`,
      options
    ),
    fetch(
      `${QURAN_COM_API}/chapters/${surahNumber}`,
      options
    ),
  ]);

  if (!verseResponse.ok || !chapterResponse.ok) {
    throw new Error('Failed to fetch verse data from Quran.com');
  }

  const verseData = await verseResponse.json();
  const chapterData = await chapterResponse.json();
  const verse = verseData.verse;
  const chapter = chapterData.chapter;

  return {
    data: {
      text: verse.text_uthmani || '',
      numberInSurah: verse.verse_number,
      surah: {
        number: chapter.id,
        name: chapter.name_arabic || '',
        englishName: chapter.name_simple || '',
        englishNameTranslation: chapter.translated_name?.name || '',
        numberOfAyahs: chapter.verses_count || 0,
      },
    },
  };
}

