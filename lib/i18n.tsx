'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { getLocaleFromTranslation, Locale, DEFAULT_LOCALE } from './i18n-config';

// Import all message files
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
import fr from '@/messages/fr.json';
import es from '@/messages/es.json';
import de from '@/messages/de.json';
import tr from '@/messages/tr.json';
import ur from '@/messages/ur.json';
import id from '@/messages/id.json';
import ms from '@/messages/ms.json';
import bn from '@/messages/bn.json';
import hi from '@/messages/hi.json';
import ru from '@/messages/ru.json';
import zh from '@/messages/zh.json';
import ja from '@/messages/ja.json';
import nl from '@/messages/nl.json';

type Messages = typeof en;
type MessagePath = string;

const messages: Record<Locale, Messages> = {
  en,
  ar,
  fr,
  es,
  de,
  tr,
  ur,
  id,
  ms,
  bn,
  hi,
  ru,
  zh,
  ja,
  nl,
};

interface I18nContextType {
  locale: Locale;
  t: (key: MessagePath, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

/**
 * Get a nested value from an object using a dot-separated path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace template placeholders with values
 * Supports {name} and {count} style placeholders
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() ?? match;
  });
}

interface I18nProviderProps {
  children: ReactNode;
  translationCode?: string;
}

export function I18nProvider({ children, translationCode }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from translation code if provided
    if (translationCode) {
      return getLocaleFromTranslation(translationCode);
    }
    return DEFAULT_LOCALE;
  });

  // Update locale when translationCode changes
  useEffect(() => {
    if (translationCode) {
      const newLocale = getLocaleFromTranslation(translationCode);
      setLocaleState(newLocale);
    }
  }, [translationCode]);

  // Also check localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !translationCode) {
      const stored = localStorage.getItem('selectedTranslation');
      if (stored) {
        setLocaleState(getLocaleFromTranslation(stored));
      }
    }
  }, [translationCode]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLocale', newLocale);
    }
  }, []);

  const t = useCallback((key: MessagePath, params?: Record<string, string | number>): string => {
    const localeMessages = messages[locale] || messages[DEFAULT_LOCALE];
    const value = getNestedValue(localeMessages as Record<string, unknown>, key);
    
    if (!value) {
      // Fallback to English if translation not found
      const fallback = getNestedValue(messages[DEFAULT_LOCALE] as Record<string, unknown>, key);
      if (!fallback) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
      return interpolate(fallback, params);
    }
    
    return interpolate(value, params);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    t,
    setLocale,
  }), [locale, t, setLocale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Get messages for a specific locale (useful for server-side)
 */
export function getMessages(locale: Locale): Messages {
  return messages[locale] || messages[DEFAULT_LOCALE];
}

export type { Locale, Messages };
