'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getLocaleFromTranslation } from './i18n-config';
// Only import English synchronously - most users use English
// Other translations are loaded on-demand to reduce initial bundle size
import enMessages from '../messages/en.json';

type Messages = typeof enMessages;

// Lazy-loaded messages cache
const messagesCache: Record<string, Messages> = {
  en: enMessages, // Preload English
};

// Lazy load other translations
const loadMessages = async (locale: string): Promise<Messages> => {
  if (messagesCache[locale]) {
    return messagesCache[locale];
  }

  try {
    let messages: Messages;
    switch (locale) {
      case 'zh':
        messages = (await import('../messages/zh.json')).default;
        break;
      case 'ar':
        messages = (await import('../messages/ar.json')).default;
        break;
      case 'ru':
        messages = (await import('../messages/ru.json')).default;
        break;
      case 'fr':
        messages = (await import('../messages/fr.json')).default;
        break;
      case 'es':
        messages = (await import('../messages/es.json')).default;
        break;
      case 'de':
        messages = (await import('../messages/de.json')).default;
        break;
      case 'tr':
        messages = (await import('../messages/tr.json')).default;
        break;
      case 'ur':
        messages = (await import('../messages/ur.json')).default;
        break;
      case 'id':
        messages = (await import('../messages/id.json')).default;
        break;
      case 'ms':
        messages = (await import('../messages/ms.json')).default;
        break;
      case 'bn':
        messages = (await import('../messages/bn.json')).default;
        break;
      case 'hi':
        messages = (await import('../messages/hi.json')).default;
        break;
      case 'ja':
        messages = (await import('../messages/ja.json')).default;
        break;
      case 'nl':
        messages = (await import('../messages/nl.json')).default;
        break;
      default:
        messages = enMessages;
    }
    messagesCache[locale] = messages;
    return messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error);
    return enMessages; // Fallback to English
  }
};

interface I18nContextType {
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: (key: string) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({
  children,
  translationCode,
}: {
  children: ReactNode;
  translationCode: string;
}) {
  const locale = getLocaleFromTranslation(translationCode);
  
  // Use cached messages or English as immediate fallback
  // Other locales will load asynchronously and update when ready
  const localeMessages = messagesCache[locale] || messagesCache.en;
  
  // Load non-English translations asynchronously (non-blocking)
  if (locale !== 'en' && !messagesCache[locale]) {
    loadMessages(locale).catch(() => {
      // Already handled in loadMessages
    });
  }
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = localeMessages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        let fallbackValue: any = messagesCache.en;
        for (const fk of keys) {
          fallbackValue = fallbackValue?.[fk];
        }
        if (fallbackValue === undefined) {
          console.warn('Translation not found:', key);
        }
        value = fallbackValue || key;
        break;
      }
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
