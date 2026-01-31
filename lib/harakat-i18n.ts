/**
 * Internationalized Harakat Descriptions
 * Provides translations for harakat sounds and descriptions
 */

export interface HarakatTranslations {
  sound: string;
  description: string;
}

// Harakat translations by unicode and locale
const HARAKAT_I18N: Record<string, Record<string, HarakatTranslations>> = {
  // Fatha
  '\u064E': {
    en: {
      sound: 'Short "a" as in "cat"',
      description: 'A small diagonal line above the letter indicating a short "a" sound.',
    },
    ar: {
      sound: '"أَ" قصيرة كما في كلمة "كَتَبَ"',
      description: 'خط صغير مائل فوق الحرف يدل على صوت "أَ" قصير.',
    },
    ru: {
      sound: 'Короткий "а" как в "cat"',
      description: 'Небольшая диагональная линия над буквой, указывающая на короткий звук "а".',
    },
  },
  // Kasra
  '\u0650': {
    en: {
      sound: 'Short "i" as in "bit"',
      description: 'A small diagonal line below the letter indicating a short "i" sound.',
    },
    ar: {
      sound: '"إِ" قصيرة كما في كلمة "بِسْمِ"',
      description: 'خط صغير مائل تحت الحرف يدل على صوت "إِ" قصير.',
    },
    ru: {
      sound: 'Короткий "и" как в "bit"',
      description: 'Небольшая диагональная линия под буквой, указывающая на короткий звук "и".',
    },
  },
  // Damma
  '\u064F': {
    en: {
      sound: 'Short "u" as in "put"',
      description: 'A small و-shaped mark above the letter indicating a short "u" sound.',
    },
    ar: {
      sound: '"أُ" قصيرة كما في كلمة "كُتُب"',
      description: 'علامة صغيرة على شكل واو فوق الحرف تدل على صوت "أُ" قصير.',
    },
    ru: {
      sound: 'Короткий "у" как в "put"',
      description: 'Небольшой знак в форме و над буквой, указывающий на короткий звук "у".',
    },
  },
  // Sukun
  '\u0652': {
    en: {
      sound: 'No vowel (consonant stop)',
      description: 'A small circle above the letter indicating no vowel follows - the letter is "resting".',
    },
    ar: {
      sound: 'لا حركة (سكون)',
      description: 'دائرة صغيرة فوق الحرف تدل على عدم وجود حركة - الحرف "ساكن".',
    },
    ru: {
      sound: 'Нет гласной (остановка согласной)',
      description: 'Небольшой круг над буквой, указывающий на отсутствие гласной - буква "покоится".',
    },
  },
  // Shadda
  '\u0651': {
    en: {
      sound: 'Doubles/emphasizes the consonant',
      description: 'A w-shaped mark above the letter indicating the consonant is doubled/stressed.',
    },
    ar: {
      sound: 'تضعيف/تشديد الحرف',
      description: 'علامة على شكل حرف w فوق الحرف تدل على أن الحرف مضعف/مشدد.',
    },
    ru: {
      sound: 'Удваивает/подчеркивает согласную',
      description: 'Знак в форме w над буквой, указывающий на удвоение/ударение согласной.',
    },
  },
  // Tanween Fath
  '\u064B': {
    en: {
      sound: '"an" sound at word end',
      description: 'Two fathas stacked, indicating an "an" sound at the end of a word (nunation).',
    },
    ar: {
      sound: 'صوت "اً" في نهاية الكلمة',
      description: 'فتحتان متراكبتان تدل على صوت "اً" في نهاية الكلمة (التنوين).',
    },
    ru: {
      sound: 'Звук "ан" в конце слова',
      description: 'Две фатхи, наложенные друг на друга, указывающие на звук "ан" в конце слова (нунация).',
    },
  },
  // Tanween Kasr
  '\u064D': {
    en: {
      sound: '"in" sound at word end',
      description: 'Two kasras stacked, indicating an "in" sound at the end of a word (nunation).',
    },
    ar: {
      sound: 'صوت "إٍ" في نهاية الكلمة',
      description: 'كسرتان متراكبتان تدل على صوت "إٍ" في نهاية الكلمة (التنوين).',
    },
    ru: {
      sound: 'Звук "ин" в конце слова',
      description: 'Две касры, наложенные друг на друга, указывающие на звук "ин" в конце слова (нунация).',
    },
  },
  // Tanween Damm
  '\u064C': {
    en: {
      sound: '"un" sound at word end',
      description: 'Two dammas stacked, indicating an "un" sound at the end of a word (nunation).',
    },
    ar: {
      sound: 'صوت "أٌ" في نهاية الكلمة',
      description: 'ضمتان متراكبتان تدل على صوت "أٌ" في نهاية الكلمة (التنوين).',
    },
    ru: {
      sound: 'Звук "ун" в конце слова',
      description: 'Две даммы, наложенные друг на друга, указывающие на звук "ун" в конце слова (нунация).',
    },
  },
  // Maddah
  '\u0653': {
    en: {
      sound: 'Long "aa" sound',
      description: 'A wavy line above alif indicating a long "aa" vowel sound.',
    },
    ar: {
      sound: 'صوت "آ" طويل',
      description: 'خط متموج فوق الألف يدل على صوت حرف علة "آ" طويل.',
    },
    ru: {
      sound: 'Долгий звук "аа"',
      description: 'Волнистая линия над алифом, указывающая на долгий гласный звук "аа".',
    },
  },
  // Hamza Above
  '\u0654': {
    en: {
      sound: 'Glottal stop',
      description: 'A hamza placed above a letter carrier, representing a glottal stop.',
    },
    ar: {
      sound: 'همزة (وقفة حلقية)',
      description: 'همزة موضوعة فوق حرف حامل تمثل وقفة حلقية.',
    },
    ru: {
      sound: 'Гортанная смычка',
      description: 'Хамза, размещенная над буквой-носителем, представляющая гортанную смычку.',
    },
  },
  // Hamza Below
  '\u0655': {
    en: {
      sound: 'Glottal stop with kasra',
      description: 'A hamza placed below alif, typically followed by a kasra sound.',
    },
    ar: {
      sound: 'همزة مع كسرة',
      description: 'همزة موضوعة تحت الألف، عادة ما يتبعها صوت كسرة.',
    },
    ru: {
      sound: 'Гортанная смычка с касрой',
      description: 'Хамза, размещенная под алифом, обычно сопровождается звуком касры.',
    },
  },
  // Superscript Alef
  '\u0670': {
    en: {
      sound: 'Long "aa" sound',
      description: 'A small alif above a letter indicating a long "aa" vowel (dagger alef).',
    },
    ar: {
      sound: 'صوت "آ" طويل',
      description: 'ألف صغيرة فوق حرف تدل على حرف علة "آ" طويل (ألف خنجرية).',
    },
    ru: {
      sound: 'Долгий звук "аа"',
      description: 'Маленький алиф над буквой, указывающий на долгую гласную "аа" (кинжальный алиф).',
    },
  },
};

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

