'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getLocaleFromTranslation } from './i18n-config';
// Dynamically import English to avoid blocking initial render
// This allows the page to render immediately, then load translations
import type enMessagesType from '../messages/en.json';
type Messages = typeof enMessagesType;

let enMessagesPromise: Promise<Messages> | null = null;
const loadEnMessages = async (): Promise<Messages> => {
  if (!enMessagesPromise) {
    enMessagesPromise = import('../messages/en.json').then(m => m.default);
  }
  return enMessagesPromise;
};
// Preload English immediately but don't block
loadEnMessages();

// Lazy-loaded messages cache
const messagesCache: Record<string, Messages> = {};

// Lazy load translations (including English)
const loadMessages = async (locale: string): Promise<Messages> => {
  if (messagesCache[locale]) {
    return messagesCache[locale];
  }

  try {
    let messages: Messages;
    switch (locale) {
      case 'en':
        messages = await loadEnMessages();
        break;
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
        messages = await loadEnMessages();
    }
    messagesCache[locale] = messages;
    return messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error);
    return await loadEnMessages(); // Fallback to English
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
  const [messages, setMessages] = useState<Messages | null>(messagesCache[locale] || null);
  
  // Load messages asynchronously (non-blocking)
  useEffect(() => {
    if (!messagesCache[locale]) {
      loadMessages(locale).then((loadedMessages) => {
        setMessages(loadedMessages);
      }).catch(() => {
        // Fallback handled in loadMessages
      });
    }
  }, [locale]);
  
  // Use cached messages or fallback to key
  const localeMessages = messages || messagesCache[locale] || {};
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = localeMessages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if available
        let fallbackValue: any = messagesCache.en;
        if (fallbackValue) {
          for (const fk of keys) {
            fallbackValue = fallbackValue?.[fk];
          }
        }
        if (fallbackValue === undefined) {
          // Return key if no translation found (don't log in production)
          if (process.env.NODE_ENV === 'development') {
            console.warn('Translation not found:', key);
          }
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
