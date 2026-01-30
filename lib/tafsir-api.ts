/**
 * Tafsir API Adapter for QuranFoundation API
 * Provides access to Quranic explanations (tafsir) in multiple languages
 */

// QuranFoundation API base URL
const QURAN_FOUNDATION_API = 'https://api.quran.com/api/v4';

// Map language codes to tafsir resource IDs
// Based on QuranFoundation API v4: https://api.quran.com/api/v4/resources/tafsirs
const TAFSIR_RESOURCE_MAP: Record<string, number> = {
  // English tafsirs
  'en': 169,              // Tafsir Ibn Kathir (English) - Most comprehensive
  'en.sahih': 169,
  'en.pickthall': 169,
  'en.yusufali': 169,
  
  // Arabic tafsirs
  'ar': 168,              // Tafsir al-Jalalayn (Arabic)
  'ar.jalalayn': 168,
  'ar.tafseer': 168,      // Al-Muyassar
  
  // Urdu tafsirs
  'ur': 169,              // Default to English for now
  'ur.maududi': 169,
  
  // Other languages - fallback to English Ibn Kathir
  'fr': 169,              // French
  'fr.hamidullah': 169,
  'es': 169,              // Spanish
  'es.cortes': 169,
  'de': 169,              // German
  'de.bubenheim': 169,
  'tr': 169,              // Turkish
  'tr.yazir': 169,
  'ru': 169,              // Russian
  'ru.kuliev': 169,
  'id': 169,              // Indonesian
  'id.muntakhab': 169,
  'ms': 169,              // Malay
  'ms.basmeih': 169,
  'bn': 169,              // Bengali
  'bn.hoque': 169,
  'hi': 169,              // Hindi
  'hi.hindi': 169,
  'zh': 169,              // Chinese
  'zh.chinese': 169,
  'ja': 169,              // Japanese
  'ja.japanese': 169,
  'nl': 169,              // Dutch
  'nl.dutch': 169,
};

// Tafsir resource names for display
const TAFSIR_NAMES: Record<number, { name: string; language: string }> = {
  169: { name: 'Tafsir Ibn Kathir', language: 'English' },
  168: { name: 'Tafsir al-Jalalayn', language: 'Arabic' },
};

interface TafsirResponse {
  data: {
    text: string;
    resource_name: string;
    language_name: string;
    resource_id: number;
  };
  meta?: {
    isFallback?: boolean;
    originalLanguage?: string;
  };
}

/**
 * Get tafsir resource ID for a given language
 */
export function getTafsirResourceId(languageCode: string): number {
  // Normalize language code (e.g., 'en-US' -> 'en')
  const normalizedCode = languageCode.toLowerCase().split('-')[0];
  
  // Try full code first, then normalized code, then default to English
  return TAFSIR_RESOURCE_MAP[languageCode] || 
         TAFSIR_RESOURCE_MAP[normalizedCode] || 
         169; // Default to Ibn Kathir (English)
}

/**
 * Get tafsir display name and language
 */
export function getTafsirInfo(resourceId: number): { name: string; language: string } {
  return TAFSIR_NAMES[resourceId] || { name: 'Tafsir Ibn Kathir', language: 'English' };
}

/**
 * Check if a language has native tafsir support (not just fallback)
 */
export function hasNativeTafsir(languageCode: string): boolean {
  const normalizedCode = languageCode.toLowerCase().split('-')[0];
  return normalizedCode === 'en' || normalizedCode === 'ar' || languageCode.startsWith('en.') || languageCode.startsWith('ar.');
}

/**
 * Fetch tafsir for a specific ayah from QuranFoundation API
 */
export async function fetchTafsir(
  surahNumber: number,
  ayahNumber: number,
  languageCode: string = 'en',
  options?: RequestInit
): Promise<TafsirResponse> {
  try {
    const resourceId = getTafsirResourceId(languageCode);
    const ayahKey = `${surahNumber}:${ayahNumber}`;
    
    const url = `${QURAN_FOUNDATION_API}/quran/tafsirs/${resourceId}?verse_key=${ayahKey}`;
    console.log('Fetching tafsir from:', url);
    
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error('Tafsir API error:', response.status, errorText);
      throw new Error(`Failed to fetch tafsir from QuranFoundation API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tafsir API response structure:', {
      hasTafsirs: !!data.tafsirs,
      tafsirCount: data.tafsirs?.length || 0,
      firstTafsir: data.tafsirs?.[0] ? 'exists' : 'missing'
    });
    
    const tafsirData = data.tafsirs?.[0];
    
    if (!tafsirData) {
      throw new Error(`Tafsir not found for verse ${surahNumber}:${ayahNumber} (resource ${resourceId})`);
    }

    if (!tafsirData.text) {
      console.warn('Tafsir data found but text is empty:', tafsirData);
      throw new Error(`Tafsir text is empty for verse ${surahNumber}:${ayahNumber}`);
    }

    const tafsirInfo = getTafsirInfo(resourceId);
    const isNative = hasNativeTafsir(languageCode);

    return {
      data: {
        text: tafsirData.text || '',
        resource_name: tafsirInfo.name,
        language_name: tafsirInfo.language,
        resource_id: resourceId,
      },
      meta: {
        isFallback: !isNative,
        originalLanguage: languageCode,
      },
    };
  } catch (error: any) {
    console.error('Error in fetchTafsir:', error);
    throw error;
  }
}

/**
 * Sanitize HTML content from tafsir
 * Remove potentially dangerous elements while keeping formatting
 */
export function sanitizeTafsirHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

