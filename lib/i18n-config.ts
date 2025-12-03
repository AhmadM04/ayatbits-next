/**
 * i18n Configuration
 * Maps Quran translation codes to app locale codes
 */

export const TRANSLATION_TO_LOCALE: Record<string, string> = {
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
  'ar.jalalayn': 'ar',
  'ar.tafseer': 'ar',
  'fr.hamidullah': 'fr',
  'es.cortes': 'es',
  'de.bubenheim': 'de',
  'tr.yazir': 'tr',
  'tr.diyanet': 'tr',
  'ur.maududi': 'ur',
  'ur.ahmedraza': 'ur',
  'id.muntakhab': 'id',
  'id.indonesian': 'id',
  'ms.basmeih': 'ms',
  'bn.hoque': 'bn',
  'hi.hindi': 'hi',
  'ru.kuliev': 'ru',
  'zh.chinese': 'zh',
  'ja.japanese': 'ja',
  'nl.dutch': 'nl',
};

export const SUPPORTED_LOCALES = ['en', 'ar', 'fr', 'es', 'de', 'tr', 'ur', 'id', 'ms', 'bn', 'hi', 'ru', 'zh', 'ja', 'nl'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Get locale code from translation code
 */
export function getLocaleFromTranslation(translationCode: string): Locale {
  const locale = TRANSLATION_TO_LOCALE[translationCode];
  return (locale && SUPPORTED_LOCALES.includes(locale as Locale)) ? locale as Locale : DEFAULT_LOCALE;
}

