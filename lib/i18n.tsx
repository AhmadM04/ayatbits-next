'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';

// English strings
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
    restartTutorial: 'Restart Tutorial',
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
    surahsCount: '{count} Surahs',
    progress: 'Progress',
    ayahs: 'ayahs',
    ayah: 'Ayah',
    completed: 'Completed',
  },
  profile: {
    selectTranslation: 'Select Translation',
    translationDescription: 'Choose your preferred Quran translation',
    myProfile: "My Profile",
    userProfile: "{name}'s Profile",
    surahsCompleted: 'Surahs Completed',
    puzzlesSolved: 'Puzzles Solved',
    daysLeft: '{days} Days Left',
    admin: 'Admin',
    lifetime: 'Lifetime',
    monthly: 'Monthly',
    yearly: 'Yearly',
    trial: 'Trial',
  },
  puzzle: {
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    networkError: 'Network error. Please check your connection.',
    failedToLoadTransliteration: 'Failed to load transliteration',
    failedToLoadTafsir: 'Failed to load tafsir',
    failedToSaveProgress: 'Failed to save progress.',
    surahCompleted: 'Surah completed!',
    movingToNext: 'Moving to next ayah...',
    backToMushaf: 'Back to Mushaf view',
    showTransliteration: 'Show transliteration',
    hideTransliteration: 'Hide transliteration',
    showTafsir: 'Show tafsir',
    hideTafsir: 'Hide tafsir',
    showAiTafsir: 'Show AI tafsir (Pro)',
    hideAiTafsir: 'Hide AI tafsir',
    aiTafsirPro: 'AI Tafsir is a Pro feature',
    aiTafsirGenerated: 'AI Tafsir generated successfully',
    aiGeneratedTafsir: 'AI-Generated Tafsir',
    reset: 'Reset',
    hint: 'Hint',
    checkAnswer: 'Check Answer',
    continue: 'Continue',
    tryAgain: 'Try Again',
    correct: 'Correct!',
    incorrect: 'Not quite right',
  },
};

