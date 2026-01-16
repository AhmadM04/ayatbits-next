// Quran.com API integration for word-by-word audio

import { 
  AyahAudioSegments, 
  WordSegment, 
  QuranComResponse,
  QuranComAudioSegment 
} from '@/lib/types/word-audio';

const QURAN_API_BASE = 'https://api.quran.com/api/v4';
const ALAFASY_RECITER_ID = 7; // Alafasy reciter ID on Quran.com

// In-memory cache for audio segments
const segmentsCache = new Map<string, AyahAudioSegments>();

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
  
  // Check cache first
  if (segmentsCache.has(cacheKey)) {
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
    console.log('Quran.com API response for', verseKey, ':', data);

    // Extract audio URL from the verse (for reference)
    const audioUrl = data.verse.audio?.url || '';

    // Map words to segments using individual word audio URLs
    const segments: WordSegment[] = data.verse.words
      .filter(word => word.char_type_name === 'word') // Filter out non-word characters
      .map((word, index) => {
        let wordAudioUrl = word.audio_url || '';
        
        // Fix relative URLs - Quran.com returns relative paths that need the base URL
        if (wordAudioUrl && !wordAudioUrl.startsWith('http')) {
          wordAudioUrl = `https://verses.quran.com/${wordAudioUrl}`;
        }
        
        // Debug: Log if audio URL is missing
        if (!wordAudioUrl) {
          console.warn(`Missing audio URL for word at position ${word.position}:`, word.text_uthmani || word.text);
        }
        
        return {
          position: index,
          text: word.text_uthmani || word.text,
          audioUrl: wordAudioUrl,
          startTime: 0, // Not needed for individual word audio
          endTime: 0,   // Not needed for individual word audio
        };
      });
    
    // Debug: Log the first segment to verify structure
    if (segments.length > 0) {
      console.log('Sample word audio URL (after fix):', segments[0].audioUrl);
    }

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
  if (wordIndex < 0 || wordIndex >= segments.segments.length) {
    return null;
  }
  return segments.segments[wordIndex];
}

