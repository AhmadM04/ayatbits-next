/**
 * Tafsir API Adapter for QuranFoundation API
 * Provides access to Quranic explanations (tafsir) in multiple languages
 */

// QuranFoundation API base URL
const QURAN_FOUNDATION_API = 'https://api.quran.com/api/v4';

// Tafsir types
export type TafsirType = 'ibn_kathir' | 'as_saadi' | 'jalalayn' | 'muyassar';

// Tafsir resource IDs from Quran.com API v4
// https://api.quran.com/api/v4/resources/tafsirs
const TAFSIR_RESOURCE_IDS = {
  // English
  ibn_kathir_en: 169,
  as_saadi_en: 171,
  
  // Arabic
  jalalayn_ar: 168,
  muyassar_ar: 171,
  ibn_kathir_ar: 169,
  as_saadi_ar: 171,
  
  // Russian
  ibn_kathir_ru: 169, // Fallback to English
  as_saadi_ru: 171,   // Fallback to English
  
  // Urdu
  ibn_kathir_ur: 169,
  
  // Turkish
  ibn_kathir_tr: 169,
  
  // Indonesian
  ibn_kathir_id: 169,
  
  // Malay
  ibn_kathir_ms: 169,
  
  // Bengali
  ibn_kathir_bn: 169,
  
  // French
  ibn_kathir_fr: 169,
  
  // German
  ibn_kathir_de: 169,
  
  // Spanish
  ibn_kathir_es: 169,
} as const;

// Map translation codes to available tafsir types
interface TafsirOptions {
  ibn_kathir?: number;
  as_saadi?: number;
  default: number;
  language: string;
}

const TRANSLATION_TAFSIR_MAP: Record<string, TafsirOptions> = {
  // English translations
  'en': { ibn_kathir: 169, as_saadi: 171, default: 169, language: 'English' },
  'en.sahih': { ibn_kathir: 169, as_saadi: 171, default: 169, language: 'English' },
  'en.pickthall': { ibn_kathir: 169, as_saadi: 171, default: 169, language: 'English' },
  'en.yusufali': { ibn_kathir: 169, as_saadi: 171, default: 169, language: 'English' },
  
  // Arabic translations
  'ar': { ibn_kathir: 169, default: 168, language: 'Arabic' },
  'ar.jalalayn': { default: 168, language: 'Arabic' },
  'ar.tafseer': { default: 168, language: 'Arabic' },
  
  // Russian translations
  'ru': { ibn_kathir: 169, as_saadi: 171, default: 169, language: 'Russian' },
  'ru.kuliev': { ibn_kathir: 169, as_saadi: 171, default: 169, language: 'Russian' },
  
  // Urdu translations
  'ur': { ibn_kathir: 169, default: 169, language: 'Urdu' },
  'ur.maududi': { ibn_kathir: 169, default: 169, language: 'Urdu' },
  
  // Turkish translations
  'tr': { ibn_kathir: 169, default: 169, language: 'Turkish' },
  'tr.yazir': { ibn_kathir: 169, default: 169, language: 'Turkish' },
  
  // Indonesian translations
  'id': { ibn_kathir: 169, default: 169, language: 'Indonesian' },
  'id.muntakhab': { ibn_kathir: 169, default: 169, language: 'Indonesian' },
  
  // Malay translations
  'ms': { ibn_kathir: 169, default: 169, language: 'Malay' },
  'ms.basmeih': { ibn_kathir: 169, default: 169, language: 'Malay' },
  
  // Bengali translations
  'bn': { ibn_kathir: 169, default: 169, language: 'Bengali' },
  'bn.hoque': { ibn_kathir: 169, default: 169, language: 'Bengali' },
  
  // French translations
  'fr': { ibn_kathir: 169, default: 169, language: 'French' },
  'fr.hamidullah': { ibn_kathir: 169, default: 169, language: 'French' },
  
  // German translations
  'de': { ibn_kathir: 169, default: 169, language: 'German' },
  'de.bubenheim': { ibn_kathir: 169, default: 169, language: 'German' },
  
  // Spanish translations
  'es': { ibn_kathir: 169, default: 169, language: 'Spanish' },
  'es.cortes': { ibn_kathir: 169, default: 169, language: 'Spanish' },
  
  // Hindi translations
  'hi': { ibn_kathir: 169, default: 169, language: 'Hindi' },
  'hi.hindi': { ibn_kathir: 169, default: 169, language: 'Hindi' },
  
  // Chinese translations
  'zh': { ibn_kathir: 169, default: 169, language: 'Chinese' },
  'zh.chinese': { ibn_kathir: 169, default: 169, language: 'Chinese' },
  
  // Japanese translations
  'ja': { ibn_kathir: 169, default: 169, language: 'Japanese' },
  'ja.japanese': { ibn_kathir: 169, default: 169, language: 'Japanese' },
  
  // Dutch translations
  'nl': { ibn_kathir: 169, default: 169, language: 'Dutch' },
  'nl.dutch': { ibn_kathir: 169, default: 169, language: 'Dutch' },
};

