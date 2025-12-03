/**
 * i18n Configuration
 * Maps Quran translation codes to app locale codes
 */

export const TRANSLATION_TO_LOCALE: Record<string, string> = {
  // English translations
  'en.sahih': 'en',
  'en.pickthall': 'en',
  'en.yusufali': 'en',
  'en.khan': 'en',
  'en.shakir': 'en',
  'en.ghali': 'en',
  'en.ahmedali': 'en',
  'en.arberry': 'en',
  'en.daryabadi': 'en',
  'en.maulana': 'en',
  'en.hilali': 'en',
  'en.maududi': 'en',
  
  // Arabic translations
  'ar.jalalayn': 'ar',
  'ar.tafseer': 'ar',
  'ar.muyassar': 'ar',
  
  // French
  'fr.hamidullah': 'fr',
  
  // Spanish
  'es.cortes': 'es',
  
  // German
  'de.bubenheim': 'de',
  'de.aburida': 'de',
  
  // Turkish
  'tr.yazir': 'tr',
  'tr.diyanet': 'tr',
  
  // Urdu
  'ur.maududi': 'ur',
  'ur.ahmedraza': 'ur',
  'ur.jalandhry': 'ur',
  
  // Indonesian
  'id.muntakhab': 'id',
  'id.indonesian': 'id',
  
  // Malay
  'ms.basmeih': 'ms',
  
  // Bengali
  'bn.bengali': 'bn',
  'bn.hoque': 'bn',
  
  // Hindi
  'hi.hindi': 'hi',
  
  // Russian
  'ru.kuliev': 'ru',
  
  // Chinese
  'zh.chinese': 'zh',
  'zh.majian': 'zh',
  
  // Japanese
  'ja.japanese': 'ja',
  
  // Dutch
  'nl.dutch': 'nl',
  'nl.keyzer': 'nl',
};

export const SUPPORTED_LOCALES = ['en', 'ar', 'fr', 'es', 'de', 'tr', 'ur', 'id', 'ms', 'bn', 'hi', 'ru', 'zh', 'ja', 'nl'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Get locale code from translation code
 * Falls back to DEFAULT_LOCALE if not found
 */
export function getLocaleFromTranslation(translationCode: string): Locale {
  // First check if it's already a locale
  if (SUPPORTED_LOCALES.includes(translationCode as Locale)) {
    return translationCode as Locale;
  }
  
  // Otherwise, look up the translation code
  const locale = TRANSLATION_TO_LOCALE[translationCode];
  return (locale && SUPPORTED_LOCALES.includes(locale as Locale)) ? locale as Locale : DEFAULT_LOCALE;
}
