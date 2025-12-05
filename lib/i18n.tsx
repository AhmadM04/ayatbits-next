'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { getLocaleFromTranslation, Locale, DEFAULT_LOCALE } from './i18n-config';

type Messages = Record<string, any>;
type MessagePath = string;

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
  locale: Locale;
  messages: Messages; // Passed from server
  translationCode?: string; // Optional, for backward compatibility
}

export function I18nProvider({ children, locale: initialLocale, messages: initialMessages, translationCode }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from translation code if provided
    if (translationCode) {
      return getLocaleFromTranslation(translationCode);
    }
    return initialLocale || DEFAULT_LOCALE;
  });

  // Store messages in state (they come from server)
  const [messages, setMessages] = useState<Messages>(initialMessages);

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
    const localeMessages = messages || {};
    const value = getNestedValue(localeMessages as Record<string, unknown>, key);
    
    if (!value) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      return key;
    }
    
    return interpolate(value, params);
  }, [locale, messages]);

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
 * Hook to access i18n context - throws error if not in provider
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Safe hook that returns fallback if not in provider (for components that might render outside provider)
 */
export function useI18nSafe() {
  const context = useContext(I18nContext);
  
  if (!context) {
    // Return fallback implementation
    return {
      locale: DEFAULT_LOCALE as Locale,
      t: (key: string, params?: Record<string, string | number>): string => {
        // No access to messages, just return key
        return key;
      },
      setLocale: () => {},
    };
  }
  
  return context;
}

export type { Locale, Messages };
