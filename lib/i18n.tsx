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
    juz: 'Juz',
    page: 'Page',
    of: 'of',
    retry: 'Retry',
    loading: 'Loading',
    notAvailable: 'Not available',
    listen: 'Listen',
    gotIt: 'Got it',
  },
  dailyQuote: {
    verseOfTheDay: 'Verse of the Day',
    playRecitation: 'Play recitation',
    openAyah: 'Open ayah',
    translationNotAvailable: 'Translation not available',
    unableToLoad: 'Unable to load verse. Check your connection.',
    failedToLoad: 'Failed to load verse.',
  },
  transliteration: {
    show: 'Show Transliteration',
    hide: 'Hide Transliteration',
    label: 'Transliteration',
    loading: 'Loading transliteration...',
    notAvailable: 'Transliteration not available',
  },
  harakat: {
    guide: 'Harakat Guide',
    closeGuide: 'Close Guide',
    diacriticalMarks: 'Arabic diacritical marks',
    tapToSeeDetails: 'Tap any harakat in the text to see its details',
    sound: 'Sound',
    transliteration: 'Transliteration',
    description: 'Description',
    examples: 'Examples',
    // Category names
    shortVowels: 'Short Vowels',
    nunation: 'Nunation (Tanween)',
    otherMarks: 'Other Marks',
    // Harakat names
    fatha: 'Fatha',
    kasra: 'Kasra',
    damma: 'Damma',
    sukun: 'Sukun',
    shadda: 'Shadda',
    tanweenFath: 'Tanween Fath',
    tanweenKasr: 'Tanween Kasr',
    tanweenDamm: 'Tanween Damm',
    maddah: 'Maddah',
    hamzaAbove: 'Hamza Above',
    hamzaBelow: 'Hamza Below',
    superscriptAlef: 'Superscript Alef',
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
  tutorial: {
    dashboardWelcome: 'Welcome to Ayatbits! 👋',
    dashboardWelcomeMsg: 'Your personal dashboard for exploring the Quran through interactive puzzles.',
    trackProgress: 'Track Your Progress',
    trackProgressMsg: 'Keep an eye on your streak, completed puzzles, and Juz explored here.',
    dailyInspiration: 'Daily Inspiration',
    dailyInspirationMsg: 'Get inspired with a new Quranic verse every day. Tap to hear the recitation!',
    exploreQuran: 'Explore the Quran',
    exploreQuranMsg: 'Choose any Juz to start solving puzzles and learning the Quran in a fun way.',
    easyNavigation: 'Easy Navigation',
    easyNavigationMsg: 'Use the bottom navigation to quickly access your dashboard, search, and profile.',
    skip: 'Skip',
    next: 'Next',
    gotIt: 'Got it!',
    translationPreference: 'Translation Preference',
    translationPreferenceMsg: 'Choose your preferred translation language',
    translationUpdated: 'Translation preference updated',
    failedToUpdate: 'Failed to update translation',
    settings: 'Settings',
    billing: 'Billing',
    account: 'Account',
    manageAccount: 'Manage your account',
    wordByWordAudio: 'Word-by-Word Audio',
    wordByWordAudioMsg: 'Click on any word to hear its pronunciation',
    enableWordAudio: 'Enable word audio playback',
    enableWordAudioMsg: 'When enabled, you can click individual words to hear their recitation',
    audioApiInfo: 'This feature uses the Quran.com API to provide word-level audio recitation by Sheikh Alafasy.',
    audioEnabled: 'Word-by-word audio enabled',
    audioDisabled: 'Word-by-word audio disabled',
    failedToUpdateAudio: 'Failed to update audio settings',
    subscriptionBilling: 'Subscription & Billing',
    subscriptionBillingMsg: 'Manage your subscription plan',
    currentPlan: 'Current Plan',
    trialEnds: 'Trial ends',
    renewsOn: 'Renews on',
    upgradePlan: 'Upgrade Plan',
    changePlan: 'Change Plan',
    billingAndSubscription: 'Billing & Subscription',
    adminAccount: 'Admin Account',
    fullAccessGranted: 'Full access granted',
  },
  wordPuzzle: {
    tips: 'Tips',
    mistakes: 'Mistakes',
    dropEachWord: 'Drop each word in the correct slot',
    dragOrTap: 'Drag or tap a word to place it',
    listen: 'Listen',
    startPuzzle: 'Start Puzzle',
    ayahOf: 'Ayah {current} of {total}',
    previous: 'Previous',
    next: 'Next',
    readMushaf: 'Read Mushaf',
  },
  mushaf: {
    juz: 'Juz',
    page: 'Page',
    previous: 'Previous',
    next: 'Next',
    harakatGuide: 'Harakat Guide',
    closeGuide: 'Close Guide',
    practice: 'Practice',
    playAudio: 'Play Audio',
    viewTranslation: 'View Translation',
    readTafsir: 'Read Tafsir',
    likeAyah: 'Like Ayah',
    copyText: 'Copy Text',
    surah: 'Surah',
    swipeInstruction: 'Swipe left/right or use arrows to navigate • Long press ayah for options',
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
    juz: 'جزء',
    page: 'صفحة',
    of: 'من',
    retry: 'إعادة المحاولة',
    loading: 'جارٍ التحميل',
    notAvailable: 'غير متاح',
    listen: 'استمع',
    gotIt: 'فهمت',
  },
  dailyQuote: {
    verseOfTheDay: 'آية اليوم',
    playRecitation: 'تشغيل التلاوة',
    openAyah: 'فتح الآية',
    translationNotAvailable: 'الترجمة غير متاحة',
    unableToLoad: 'تعذر تحميل الآية. تحقق من اتصالك.',
    failedToLoad: 'فشل تحميل الآية.',
  },
  transliteration: {
    show: 'إظهار النسخ الصوتي',
    hide: 'إخفاء النسخ الصوتي',
    label: 'النسخ الصوتي',
    loading: 'جارٍ تحميل النسخ الصوتي...',
    notAvailable: 'النسخ الصوتي غير متاح',
  },
  harakat: {
    guide: 'دليل الحركات',
    closeGuide: 'إغلاق الدليل',
    diacriticalMarks: 'علامات التشكيل العربية',
    tapToSeeDetails: 'انقر على أي حركة في النص لرؤية تفاصيلها',
    sound: 'الصوت',
    transliteration: 'النسخ الصوتي',
    description: 'الوصف',
    examples: 'أمثلة',
    // Category names
    shortVowels: 'الحركات القصيرة',
    nunation: 'التنوين',
    otherMarks: 'علامات أخرى',
    // Harakat names
    fatha: 'فَتْحَة',
    kasra: 'كَسْرَة',
    damma: 'ضَمَّة',
    sukun: 'سُكُون',
    shadda: 'شَدَّة',
    tanweenFath: 'تَنْوِين فَتْح',
    tanweenKasr: 'تَنْوِين كَسْر',
    tanweenDamm: 'تَنْوِين ضَمّ',
    maddah: 'مَدَّة',
    hamzaAbove: 'هَمْزَة فَوْق',
    hamzaBelow: 'هَمْزَة تَحْت',
    superscriptAlef: 'أَلِف خَنْجَرِيَّة',
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
  tutorial: {
    dashboardWelcome: 'مرحباً بك في آياتبتس! 👋',
    dashboardWelcomeMsg: 'لوحة التحكم الشخصية لاستكشاف القرآن من خلال الألغاز التفاعلية.',
    trackProgress: 'تتبع تقدمك',
    trackProgressMsg: 'راقب سلسلتك والألغاز المكتملة والأجزاء المستكشفة هنا.',
    dailyInspiration: 'إلهام يومي',
    dailyInspirationMsg: 'احصل على الإلهام بآية قرآنية جديدة كل يوم. انقر لسماع التلاوة!',
    exploreQuran: 'استكشف القرآن',
    exploreQuranMsg: 'اختر أي جزء لبدء حل الألغاز وتعلم القرآن بطريقة ممتعة.',
    easyNavigation: 'تنقل سهل',
    easyNavigationMsg: 'استخدم التنقل السفلي للوصول السريع إلى لوحة التحكم والبحث والملف الشخصي.',
    skip: 'تخطي',
    next: 'التالي',
    gotIt: 'فهمت!',
    translationPreference: 'تفضيل الترجمة',
    translationPreferenceMsg: 'اختر لغة الترجمة المفضلة لديك',
    translationUpdated: 'تم تحديث تفضيل الترجمة',
    failedToUpdate: 'فشل تحديث الترجمة',
    settings: 'الإعدادات',
    billing: 'الفواتير',
    account: 'الحساب',
    manageAccount: 'إدارة حسابك',
    wordByWordAudio: 'الصوت كلمة بكلمة',
    wordByWordAudioMsg: 'انقر على أي كلمة لسماع نطقها',
    enableWordAudio: 'تفعيل تشغيل الصوت للكلمات',
    enableWordAudioMsg: 'عند التفعيل، يمكنك النقر على الكلمات الفردية لسماع تلاوتها',
    audioApiInfo: 'تستخدم هذه الميزة Quran.com API لتوفير تلاوة صوتية على مستوى الكلمة بصوت الشيخ العفاسي.',
    audioEnabled: 'تم تفعيل الصوت كلمة بكلمة',
    audioDisabled: 'تم تعطيل الصوت كلمة بكلمة',
    failedToUpdateAudio: 'فشل تحديث إعدادات الصوت',
    subscriptionBilling: 'الاشتراك والفواتير',
    subscriptionBillingMsg: 'إدارة خطة الاشتراك',
    currentPlan: 'الخطة الحالية',
    trialEnds: 'تنتهي التجربة',
    renewsOn: 'يتجدد في',
    upgradePlan: 'ترقية الخطة',
    changePlan: 'تغيير الخطة',
    billingAndSubscription: 'الفواتير والاشتراك',
    adminAccount: 'حساب المدير',
    fullAccessGranted: 'تم منح الوصول الكامل',
  },
  wordPuzzle: {
    tips: 'نصائح',
    mistakes: 'أخطاء',
    dropEachWord: 'ضع كل كلمة في الفتحة الصحيحة',
    dragOrTap: 'اسحب أو انقر على كلمة لوضعها',
    listen: 'استمع',
    startPuzzle: 'ابدأ اللغز',
    ayahOf: 'آية {current} من {total}',
    previous: 'السابق',
    next: 'التالي',
    readMushaf: 'اقرأ المصحف',
  },
  mushaf: {
    juz: 'جزء',
    page: 'صفحة',
    previous: 'السابق',
    next: 'التالي',
    harakatGuide: 'دليل الحركات',
    closeGuide: 'إغلاق الدليل',
    practice: 'تدرب',
    playAudio: 'تشغيل الصوت',
    viewTranslation: 'عرض الترجمة',
    readTafsir: 'قراءة التفسير',
    likeAyah: 'أعجبني الآية',
    copyText: 'نسخ النص',
    surah: 'سورة',
    swipeInstruction: 'اسحب يسارًا/يمينًا أو استخدم الأسهم للتنقل • اضغط مطولاً على الآية للخيارات',
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
    juz: 'Джуз',
    page: 'Страница',
    of: 'из',
    retry: 'Повторить',
    loading: 'Загрузка',
    notAvailable: 'Недоступно',
    listen: 'Слушать',
    gotIt: 'Понятно',
  },
  dailyQuote: {
    verseOfTheDay: 'Аят дня',
    playRecitation: 'Воспроизвести чтение',
    openAyah: 'Открыть аят',
    translationNotAvailable: 'Перевод недоступен',
    unableToLoad: 'Не удалось загрузить аят. Проверьте подключение.',
    failedToLoad: 'Не удалось загрузить аят.',
  },
  transliteration: {
    show: 'Показать транслитерацию',
    hide: 'Скрыть транслитерацию',
    label: 'Транслитерация',
    loading: 'Загрузка транслитерации...',
    notAvailable: 'Транслитерация недоступна',
  },
  harakat: {
    guide: 'Руководство по харакату',
    closeGuide: 'Закрыть руководство',
    diacriticalMarks: 'Арабские диакритические знаки',
    tapToSeeDetails: 'Нажмите на любой харакат в тексте, чтобы увидеть детали',
    sound: 'Звук',
    transliteration: 'Транслитерация',
    description: 'Описание',
    examples: 'Примеры',
    // Category names
    shortVowels: 'Короткие гласные',
    nunation: 'Нунация (Танвин)',
    otherMarks: 'Другие знаки',
    // Harakat names
    fatha: 'Фатха',
    kasra: 'Касра',
    damma: 'Дамма',
    sukun: 'Сукун',
    shadda: 'Шадда',
    tanweenFath: 'Танвин Фатх',
    tanweenKasr: 'Танвин Каср',
    tanweenDamm: 'Танвин Дамм',
    maddah: 'Мадда',
    hamzaAbove: 'Хамза сверху',
    hamzaBelow: 'Хамза снизу',
    superscriptAlef: 'Надстрочный Алиф',
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
  tutorial: {
    dashboardWelcome: 'Добро пожаловать в Ayatbits! 👋',
    dashboardWelcomeMsg: 'Ваша личная панель для изучения Корана через интерактивные головоломки.',
    trackProgress: 'Отслеживайте прогресс',
    trackProgressMsg: 'Следите за своей серией, завершенными головоломками и изученными джузами здесь.',
    dailyInspiration: 'Ежедневное вдохновение',
    dailyInspirationMsg: 'Вдохновляйтесь новым кораническим аятом каждый день. Нажмите, чтобы услышать чтение!',
    exploreQuran: 'Исследуйте Коран',
    exploreQuranMsg: 'Выберите любой джуз, чтобы начать решать головоломки и изучать Коран весело.',
    easyNavigation: 'Простая навигация',
    easyNavigationMsg: 'Используйте нижнюю навигацию для быстрого доступа к панели, поиску и профилю.',
    skip: 'Пропустить',
    next: 'Далее',
    gotIt: 'Понятно!',
    translationPreference: 'Предпочтение перевода',
    translationPreferenceMsg: 'Выберите предпочитаемый язык перевода',
    translationUpdated: 'Предпочтение перевода обновлено',
    failedToUpdate: 'Не удалось обновить перевод',
    settings: 'Настройки',
    billing: 'Оплата',
    account: 'Аккаунт',
    manageAccount: 'Управление аккаунтом',
    wordByWordAudio: 'Аудио по словам',
    wordByWordAudioMsg: 'Нажмите на любое слово, чтобы услышать его произношение',
    enableWordAudio: 'Включить воспроизведение аудио слов',
    enableWordAudioMsg: 'При включении вы можете нажимать на отдельные слова, чтобы услышать их чтение',
    audioApiInfo: 'Эта функция использует Quran.com API для озвучивания слов шейхом Алафаси.',
    audioEnabled: 'Аудио по словам включено',
    audioDisabled: 'Аудио по словам отключено',
    failedToUpdateAudio: 'Не удалось обновить настройки аудио',
    subscriptionBilling: 'Подписка и оплата',
    subscriptionBillingMsg: 'Управление планом подписки',
    currentPlan: 'Текущий план',
    trialEnds: 'Пробный период заканчивается',
    renewsOn: 'Продлевается',
    upgradePlan: 'Обновить план',
    changePlan: 'Изменить план',
    billingAndSubscription: 'Оплата и подписка',
    adminAccount: 'Аккаунт администратора',
    fullAccessGranted: 'Полный доступ предоставлен',
  },
  wordPuzzle: {
    tips: 'Подсказки',
    mistakes: 'Ошибки',
    dropEachWord: 'Поместите каждое слово в правильный слот',
    dragOrTap: 'Перетащите или нажмите на слово, чтобы разместить его',
    listen: 'Слушать',
    startPuzzle: 'Начать головоломку',
    ayahOf: 'Аят {current} из {total}',
    previous: 'Предыдущий',
    next: 'Следующий',
    readMushaf: 'Читать Коран',
  },
  mushaf: {
    juz: 'Джуз',
    page: 'Страница',
    previous: 'Предыдущий',
    next: 'Следующий',
    harakatGuide: 'Руководство по харакату',
    closeGuide: 'Закрыть руководство',
    practice: 'Практика',
    playAudio: 'Воспроизвести аудио',
    viewTranslation: 'Посмотреть перевод',
    readTafsir: 'Прочитать тафсир',
    likeAyah: 'Мне нравится аят',
    copyText: 'Скопировать текст',
    surah: 'Сура',
    swipeInstruction: 'Проведите влево/вправо или используйте стрелки для навигации • Долгое нажатие на аят для опций',
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
