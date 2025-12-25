/**
 * Server-side i18n utilities (simplified - English only)
 */

type Messages = Record<string, any>;

/**
 * Load messages (returns empty object since we use hardcoded strings now)
 */
export async function getMessages(_locale: string = 'en'): Promise<Messages> {
  return {};
}

/**
 * Get locale from translation code
 */
export function getLocaleFromTranslationCode(_translationCode: string): string {
  return 'en';
}
