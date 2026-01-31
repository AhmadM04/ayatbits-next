/**
 * Internationalized Harakat Descriptions
 * Provides translations for harakat names, sounds and descriptions
 */

export interface HarakatTranslations {
  name: string;
  sound: string;
  description: string;
  exampleWord: string;
}

// Harakat translations by unicode and locale
const HARAKAT_I18N: Record<string, Record<string, HarakatTranslations>> = {
  // Fatha
  '\u064E': {
    en: {
      name: 'Fatha',
      sound: 'Short "a" as in "cat"',
      description: 'A small diagonal line above the letter indicating a short "a" sound.',
      exampleWord: 'كَتَبَ (kataba - he wrote)',
    },
    ar: {
      name: 'فَتْحَة',
      sound: '"أَ" قصيرة كما في كلمة "كَتَبَ"',
      description: 'خط صغير مائل فوق الحرف يدل على صوت "أَ" قصير.',
      exampleWord: 'كَتَبَ (كتب)',
    },
    ru: {
      name: 'Фатха',
      sound: 'Короткий "а" как в "cat"',
      description: 'Небольшая диагональная линия над буквой, указывающая на короткий звук "а".',
      exampleWord: 'كَتَبَ (катаба - он написал)',
    },
  },
  // Kasra
  '\u0650': {
    en: {
      name: 'Kasra',
      sound: 'Short "i" as in "bit"',
      description: 'A small diagonal line below the letter indicating a short "i" sound.',
      exampleWord: 'بِسْمِ (bismi - in the name of)',
    },
    ar: {
      name: 'كَسْرَة',
      sound: '"إِ" قصيرة كما في كلمة "بِسْمِ"',
      description: 'خط صغير مائل تحت الحرف يدل على صوت "إِ" قصير.',
      exampleWord: 'بِسْمِ (باسم)',
    },
    ru: {
      name: 'Касра',
      sound: 'Короткий "и" как в "bit"',
      description: 'Небольшая диагональная линия под буквой, указывающая на короткий звук "и".',
      exampleWord: 'بِسْمِ (бисми - во имя)',
    },
  },
  // Damma
  '\u064F': {
    en: {
      name: 'Damma',
      sound: 'Short "u" as in "put"',
      description: 'A small و-shaped mark above the letter indicating a short "u" sound.',
      exampleWord: 'كُتُب (kutub - books)',
    },
    ar: {
      name: 'ضَمَّة',
      sound: '"أُ" قصيرة كما في كلمة "كُتُب"',
      description: 'علامة صغيرة على شكل واو فوق الحرف تدل على صوت "أُ" قصير.',
      exampleWord: 'كُتُب (كتب)',
    },
    ru: {
      name: 'Дамма',
      sound: 'Короткий "у" как в "put"',
      description: 'Небольшой знак в форме و над буквой, указывающий на короткий звук "у".',
      exampleWord: 'كُتُب (кутуб - книги)',
    },
  },
  // Sukun
  '\u0652': {
    en: {
      name: 'Sukun',
      sound: 'No vowel (consonant stop)',
      description: 'A small circle above the letter indicating no vowel follows - the letter is "resting".',
      exampleWord: 'اَلْحَمْدُ (al-hamdu - the praise)',
    },
    ar: {
      name: 'سُكُون',
      sound: 'لا حركة (سكون)',
      description: 'دائرة صغيرة فوق الحرف تدل على عدم وجود حركة - الحرف "ساكن".',
      exampleWord: 'اَلْحَمْدُ (الحمد)',
    },
    ru: {
      name: 'Сукун',
      sound: 'Нет гласной (остановка согласной)',
      description: 'Небольшой круг над буквой, указывающий на отсутствие гласной - буква "покоится".',
      exampleWord: 'اَلْحَمْدُ (аль-хамду - хвала)',
    },
  },
  // Shadda
  '\u0651': {
    en: {
      name: 'Shadda',
      sound: 'Doubles/emphasizes the consonant',
      description: 'A w-shaped mark above the letter indicating the consonant is doubled/stressed.',
      exampleWord: 'رَبَّ (rabba - Lord)',
    },
    ar: {
      name: 'شَدَّة',
      sound: 'تضعيف/تشديد الحرف',
      description: 'علامة على شكل حرف w فوق الحرف تدل على أن الحرف مضعف/مشدد.',
      exampleWord: 'رَبَّ (رب)',
    },
    ru: {
      name: 'Шадда',
      sound: 'Удваивает/подчеркивает согласную',
      description: 'Знак в форме w над буквой, указывающий на удвоение/ударение согласной.',
      exampleWord: 'رَبَّ (рабба - Господь)',
    },
  },
  // Tanween Fath
  '\u064B': {
    en: {
      name: 'Tanween Fath',
      sound: '"an" sound at word end',
      description: 'Two fathas stacked, indicating an "an" sound at the end of a word (nunation).',
      exampleWord: 'كِتَابًا (kitaaban - a book)',
    },
    ar: {
      name: 'تَنْوِين فَتْح',
      sound: 'صوت "اً" في نهاية الكلمة',
      description: 'فتحتان متراكبتان تدل على صوت "اً" في نهاية الكلمة (التنوين).',
      exampleWord: 'كِتَابًا (كتاباً)',
    },
    ru: {
      name: 'Танвин Фатх',
      sound: 'Звук "ан" в конце слова',
      description: 'Две фатхи, наложенные друг на друга, указывающие на звук "ан" в конце слова (нунация).',
      exampleWord: 'كِتَابًا (китаабан - книгу)',
    },
  },
  // Tanween Kasr
  '\u064D': {
    en: {
      name: 'Tanween Kasr',
      sound: '"in" sound at word end',
      description: 'Two kasras stacked, indicating an "in" sound at the end of a word (nunation).',
      exampleWord: 'كِتَابٍ (kitaabin - of a book)',
    },
    ar: {
      name: 'تَنْوِين كَسْر',
      sound: 'صوت "إٍ" في نهاية الكلمة',
      description: 'كسرتان متراكبتان تدل على صوت "إٍ" في نهاية الكلمة (التنوين).',
      exampleWord: 'كِتَابٍ (كتابٍ)',
    },
    ru: {
      name: 'Танвин Каср',
      sound: 'Звук "ин" в конце слова',
      description: 'Две касры, наложенные друг на друга, указывающие на звук "ин" в конце слова (нунация).',
      exampleWord: 'كِتَابٍ (китаабин - книги)',
    },
  },
  // Tanween Damm
  '\u064C': {
    en: {
      name: 'Tanween Damm',
      sound: '"un" sound at word end',
      description: 'Two dammas stacked, indicating an "un" sound at the end of a word (nunation).',
      exampleWord: 'كِتَابٌ (kitaabun - a book)',
    },
    ar: {
      name: 'تَنْوِين ضَمّ',
      sound: 'صوت "أٌ" في نهاية الكلمة',
      description: 'ضمتان متراكبتان تدل على صوت "أٌ" في نهاية الكلمة (التنوين).',
      exampleWord: 'كِتَابٌ (كتابٌ)',
    },
    ru: {
      name: 'Танвин Дамм',
      sound: 'Звук "ун" в конце слова',
      description: 'Две даммы, наложенные друг на друга, указывающие на звук "ун" в конце слова (нунация).',
      exampleWord: 'كِتَابٌ (китаабун - книга)',
    },
  },
  // Maddah
  '\u0653': {
    en: {
      name: 'Maddah',
      sound: 'Long "aa" sound',
      description: 'A wavy line above alif indicating a long "aa" vowel sound.',
      exampleWord: 'آمَنَ (āmana - he believed)',
    },
    ar: {
      name: 'مَدَّة',
      sound: 'صوت "آ" طويل',
      description: 'خط متموج فوق الألف يدل على صوت حرف علة "آ" طويل.',
      exampleWord: 'آمَنَ (آمن)',
    },
    ru: {
      name: 'Мадда',
      sound: 'Долгий звук "аа"',
      description: 'Волнистая линия над алифом, указывающая на долгий гласный звук "аа".',
      exampleWord: 'آمَنَ (āмана - он уверовал)',
    },
  },
  // Hamza Above
  '\u0654': {
    en: {
      name: 'Hamza Above',
      sound: 'Glottal stop',
      description: 'A hamza placed above a letter carrier, representing a glottal stop.',
      exampleWord: 'أَحَد (ahad - one)',
    },
    ar: {
      name: 'هَمْزَة فَوْق',
      sound: 'همزة (وقفة حلقية)',
      description: 'همزة موضوعة فوق حرف حامل تمثل وقفة حلقية.',
      exampleWord: 'أَحَد (أحد)',
    },
    ru: {
      name: 'Хамза сверху',
      sound: 'Гортанная смычка',
      description: 'Хамза, размещенная над буквой-носителем, представляющая гортанную смычку.',
      exampleWord: 'أَحَد (ахад - один)',
    },
  },
  // Hamza Below
  '\u0655': {
    en: {
      name: 'Hamza Below',
      sound: 'Glottal stop with kasra',
      description: 'A hamza placed below alif, typically followed by a kasra sound.',
      exampleWord: 'إِيمَان (eemaan - faith)',
    },
    ar: {
      name: 'هَمْزَة تَحْت',
      sound: 'همزة مع كسرة',
      description: 'همزة موضوعة تحت الألف، عادة ما يتبعها صوت كسرة.',
      exampleWord: 'إِيمَان (إيمان)',
    },
    ru: {
      name: 'Хамза снизу',
      sound: 'Гортанная смычка с касрой',
      description: 'Хамза, размещенная под алифом, обычно сопровождается звуком касры.',
      exampleWord: 'إِيمَان (иймаан - вера)',
    },
  },
  // Superscript Alef
  '\u0670': {
    en: {
      name: 'Superscript Alef',
      sound: 'Long "aa" sound',
      description: 'A small alif above a letter indicating a long "aa" vowel (dagger alef).',
      exampleWord: 'هٰذَا (hādhā - this)',
    },
    ar: {
      name: 'أَلِف خَنْجَرِيَّة',
      sound: 'صوت "آ" طويل',
      description: 'ألف صغيرة فوق حرف تدل على حرف علة "آ" طويل (ألف خنجرية).',
      exampleWord: 'هٰذَا (هذا)',
    },
    ru: {
      name: 'Надстрочный Алиф',
      sound: 'Долгий звук "аа"',
      description: 'Маленький алиф над буквой, указывающий на долгую гласную "аа" (кинжальный алиф).',
      exampleWord: 'هٰذَا (хааза - это)',
    },
  },
};

/**
 * Get translated name for a harakat character
 */
export function getHarakatName(unicode: string, locale: string = 'en'): string {
  const translations = HARAKAT_I18N[unicode];
  if (!translations) return '';
  
  const translation = translations[locale as keyof typeof translations];
  return translation?.name || translations.en.name;
}

/**
 * Get translated sound for a harakat character
 */
export function getHarakatSound(unicode: string, locale: string = 'en'): string {
  const translations = HARAKAT_I18N[unicode];
  if (!translations) return '';
  
  const translation = translations[locale as keyof typeof translations];
  return translation?.sound || translations.en.sound;
}

/**
 * Get translated description for a harakat character
 */
export function getHarakatDescription(unicode: string, locale: string = 'en'): string {
  const translations = HARAKAT_I18N[unicode];
  if (!translations) return '';
  
  const translation = translations[locale as keyof typeof translations];
  return translation?.description || translations.en.description;
}

/**
 * Get translated example word for a harakat character
 */
export function getHarakatExampleWord(unicode: string, locale: string = 'en'): string {
  const translations = HARAKAT_I18N[unicode];
  if (!translations) return '';
  
  const translation = translations[locale as keyof typeof translations];
  return translation?.exampleWord || translations.en.exampleWord;
}