// Arabic strings
const AR_MESSAGES: Record<string, Record<string, string>> = {
  common: {
    search: 'بحث',
    home: 'الرئيسية',
    liked: 'المفضلة',
    profile: 'الملف الشخصي',
    award: 'الجوائز',
    awards: 'الجوائز',
    resume: 'استئناف',
    startLearning: 'ابدأ التعلم',
    surah: 'سورة',
    ayah: 'آية',
  },
  dashboard: {
    welcome: 'مرحباً بعودتك، {name}!',
    continueJourney: 'واصل رحلتك القرآنية',
    selectJuz: 'اختر جزءاً',
    noJuzsFound: 'لا توجد أجزاء متاحة',
    learner: 'متعلم',
    restartTutorial: 'إعادة تشغيل البرنامج التعليمي',
  },
  achievements: {
    title: 'الإنجازات',
    description: 'تتبع تقدمك واحصل على المكافآت',
    streak: 'سلسلة الأيام',
    puzzlesSolved: 'الألغاز المحلولة',
    puzzles: 'ألغاز',
    bestStreak: 'أفضل سلسلة',
    trophies: 'الجوائز',
    surahsCompleted: 'السور المكتملة',
    juzsExplored: 'الأجزاء المستكشفة',
    badges: 'الشارات',
    locked: 'مقفل',
    unlocked: 'مفتوح ({count})',
    unlockedOf: '{unlocked} من {total} مفتوحة',
    inProgress: 'قيد التقدم ({count})',
  },
  navigation: {
    home: 'الرئيسية',
    search: 'بحث',
    liked: 'المفضلة',
    profile: 'الملف الشخصي',
    resume: 'استئناف',
  },
  search: {
    placeholder: 'سورة:آية (مثال، 2:255)',
    noResults: 'لا توجد نتائج',
    invalidFormat: 'تنسيق غير صحيح. استخدم سورة:آية (مثال، 2:255)',
    surahNotFound: 'السورة غير موجودة',
    notAvailable: 'هذه الآية غير متاحة بعد',
    goToDashboard: 'الذهاب إلى لوحة التحكم',
    examples: 'أمثلة',
    startLearning: 'ابدأ التعلم',
  },
  liked: {
    title: 'الآيات المفضلة',
    empty: 'لا توجد آيات مفضلة بعد',
    emptyDescription: 'ستظهر الآيات التي تعجبك هنا',
    noLikedYet: 'لا توجد آيات مفضلة بعد',
    tapHeartToSave: 'اضغط على أيقونة القلب على أي آية لحفظها هنا',
    ayahsSaved: '{count} آيات محفوظة',
    ayahInfo: 'آية {ayahNumber} • جزء {juzNumber}',
  },
  ayah: {
    previous: 'السابق',
    next: 'التالي',
    select: 'اختر آية',
  },
  juz: {
    surahs: 'سور في هذا الجزء',
    surahsCount: '{count} سور',
    progress: 'التقدم',
    ayahs: 'آيات',
    ayah: 'آية',
    completed: 'مكتمل',
  },
  profile: {
    selectTranslation: 'اختر الترجمة',
    translationDescription: 'اختر ترجمة القرآن المفضلة لديك',
    myProfile: 'ملفي الشخصي',
    userProfile: 'ملف {name} الشخصي',
    surahsCompleted: 'السور المكتملة',
    puzzlesSolved: 'الألغاز المحلولة',
    daysLeft: '{days} أيام متبقية',
    admin: 'مدير',
    lifetime: 'مدى الحياة',
    monthly: 'شهري',
    yearly: 'سنوي',
    trial: 'تجريبي',
  },
  puzzle: {
    addedToFavorites: 'تمت الإضافة إلى المفضلة',
    removedFromFavorites: 'تمت الإزالة من المفضلة',
    networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    failedToLoadTransliteration: 'فشل تحميل النسخ الصوتي',
    failedToLoadTafsir: 'فشل تحميل التفسير',
    failedToSaveProgress: 'فشل حفظ التقدم.',
    surahCompleted: 'اكتملت السورة!',
    movingToNext: 'الانتقال إلى الآية التالية...',
    backToMushaf: 'العودة إلى عرض المصحف',
    showTransliteration: 'إظهار النسخ الصوتي',
    hideTransliteration: 'إخفاء النسخ الصوتي',
    showTafsir: 'إظهار التفسير',
    hideTafsir: 'إخفاء التفسير',
    showAiTafsir: 'إظهار التفسير بالذكاء الاصطناعي (Pro)',
    hideAiTafsir: 'إخفاء التفسير بالذكاء الاصطناعي',
    aiTafsirPro: 'التفسير بالذكاء الاصطناعي ميزة Pro',
    aiTafsirGenerated: 'تم إنشاء التفسير بالذكاء الاصطناعي بنجاح',
    aiGeneratedTafsir: 'تفسير مُنشأ بالذكاء الاصطناعي',
    reset: 'إعادة تعيين',
    hint: 'تلميح',
    checkAnswer: 'تحقق من الإجابة',
    continue: 'متابعة',
    tryAgain: 'حاول مرة أخرى',
    correct: 'صحيح!',
    incorrect: 'ليس صحيحاً تماماً',
  },
};

