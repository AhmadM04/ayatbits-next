/**
 * Server-side i18n utilities
 * Load messages on the server to avoid bundling all translations in the client
 */

import { Locale, DEFAULT_LOCALE } from './i18n-config';

type Messages = Record<string, any>;

/**
 * Load messages for a specific locale (server-side only)
 */
export async function getMessages(locale: Locale = DEFAULT_LOCALE): Promise<Messages> {
  try {
    const messages = await import(`@/messages/${locale}.json`);
    return messages.default;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}, falling back to ${DEFAULT_LOCALE}`);
    try {
      const fallback = await import(`@/messages/${DEFAULT_LOCALE}.json`);
      return fallback.default;
    } catch {
      return {};
    }
  }
}

/**
 * Get locale from translation code (e.g., 'en.sahih' -> 'en')
 */
export function getLocaleFromTranslationCode(translationCode: string): Locale {
  const parts = translationCode.split('.');
  const langCode = parts[0]?.toLowerCase() || DEFAULT_LOCALE;
  
  // Map common language codes to our supported locales
  const localeMap: Record<string, Locale> = {
    'en': 'en',
    'ar': 'ar',
    'fr': 'fr',
    'es': 'es',
    'de': 'de',
    'tr': 'tr',
    'ur': 'ur',
    'id': 'id',
    'ms': 'ms',
    'bn': 'bn',
    'hi': 'hi',
    'ru': 'ru',
    'zh': 'zh',
    'ja': 'ja',
    'nl': 'nl',
  };
  
  return (localeMap[langCode] || DEFAULT_LOCALE) as Locale;
}