// Tafsir resource names for display
const TAFSIR_NAMES: Record<number, { name: string; type: string }> = {
  169: { name: 'Tafsir Ibn Kathir', type: 'ibn_kathir' },
  168: { name: 'Tafsir al-Jalalayn', type: 'jalalayn' },
  171: { name: 'Tafsir As-Saadi', type: 'as_saadi' },
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
 * Get available tafsir options for a translation
 */
export function getAvailableTafsirs(translationCode: string): Array<{ type: TafsirType; resourceId: number; name: string }> {
  const options = TRANSLATION_TAFSIR_MAP[translationCode] || TRANSLATION_TAFSIR_MAP['en'];
  const available: Array<{ type: TafsirType; resourceId: number; name: string }> = [];
  
  if (options.ibn_kathir) {
    available.push({ 
      type: 'ibn_kathir', 
      resourceId: options.ibn_kathir, 
      name: 'Tafsir Ibn Kathir' 
    });
  }
  
  if (options.as_saadi) {
    available.push({ 
      type: 'as_saadi', 
      resourceId: options.as_saadi, 
      name: 'Tafsir As-Saadi' 
    });
  }
  
  // Always ensure at least one option is available (default)
  if (available.length === 0) {
    const defaultInfo = TAFSIR_NAMES[options.default];
    available.push({
      type: defaultInfo.type as TafsirType,
      resourceId: options.default,
      name: defaultInfo.name
    });
  }
  
  return available;
}

/**
 * Get tafsir resource ID for a given translation and tafsir type
 */
export function getTafsirResourceId(
  translationCode: string, 
  tafsirType?: TafsirType
): number {
  const options = TRANSLATION_TAFSIR_MAP[translationCode] || TRANSLATION_TAFSIR_MAP['en'];
  
  // If specific type requested, return that or default
  if (tafsirType) {
    switch (tafsirType) {
      case 'ibn_kathir':
        return options.ibn_kathir || options.default;
      case 'as_saadi':
        return options.as_saadi || options.default;
      case 'jalalayn':
        return 168; // Arabic Jalalayn
      case 'muyassar':
        return 168; // Arabic Muyassar
      default:
        return options.default;
    }
  }
  
  // Default tafsir for the translation
  return options.default;
}

/**
 * Get tafsir display name and type
 */
export function getTafsirInfo(resourceId: number): { name: string; type: string } {
  return TAFSIR_NAMES[resourceId] || { name: 'Tafsir Ibn Kathir', type: 'ibn_kathir' };
}

/**
 * Get language name for a translation code
 */
export function getLanguageName(translationCode: string): string {
  const options = TRANSLATION_TAFSIR_MAP[translationCode] || TRANSLATION_TAFSIR_MAP['en'];
  return options.language;
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
  translationCode: string = 'en',
  tafsirType?: TafsirType,
  options?: RequestInit
): Promise<TafsirResponse> {
  try {
    const resourceId = getTafsirResourceId(translationCode, tafsirType);
    const ayahKey = `${surahNumber}:${ayahNumber}`;
    
    const url = `${QURAN_FOUNDATION_API}/quran/tafsirs/${resourceId}?verse_key=${ayahKey}`;
    console.log('Fetching tafsir from:', url, { translationCode, tafsirType, resourceId });
    
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
    const languageName = getLanguageName(translationCode);
    const isNative = hasNativeTafsir(translationCode);

    return {
      data: {
        text: tafsirData.text || '',
        resource_name: tafsirInfo.name,
        language_name: languageName,
        resource_id: resourceId,
      },
      meta: {
        isFallback: !isNative,
        originalLanguage: translationCode,
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

