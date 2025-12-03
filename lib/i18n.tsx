'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getLocaleFromTranslation } from './i18n-config';
import enMessages from '../messages/en.json';
import zhMessages from '../messages/zh.json';
import arMessages from '../messages/ar.json';
import ruMessages from '../messages/ru.json';
import frMessages from '../messages/fr.json';
import esMessages from '../messages/es.json';
import deMessages from '../messages/de.json';
import trMessages from '../messages/tr.json';
import urMessages from '../messages/ur.json';
import idMessages from '../messages/id.json';
import msMessages from '../messages/ms.json';
import bnMessages from '../messages/bn.json';
import hiMessages from '../messages/hi.json';
import jaMessages from '../messages/ja.json';
import nlMessages from '../messages/nl.json';

type Messages = typeof enMessages;

const messages: Record<string, Messages> = {
  en: enMessages,
  zh: zhMessages,
  ar: arMessages,
  ru: ruMessages,
  fr: frMessages,
  es: esMessages,
  de: deMessages,
  tr: trMessages,
  ur: urMessages,
  id: idMessages,
  ms: msMessages,
  bn: bnMessages,
  hi: hiMessages,
  ja: jaMessages,
  nl: nlMessages,
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
  const localeMessages = messages[locale] || messages.en;
  
  // Debug logging
  console.log('I18nProvider - translationCode:', translationCode, '-> locale:', locale);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = localeMessages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        let fallbackValue: any = messages.en;
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
