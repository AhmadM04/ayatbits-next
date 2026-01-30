/**
 * i18n Configuration
 */

export const DEFAULT_LOCALE = 'en';

export type Locale = 'en' | 'ar' | 'ru';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ru: 'Русский',
};

export const LOCALE_METADATA: Record<Locale, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  ru: { name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
};

export function getLocaleFromTranslation(_translationCode: string): Locale {
  return 'en';
}