// Russian strings
const RU_MESSAGES: Record<string, Record<string, string>> = {
  common: {
    search: 'Поиск',
    home: 'Главная',
    liked: 'Избранное',
    profile: 'Профиль',
    award: 'Награды',
    awards: 'Награды',
    resume: 'Продолжить',
    startLearning: 'Начать обучение',
    surah: 'Сура',
    ayah: 'Аят',
  },
  dashboard: {
    welcome: 'С возвращением, {name}!',
    continueJourney: 'Продолжите свой путь с Кораном',
    selectJuz: 'Выберите джуз',
    noJuzsFound: 'Джузы не найдены',
    learner: 'Ученик',
    restartTutorial: 'Перезапустить обучение',
  },
  achievements: {
    title: 'Достижения',
    description: 'Отслеживайте свой прогресс и получайте награды',
    streak: 'Серия дней',
    puzzlesSolved: 'Решено головоломок',
    puzzles: 'Головоломки',
    bestStreak: 'Лучшая серия',
    trophies: 'Трофеи',
    surahsCompleted: 'Завершено сур',
    juzsExplored: 'Изучено джузов',
    badges: 'Значки',
    locked: 'Закрыто',
    unlocked: 'Открыто ({count})',
    unlockedOf: '{unlocked} из {total} открыто',
    inProgress: 'В процессе ({count})',
  },
  navigation: {
    home: 'Главная',
    search: 'Поиск',
    liked: 'Избранное',
    profile: 'Профиль',
    resume: 'Продолжить',
  },
  search: {
    placeholder: 'Сура:Аят (например, 2:255)',
    noResults: 'Результаты не найдены',
    invalidFormat: 'Неверный формат. Используйте Сура:Аят (например, 2:255)',
    surahNotFound: 'Сура не найдена',
    notAvailable: 'Этот аят пока недоступен',
    goToDashboard: 'Перейти на панель',
    examples: 'Примеры',
    startLearning: 'Начать обучение',
  },
  liked: {
    title: 'Избранные аяты',
    empty: 'Пока нет избранных аятов',
    emptyDescription: 'Избранные аяты появятся здесь',
    noLikedYet: 'Пока нет избранных аятов',
    tapHeartToSave: 'Нажмите на значок сердца на любом аяте, чтобы сохранить его здесь',
    ayahsSaved: '{count} аятов сохранено',
    ayahInfo: 'Аят {ayahNumber} • Джуз {juzNumber}',
  },
  ayah: {
    previous: 'Предыдущий',
    next: 'Следующий',
    select: 'Выбрать аят',
  },
  juz: {
    surahs: 'Суры в этом джузе',
    surahsCount: '{count} сур',
    progress: 'Прогресс',
    ayahs: 'аяты',
    ayah: 'Аят',
    completed: 'Завершено',
  },
  profile: {
    selectTranslation: 'Выбрать перевод',
    translationDescription: 'Выберите предпочитаемый перевод Корана',
    myProfile: 'Мой профиль',
    userProfile: 'Профиль {name}',
    surahsCompleted: 'Завершено сур',
    puzzlesSolved: 'Решено головоломок',
    daysLeft: '{days} дней осталось',
    admin: 'Администратор',
    lifetime: 'Навсегда',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно',
    trial: 'Пробный',
  },
  puzzle: {
    addedToFavorites: 'Добавлено в избранное',
    removedFromFavorites: 'Удалено из избранного',
    networkError: 'Ошибка сети. Проверьте подключение.',
    failedToLoadTransliteration: 'Не удалось загрузить транслитерацию',
    failedToLoadTafsir: 'Не удалось загрузить тафсир',
    failedToSaveProgress: 'Не удалось сохранить прогресс.',
    surahCompleted: 'Сура завершена!',
    movingToNext: 'Переход к следующему аяту...',
    backToMushaf: 'Вернуться к просмотру Корана',
    showTransliteration: 'Показать транслитерацию',
    hideTransliteration: 'Скрыть транслитерацию',
    showTafsir: 'Показать тафсир',
    hideTafsir: 'Скрыть тафсир',
    showAiTafsir: 'Показать AI тафсир (Pro)',
    hideAiTafsir: 'Скрыть AI тафсир',
    aiTafsirPro: 'AI Тафсир - функция Pro',
    aiTafsirGenerated: 'AI Тафсир успешно создан',
    aiGeneratedTafsir: 'AI-созданный тафсир',
    reset: 'Сбросить',
    hint: 'Подсказка',
    checkAnswer: 'Проверить ответ',
    continue: 'Продолжить',
    tryAgain: 'Попробуйте снова',
    correct: 'Правильно!',
    incorrect: 'Не совсем правильно',
  },
};

// Message map for locale-based lookup
const MESSAGES_MAP: Record<string, Record<string, Record<string, string>>> = {
  en: EN_MESSAGES,
  ar: AR_MESSAGES,
  ru: RU_MESSAGES,
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
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  // Load locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('ayatbits-ui-locale') as Locale;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar' || savedLocale === 'ru')) {
        setCurrentLocale(savedLocale);
      }
    }
  }, []);

  const t = useCallback((key: MessagePath, params?: Record<string, string | number>): string => {
    const messages = MESSAGES_MAP[currentLocale] || EN_MESSAGES;
    const value = getNestedValue(messages as Record<string, unknown>, key);
    
    if (!value) {
      return key;
    }
    
    return interpolate(value, params);
  }, [currentLocale]);

  const setLocale = useCallback((newLocale: string) => {
    const locale = newLocale as Locale;
    if (locale === 'en' || locale === 'ar' || locale === 'ru') {
      setCurrentLocale(locale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayatbits-ui-locale', locale);
      }
    }
  }, []);

  const value = useMemo(() => ({
    locale: currentLocale,
    t,
    setLocale,
  }), [currentLocale, t, setLocale]);

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
      locale: 'en' as Locale,
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

export type Locale = 'en' | 'ar' | 'ru';
export type Messages = Record<string, any>;
