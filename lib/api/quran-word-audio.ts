// Quran.com API integration for word-by-word audio
// PERFORMANCE FIX: This cache is kept OUTSIDE of any reactive state (Redux/Zustand)
// to avoid expensive Immer proxy wrapping on large datasets

import { 
  AyahAudioSegments, 
  WordSegment, 
  QuranComResponse,
  QuranComAudioSegment 
} from '@/lib/types/word-audio';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const ALAFASY_RECITER_ID = 7; // Alafasy reciter ID on Quran.com

// PERFORMANCE: Static in-memory cache (NOT in Redux/Zustand/React state)
// This prevents Immer from wrapping large audio timing datasets in expensive Proxies
const segmentsCache = new Map<string, AyahAudioSegments>();

// PERFORMANCE: Conditional logging - only in development
const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : (..._args: any[]) => {};

/**
 * Get cache key for a verse
 */
function getCacheKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

/**
 * Fetch word-level audio segments from Quran.com API
 */
export async function fetchWordSegments(
  surahNumber: number,
  ayahNumber: number
): Promise<AyahAudioSegments | null> {
  const cacheKey = getCacheKey(surahNumber, ayahNumber);
  
  log('🎵 fetchWordSegments called for', surahNumber, ':', ayahNumber);
  
  // Check cache first
  if (segmentsCache.has(cacheKey)) {
    log('📦 Using cached segments');
    return segmentsCache.get(cacheKey)!;
  }

  try {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const url = `${QURAN_API_BASE}/verses/by_key/${verseKey}?` +
      `words=true&` +
      `audio=${ALAFASY_RECITER_ID}&` +
      `fields=text_uthmani&` +
      `word_fields=text_uthmani,audio_url`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch word segments: ${response.status}`);
      return null;
    }

    const data: QuranComResponse = await response.json();
    
    if (!data.verse || !data.verse.words) {
      console.error('Invalid response structure from Quran.com API');
      return null;
    }

    // Debug: Log the full response to understand structure
    log('Quran.com API response for', verseKey, ':', {
      totalWords: data.verse.words.length,
      wordTypes: data.verse.words.map(w => ({ pos: w.position, type: w.char_type_name, text: w.text_uthmani })),
    });

    // Extract audio URL from the verse (for reference)
    const audioUrl = data.verse.audio?.url || '';

    // Map words to segments using individual word audio URLs
    // Use sequential array index as position (0, 1, 2, 3...) for easy lookup
    const segments: WordSegment[] = data.verse.words
      .filter(word => word.char_type_name === 'word') // Filter out non-word characters
      .map((word, index) => {
        // Reconstruct the audio URL based on the filtered index position
        // The API's audio_url can be incorrect because it includes pause marks in positions
        // Format: wbw/{surah}_{ayah}_{wordNumber}.mp3 (all zero-padded to 3 digits)
        const paddedSurah = surahNumber.toString().padStart(3, '0');
        const paddedAyah = ayahNumber.toString().padStart(3, '0');
        const paddedWord = (index + 1).toString().padStart(3, '0'); // 1-based word number
        const wordAudioUrl = `https://verses.quran.com/wbw/${paddedSurah}_${paddedAyah}_${paddedWord}.mp3`;
        
        // Debug: Log word mapping
        log(`Word ${index}: text=${word.text_uthmani}, audioURL=${wordAudioUrl}`);
        
        return {
          position: index, // Use 0-based array index for easy lookup
          text: word.text_uthmani || word.text,
          audioUrl: wordAudioUrl,
          startTime: 0, // Not needed for individual word audio
          endTime: 0,   // Not needed for individual word audio
        };
      });
    
    // Debug: Log summary
    log(`Loaded ${segments.length} word segments for ${verseKey}`);

    const result: AyahAudioSegments = {
      surahNumber,
      ayahNumber,
      segments,
      audioUrl,
    };

    // Cache the result
    segmentsCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching word segments:', error);
    return null;
  }
}

/**
 * Clear the segments cache (useful for memory management)
 */
export function clearSegmentsCache(): void {
  segmentsCache.clear();
}

/**
 * Get a specific word segment
 */
export function getWordSegment(
  segments: AyahAudioSegments,
  wordIndex: number
): WordSegment | null {
  log('🔍 getWordSegment called:', {
    requestedIndex: wordIndex,
    totalSegments: segments.segments.length,
    allSegments: segments.segments.map(s => ({ pos: s.position, text: s.text, url: s.audioUrl }))
  });
  
  if (wordIndex < 0 || wordIndex >= segments.segments.length) {
    if (DEBUG) console.error(`❌ Index ${wordIndex} out of bounds (0-${segments.segments.length - 1})`);
    return null;
  }
  
  const segment = segments.segments[wordIndex];
  log('✅ Found segment:', segment);
  return segment;
}

