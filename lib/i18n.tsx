'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';

// Hardcoded English strings
const EN_MESSAGES: Record<string, Record<string, string>> = {
  common: {
    search: 'Search',
    home: 'Home',
    liked: 'Liked',
    profile: 'Profile',
    award: 'Awards',
    awards: 'Awards',
    resume: 'Resume',
    startLearning: 'Start Learning',
    surah: 'Surah',
    ayah: 'Ayah',
  },
  dashboard: {
    welcome: 'Welcome back, {name}!',
    continueJourney: 'Continue your Quranic journey',
    selectJuz: 'Select a Juz',
    noJuzsFound: 'No Juz available',
    learner: 'Learner',
  },
  achievements: {
    title: 'Achievements',
    description: 'Track your progress and unlock rewards',
    streak: 'Day Streak',
    puzzlesSolved: 'Puzzles Solved',
    puzzles: 'Puzzles',
    bestStreak: 'Best Streak',
    trophies: 'Trophies',
    surahsCompleted: 'Surahs Completed',
    juzsExplored: 'Juz Explored',
    badges: 'Badges',
    locked: 'Locked',
    unlocked: 'Unlocked ({count})',
    unlockedOf: '{unlocked} of {total} unlocked',
    inProgress: 'In Progress ({count})',
  },
  navigation: {
    home: 'Home',
    search: 'Search',
    liked: 'Liked',
    profile: 'Profile',
    resume: 'Resume',
  },
  search: {
    placeholder: 'Surah:Ayah (e.g., 2:255)',
    noResults: 'No results found',
    invalidFormat: 'Invalid format. Use Surah:Ayah (e.g., 2:255)',
    surahNotFound: 'Surah not found',
    notAvailable: 'This verse is not available yet',
    goToDashboard: 'Go to Dashboard',
    examples: 'Examples',
    startLearning: 'Start learning',
  },
  liked: {
    title: 'Liked Ayahs',
    empty: 'No liked ayahs yet',
    emptyDescription: 'Ayahs you like will appear here',
    noLikedYet: 'No liked ayahs yet',
    tapHeartToSave: 'Tap the heart icon on any ayah to save it here',
    ayahsSaved: '{count} ayahs saved',
    ayahInfo: 'Ayah {ayahNumber} • Juz {juzNumber}',
  },
  ayah: {
    previous: 'Previous',
    next: 'Next',
    select: 'Select Ayah',
  },
  juz: {
    surahs: 'Surahs in this Juz',
    progress: 'Progress',
    ayahs: 'ayahs',
  },
  profile: {
    selectTranslation: 'Select Translation',
    translationDescription: 'Choose your preferred Quran translation',
  },
};

type MessagePath = string;

interface I18nContextType {
  locale: string;
  t: (key: MessagePath, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
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
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() ?? match;
  });
}

interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, any>;
  translationCode?: string;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const t = useCallback((key: MessagePath, params?: Record<string, string | number>): string => {
    const value = getNestedValue(EN_MESSAGES as Record<string, unknown>, key);
    
    if (!value) {
      return key;
    }
    
    return interpolate(value, params);
  }, []);

  const value = useMemo(() => ({
    locale: 'en',
    t,
    setLocale: () => {},
  }), [t]);

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
    // Return fallback implementation when outside provider
    return {
      locale: 'en',
      t: (key: string, params?: Record<string, string | number>): string => {
        const value = getNestedValue(EN_MESSAGES as Record<string, unknown>, key);
        if (!value) return key;
        return interpolate(value, params);
      },
      setLocale: () => {},
    };
  }
  return context;
}

/**
 * Safe hook that returns fallback if not in provider
 */
export function useI18nSafe() {
  return useI18n();
}

export type Locale = 'en';
export type Messages = Record<string, any>;
