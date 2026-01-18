/**
 * Harakat (Arabic Diacritical Marks) Utilities
 * 
 * This module provides definitions, colors, and helper functions
 * for rendering and explaining Arabic harakat/tashkeel marks.
 */

export interface HarakatDefinition {
  unicode: string;
  character: string;
  nameArabic: string;
  nameEnglish: string;
  transliteration: string;
  sound: string;
  description: string;
  example: string;
  exampleWord: string;
  color: string;
  colorClass: string;
}

// Main harakat definitions with colors
export const HARAKAT_DEFINITIONS: Record<string, HarakatDefinition> = {
  // Fatha - short 'a' vowel
  '\u064E': {
    unicode: 'U+064E',
    character: '\u064E',
    nameArabic: 'فَتْحَة',
    nameEnglish: 'Fatha',
    transliteration: 'a',
    sound: 'Short "a" as in "cat"',
    description: 'A small diagonal line above the letter indicating a short "a" sound.',
    example: 'بَ',
    exampleWord: 'كَتَبَ (kataba - he wrote)',
    color: '#f87171', // red-400
    colorClass: 'text-red-400',
  },
  
  // Kasra - short 'i' vowel
  '\u0650': {
    unicode: 'U+0650',
    character: '\u0650',
    nameArabic: 'كَسْرَة',
    nameEnglish: 'Kasra',
    transliteration: 'i',
    sound: 'Short "i" as in "bit"',
    description: 'A small diagonal line below the letter indicating a short "i" sound.',
    example: 'بِ',
    exampleWord: 'بِسْمِ (bismi - in the name of)',
    color: '#60a5fa', // blue-400
    colorClass: 'text-blue-400',
  },
  
  // Damma - short 'u' vowel
  '\u064F': {
    unicode: 'U+064F',
    character: '\u064F',
    nameArabic: 'ضَمَّة',
    nameEnglish: 'Damma',
    transliteration: 'u',
    sound: 'Short "u" as in "put"',
    description: 'A small و-shaped mark above the letter indicating a short "u" sound.',
    example: 'بُ',
    exampleWord: 'كُتُب (kutub - books)',
    color: '#4ade80', // green-400
    colorClass: 'text-green-400',
  },
  
  // Sukun - no vowel
  '\u0652': {
    unicode: 'U+0652',
    character: '\u0652',
    nameArabic: 'سُكُون',
    nameEnglish: 'Sukun',
    transliteration: '∅',
    sound: 'No vowel (consonant stop)',
    description: 'A small circle above the letter indicating no vowel follows - the letter is "resting".',
    example: 'بْ',
    exampleWord: 'اَلْحَمْدُ (al-hamdu - the praise)',
    color: '#a1a1aa', // gray-400
    colorClass: 'text-gray-400',
  },
  
  // Shadda - gemination/doubling
  '\u0651': {
    unicode: 'U+0651',
    character: '\u0651',
    nameArabic: 'شَدَّة',
    nameEnglish: 'Shadda',
    transliteration: 'ّ (double)',
    sound: 'Doubles/emphasizes the consonant',
    description: 'A w-shaped mark above the letter indicating the consonant is doubled/stressed.',
    example: 'بّ',
    exampleWord: 'رَبَّ (rabba - Lord)',
    color: '#c084fc', // purple-400
    colorClass: 'text-purple-400',
  },
  
  // Tanween Fath - 'an' ending
  '\u064B': {
    unicode: 'U+064B',
    character: '\u064B',
    nameArabic: 'تَنْوِين فَتْح',
    nameEnglish: 'Tanween Fath',
    transliteration: 'an',
    sound: '"an" sound at word end',
    description: 'Two fathas stacked, indicating an "an" sound at the end of a word (nunation).',
    example: 'بًا',
    exampleWord: 'كِتَابًا (kitaaban - a book)',
    color: '#fb923c', // orange-400
    colorClass: 'text-orange-400',
  },
  
  // Tanween Kasr - 'in' ending
  '\u064D': {
    unicode: 'U+064D',
    character: '\u064D',
    nameArabic: 'تَنْوِين كَسْر',
    nameEnglish: 'Tanween Kasr',
    transliteration: 'in',
    sound: '"in" sound at word end',
    description: 'Two kasras stacked, indicating an "in" sound at the end of a word (nunation).',
    example: 'بٍ',
    exampleWord: 'كِتَابٍ (kitaabin - of a book)',
    color: '#f59e0b', // amber-500
    colorClass: 'text-amber-500',
  },
  
  // Tanween Damm - 'un' ending
  '\u064C': {
    unicode: 'U+064C',
    character: '\u064C',
    nameArabic: 'تَنْوِين ضَمّ',
    nameEnglish: 'Tanween Damm',
    transliteration: 'un',
    sound: '"un" sound at word end',
    description: 'Two dammas stacked, indicating an "un" sound at the end of a word (nunation).',
    example: 'بٌ',
    exampleWord: 'كِتَابٌ (kitaabun - a book)',
    color: '#fbbf24', // amber-400
    colorClass: 'text-amber-400',
  },
  
  // Maddah - lengthening mark
  '\u0653': {
    unicode: 'U+0653',
    character: '\u0653',
    nameArabic: 'مَدَّة',
    nameEnglish: 'Maddah',
    transliteration: 'ā',
    sound: 'Long "aa" sound',
    description: 'A wavy line above alif indicating a long "aa" vowel sound.',
    example: 'آ',
    exampleWord: 'آمَنَ (āmana - he believed)',
    color: '#f472b6', // pink-400
    colorClass: 'text-pink-400',
  },
  
  // Hamza above
  '\u0654': {
    unicode: 'U+0654',
    character: '\u0654',
    nameArabic: 'هَمْزَة فَوْق',
    nameEnglish: 'Hamza Above',
    transliteration: "'",
    sound: 'Glottal stop',
    description: 'A hamza placed above a letter carrier, representing a glottal stop.',
    example: 'أ',
    exampleWord: 'أَحَد (ahad - one)',
    color: '#22d3ee', // cyan-400
    colorClass: 'text-cyan-400',
  },
  
  // Hamza below
  '\u0655': {
    unicode: 'U+0655',
    character: '\u0655',
    nameArabic: 'هَمْزَة تَحْت',
    nameEnglish: 'Hamza Below',
    transliteration: "'i",
    sound: 'Glottal stop with kasra',
    description: 'A hamza placed below alif, typically followed by a kasra sound.',
    example: 'إ',
    exampleWord: 'إِيمَان (eemaan - faith)',
    color: '#2dd4bf', // teal-400
    colorClass: 'text-teal-400',
  },
  
  // Superscript Alef (dagger alef)
  '\u0670': {
    unicode: 'U+0670',
    character: '\u0670',
    nameArabic: 'أَلِف خَنْجَرِيَّة',
    nameEnglish: 'Superscript Alef',
    transliteration: 'ā',
    sound: 'Long "aa" sound',
    description: 'A small alif above a letter indicating a long "aa" vowel (dagger alef).',
    example: 'هٰذَا',
    exampleWord: 'هٰذَا (hādhā - this)',
    color: '#a78bfa', // violet-400
    colorClass: 'text-violet-400',
  },
  
  // Extended marks (U+0656-U+065F) - less common but found in some Quran editions
  '\u0656': {
    unicode: 'U+0656',
    character: '\u0656',
    nameArabic: 'ألف تحتية',
    nameEnglish: 'Subscript Alef',
    transliteration: 'a',
    sound: 'Short "a" below',
    description: 'A small alif below a letter, variant of fatha.',
    example: 'بٖ',
    exampleWord: 'Subscript alef variant',
    color: '#f87171', // red-400 (fatha family)
    colorClass: 'text-red-400',
  },
  '\u0657': {
    unicode: 'U+0657',
    character: '\u0657',
    nameArabic: 'ضمة مقلوبة',
    nameEnglish: 'Inverted Damma',
    transliteration: 'u',
    sound: 'Short "u" sound',
    description: 'An inverted damma mark used in some texts.',
    example: 'بٗ',
    exampleWord: 'Inverted damma',
    color: '#4ade80', // green-400 (damma family)
    colorClass: 'text-green-400',
  },
  '\u0658': {
    unicode: 'U+0658',
    character: '\u0658',
    nameArabic: 'علامة نون غنة',
    nameEnglish: 'Mark Noon Ghunna',
    transliteration: 'n',
    sound: 'Nasal noon',
    description: 'A mark indicating nasalization (ghunna).',
    example: 'نٜ',
    exampleWord: 'Ghunna mark',
    color: '#c084fc', // purple-400
    colorClass: 'text-purple-400',
  },
};

// Extended Quranic marks (found in Uthmani Quran text)
export const QURANIC_MARKS: Record<string, HarakatDefinition> = {
  // === Extended Arabic Marks (U+0610-U+061A) ===
  '\u0610': {
    unicode: 'U+0610',
    character: '\u0610',
    nameArabic: 'علامة صح',
    nameEnglish: 'Arabic Sign Sallallahu',
    transliteration: '',
    sound: 'Honorific mark',
    description: 'An honorific sign used after names of prophets.',
    example: 'مُحَمَّدٌؐ',
    exampleWord: 'Used after prophet names',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0611': {
    unicode: 'U+0611',
    character: '\u0611',
    nameArabic: 'علامة علي',
    nameEnglish: 'Arabic Sign Alayhe',
    transliteration: '',
    sound: 'Honorific mark',
    description: 'An honorific sign meaning "upon him".',
    example: 'عَلَيْهِؑ',
    exampleWord: 'Used after companion names',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0612': {
    unicode: 'U+0612',
    character: '\u0612',
    nameArabic: 'علامة رحمة',
    nameEnglish: 'Arabic Sign Rahmatullahi',
    transliteration: '',
    sound: 'Honorific mark',
    description: 'An honorific sign meaning "may Allah have mercy upon him".',
    example: 'رَحِمَهُؒ',
    exampleWord: 'Used after scholar names',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0613': {
    unicode: 'U+0613',
    character: '\u0613',
    nameArabic: 'علامة رضي',
    nameEnglish: 'Arabic Sign Radi',
    transliteration: '',
    sound: 'Honorific mark',
    description: 'An honorific sign meaning "may Allah be pleased with him".',
    example: 'رَضِيَؓ',
    exampleWord: 'Used after companion names',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0614': {
    unicode: 'U+0614',
    character: '\u0614',
    nameArabic: 'علامة طي',
    nameEnglish: 'Arabic Sign Takhallus',
    transliteration: '',
    sound: 'Poetic sign',
    description: 'A sign used in poetry.',
    example: 'طٓ',
    exampleWord: 'Used in poetry',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0615': {
    unicode: 'U+0615',
    character: '\u0615',
    nameArabic: 'علامة ثناء',
    nameEnglish: 'Arabic Small High Tah',
    transliteration: '',
    sound: 'Quranic mark',
    description: 'A small high tah used in Quranic text.',
    example: 'ۛ',
    exampleWord: 'Used in Quran',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0616': {
    unicode: 'U+0616',
    character: '\u0616',
    nameArabic: 'علامة صغيرة عليا',
    nameEnglish: 'Arabic Small High Ligature Alef with Lam with Yeh',
    transliteration: '',
    sound: 'Quranic ligature',
    description: 'A small high ligature used in Quranic text.',
    example: 'ۖ',
    exampleWord: 'Used in Quran',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u0617': {
    unicode: 'U+0617',
    character: '\u0617',
    nameArabic: 'فتحة صغيرة عليا',
    nameEnglish: 'Arabic Small High Zain',
    transliteration: 'a',
    sound: 'Short "a" variant',
    description: 'A small high zain used as fatha variant in Quranic text.',
    example: 'بۗ',
    exampleWord: 'Variant fatha',
    color: '#f87171', // red-400 (like fatha)
    colorClass: 'text-red-400',
  },
  '\u0618': {
    unicode: 'U+0618',
    character: '\u0618',
    nameArabic: 'فتحة صغيرة',
    nameEnglish: 'Arabic Small Fatha',
    transliteration: 'a',
    sound: 'Short "a" sound',
    description: 'A small fatha used in Quranic text.',
    example: 'بۘ',
    exampleWord: 'Small fatha variant',
    color: '#f87171', // red-400 (like fatha)
    colorClass: 'text-red-400',
  },
  '\u0619': {
    unicode: 'U+0619',
    character: '\u0619',
    nameArabic: 'ضمة صغيرة',
    nameEnglish: 'Arabic Small Damma',
    transliteration: 'u',
    sound: 'Short "u" sound',
    description: 'A small damma used in Quranic text.',
    example: 'بۙ',
    exampleWord: 'Small damma variant',
    color: '#4ade80', // green-400 (like damma)
    colorClass: 'text-green-400',
  },
  '\u061A': {
    unicode: 'U+061A',
    character: '\u061A',
    nameArabic: 'كسرة صغيرة',
    nameEnglish: 'Arabic Small Kasra',
    transliteration: 'i',
    sound: 'Short "i" sound',
    description: 'A small kasra used in Quranic text.',
    example: 'بۚ',
    exampleWord: 'Small kasra variant',
    color: '#60a5fa', // blue-400 (like kasra)
    colorClass: 'text-blue-400',
  },

  // === Quranic Annotation Marks (U+06D6-U+06ED) ===
  '\u06D6': {
    unicode: 'U+06D6',
    character: '\u06D6',
    nameArabic: 'علامة وقف صلى',
    nameEnglish: 'Arabic Small High Ligature Sad with Lam with Alef Maksura',
    transliteration: '',
    sound: 'Recommended stop',
    description: 'A stop sign indicating a recommended pause in recitation.',
    example: 'ۖ',
    exampleWord: 'Waqf mark',
    color: '#22c55e', // green-500
    colorClass: 'text-green-500',
  },
  '\u06D7': {
    unicode: 'U+06D7',
    character: '\u06D7',
    nameArabic: 'علامة وقف قلى',
    nameEnglish: 'Arabic Small High Ligature Qaf with Lam with Alef Maksura',
    transliteration: '',
    sound: 'Permissible stop',
    description: 'A stop sign indicating permissible to stop.',
    example: 'ۗ',
    exampleWord: 'Waqf mark',
    color: '#22c55e', // green-500
    colorClass: 'text-green-500',
  },
  '\u06D8': {
    unicode: 'U+06D8',
    character: '\u06D8',
    nameArabic: 'علامة وقف ميم',
    nameEnglish: 'Arabic Small High Meem Initial Form',
    transliteration: '',
    sound: 'Compulsory stop',
    description: 'A stop sign indicating compulsory stop.',
    example: 'ۘ',
    exampleWord: 'Waqf lazim',
    color: '#ef4444', // red-500
    colorClass: 'text-red-500',
  },
  '\u06D9': {
    unicode: 'U+06D9',
    character: '\u06D9',
    nameArabic: 'علامة وقف لا',
    nameEnglish: 'Arabic Small High Lam Alef',
    transliteration: '',
    sound: 'No stop',
    description: 'A sign indicating do not stop here.',
    example: 'ۙ',
    exampleWord: 'La waqf',
    color: '#ef4444', // red-500
    colorClass: 'text-red-500',
  },
  '\u06DA': {
    unicode: 'U+06DA',
    character: '\u06DA',
    nameArabic: 'علامة وقف جيم',
    nameEnglish: 'Arabic Small High Jeem',
    transliteration: '',
    sound: 'Permissible stop',
    description: 'A sign indicating permissible stop with preference to continue.',
    example: 'ۚ',
    exampleWord: 'Waqf jaiz',
    color: '#eab308', // yellow-500
    colorClass: 'text-yellow-500',
  },
  '\u06DB': {
    unicode: 'U+06DB',
    character: '\u06DB',
    nameArabic: 'علامة ثلاث نقط',
    nameEnglish: 'Arabic Small High Three Dots',
    transliteration: '',
    sound: 'End of ayah variant',
    description: 'Three dots indicating end of ayah or section.',
    example: 'ۛ',
    exampleWord: 'Section marker',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06DC': {
    unicode: 'U+06DC',
    character: '\u06DC',
    nameArabic: 'سين صغيرة',
    nameEnglish: 'Arabic Small High Seen',
    transliteration: '',
    sound: 'Indicates saktah',
    description: 'A small seen mark indicating a brief pause (saktah) in recitation.',
    example: 'صۜ',
    exampleWord: 'Saktah mark',
    color: '#f472b6', // pink-400
    colorClass: 'text-pink-400',
  },
  '\u06DD': {
    unicode: 'U+06DD',
    character: '\u06DD',
    nameArabic: 'علامة نهاية الآية',
    nameEnglish: 'Arabic End of Ayah',
    transliteration: '',
    sound: 'End of verse',
    description: 'A decorative mark indicating end of an ayah.',
    example: '۝',
    exampleWord: 'End of ayah',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06DE': {
    unicode: 'U+06DE',
    character: '\u06DE',
    nameArabic: 'علامة بداية الربع',
    nameEnglish: 'Arabic Start of Rub El Hizb',
    transliteration: '',
    sound: 'Quarter marker',
    description: 'A decorative mark indicating start of a quarter (rub) of a hizb.',
    example: '۞',
    exampleWord: 'Rub el hizb',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06DF': {
    unicode: 'U+06DF',
    character: '\u06DF',
    nameArabic: 'دائرة صغيرة عليا',
    nameEnglish: 'Arabic Small High Rounded Zero',
    transliteration: '',
    sound: 'Zero/sukun variant',
    description: 'A small rounded zero used as sukun variant in some scripts.',
    example: 'ب۟',
    exampleWord: 'Sukun variant',
    color: '#a1a1aa', // gray-400 (like sukun)
    colorClass: 'text-gray-400',
  },
  '\u06E0': {
    unicode: 'U+06E0',
    character: '\u06E0',
    nameArabic: 'صفر مستطيل صغير',
    nameEnglish: 'Arabic Small High Upright Rectangular Zero',
    transliteration: '',
    sound: 'Zero/sukun variant',
    description: 'An upright rectangular zero used as sukun variant.',
    example: 'ب۠',
    exampleWord: 'Sukun variant',
    color: '#a1a1aa', // gray-400 (like sukun)
    colorClass: 'text-gray-400',
  },
  '\u06E1': {
    unicode: 'U+06E1',
    character: '\u06E1',
    nameArabic: 'سكون صغير',
    nameEnglish: 'Arabic Small High Dotless Head of Khah',
    transliteration: '∅',
    sound: 'No vowel (jazm)',
    description: 'A dotless khah head used as sukun/jazm in Quranic text.',
    example: 'بۡ',
    exampleWord: 'Jazm/sukun',
    color: '#a1a1aa', // gray-400 (like sukun)
    colorClass: 'text-gray-400',
  },
  '\u06E2': {
    unicode: 'U+06E2',
    character: '\u06E2',
    nameArabic: 'ميم صغيرة عليا',
    nameEnglish: 'Arabic Small High Meem Isolated Form',
    transliteration: 'm',
    sound: 'Hidden meem',
    description: 'A small meem indicating nasalization or hidden meem.',
    example: 'نۢ',
    exampleWord: 'Ikhfa/iqlab',
    color: '#c084fc', // purple-400
    colorClass: 'text-purple-400',
  },
  '\u06E3': {
    unicode: 'U+06E3',
    character: '\u06E3',
    nameArabic: 'سين صغيرة سفلى',
    nameEnglish: 'Arabic Small Low Seen',
    transliteration: '',
    sound: 'Pronunciation variant',
    description: 'A small low seen indicating pronunciation variant.',
    example: 'صۣ',
    exampleWord: 'Imala variant',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06E4': {
    unicode: 'U+06E4',
    character: '\u06E4',
    nameArabic: 'مدة صغيرة عليا',
    nameEnglish: 'Arabic Small High Madda',
    transliteration: 'ā',
    sound: 'Long vowel extension',
    description: 'A small madda indicating vowel lengthening.',
    example: 'اۤ',
    exampleWord: 'Madd mark',
    color: '#f472b6', // pink-400 (like maddah)
    colorClass: 'text-pink-400',
  },
  '\u06E5': {
    unicode: 'U+06E5',
    character: '\u06E5',
    nameArabic: 'واو صغيرة عليا',
    nameEnglish: 'Arabic Small Waw',
    transliteration: 'ū',
    sound: 'Long "oo" sound',
    description: 'A small waw indicating long "oo" vowel.',
    example: 'كۥ',
    exampleWord: 'Long u vowel',
    color: '#4ade80', // green-400 (damma family)
    colorClass: 'text-green-400',
  },
  '\u06E6': {
    unicode: 'U+06E6',
    character: '\u06E6',
    nameArabic: 'ياء صغيرة عليا',
    nameEnglish: 'Arabic Small Yeh',
    transliteration: 'ī',
    sound: 'Long "ee" sound',
    description: 'A small yeh indicating long "ee" vowel.',
    example: 'فۦ',
    exampleWord: 'Long i vowel',
    color: '#60a5fa', // blue-400 (kasra family)
    colorClass: 'text-blue-400',
  },
  '\u06E7': {
    unicode: 'U+06E7',
    character: '\u06E7',
    nameArabic: 'ياء صغيرة عليا',
    nameEnglish: 'Arabic Small High Yeh',
    transliteration: 'ī',
    sound: 'Long "ee" sound',
    description: 'A small high yeh indicating long vowel.',
    example: 'ىۧ',
    exampleWord: 'Long i vowel',
    color: '#60a5fa', // blue-400 (kasra family)
    colorClass: 'text-blue-400',
  },
  '\u06E8': {
    unicode: 'U+06E8',
    character: '\u06E8',
    nameArabic: 'نون صغيرة عليا',
    nameEnglish: 'Arabic Small High Noon',
    transliteration: 'n',
    sound: 'Hidden noon',
    description: 'A small noon indicating hidden noon sound.',
    example: 'مۨ',
    exampleWord: 'Ikhfa marker',
    color: '#c084fc', // purple-400
    colorClass: 'text-purple-400',
  },
  '\u06E9': {
    unicode: 'U+06E9',
    character: '\u06E9',
    nameArabic: 'علامة السجدة',
    nameEnglish: 'Arabic Place of Sajdah',
    transliteration: '',
    sound: 'Prostration point',
    description: 'A mark indicating a place of prostration during recitation.',
    example: '۩',
    exampleWord: 'Sajdah tilawah',
    color: '#ef4444', // red-500
    colorClass: 'text-red-500',
  },
  '\u06EA': {
    unicode: 'U+06EA',
    character: '\u06EA',
    nameArabic: 'دائرة فارغة سفلى',
    nameEnglish: 'Arabic Empty Centre Low Stop',
    transliteration: '',
    sound: 'Stop mark',
    description: 'An empty circle used as stop indicator.',
    example: 'ب۪',
    exampleWord: 'Stop variant',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06EB': {
    unicode: 'U+06EB',
    character: '\u06EB',
    nameArabic: 'دائرة ممتلئة سفلى',
    nameEnglish: 'Arabic Empty Centre High Stop',
    transliteration: '',
    sound: 'Stop mark',
    description: 'A filled circle used as stop indicator.',
    example: 'ب۫',
    exampleWord: 'Stop variant',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06EC': {
    unicode: 'U+06EC',
    character: '\u06EC',
    nameArabic: 'دائرة مدورة',
    nameEnglish: 'Arabic Rounded High Stop with Filled Centre',
    transliteration: '',
    sound: 'Stop mark',
    description: 'A rounded mark with filled center for stops.',
    example: 'ب۬',
    exampleWord: 'Stop variant',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
  '\u06ED': {
    unicode: 'U+06ED',
    character: '\u06ED',
    nameArabic: 'ميم صغيرة سفلى',
    nameEnglish: 'Arabic Small Low Meem',
    transliteration: 'm',
    sound: 'Hidden meem',
    description: 'A small low meem indicating hidden meem sound.',
    example: 'نۭ',
    exampleWord: 'Iqlab marker',
    color: '#c084fc', // purple-400
    colorClass: 'text-purple-400',
  },
};

// Unicode ranges for detecting harakat (expanded for Uthmani Quran text)
// Includes: standard harakat, extended Arabic marks, and Quranic annotation marks
export const HARAKAT_UNICODE_RANGE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;
export const HARAKAT_UNICODE_RANGE_GLOBAL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// All harakat characters for quick lookup (expanded for Uthmani Quran text)
export const ALL_HARAKAT_CHARS = new Set([
  // Standard Harakat (U+064B-U+0655)
  '\u064B', // Tanween Fath
  '\u064C', // Tanween Damm
  '\u064D', // Tanween Kasr
  '\u064E', // Fatha
  '\u064F', // Damma
  '\u0650', // Kasra
  '\u0651', // Shadda
  '\u0652', // Sukun
  '\u0653', // Maddah
  '\u0654', // Hamza above
  '\u0655', // Hamza below
  
  // Extended marks (U+0656-U+065F)
  '\u0656', // Subscript Alef
  '\u0657', // Inverted Damma
  '\u0658', // Mark Noon Ghunna
  '\u0659', // Zwarakay
  '\u065A', // Vowel Sign Small V Above
  '\u065B', // Vowel Sign Inverted Small V Above
  '\u065C', // Vowel Sign Dot Below
  '\u065D', // Reversed Damma
  '\u065E', // Fatha with Two Dots
  '\u065F', // Wavy Hamza Below
  
  // Superscript Alef
  '\u0670', // Superscript Alef (Dagger Alef)
  
  // Extended Arabic Marks (U+0610-U+061A)
  '\u0610', // Arabic Sign Sallallahu
  '\u0611', // Arabic Sign Alayhe
  '\u0612', // Arabic Sign Rahmatullahi
  '\u0613', // Arabic Sign Radi
  '\u0614', // Arabic Sign Takhallus
  '\u0615', // Arabic Small High Tah
  '\u0616', // Arabic Small High Ligature
  '\u0617', // Arabic Small High Zain
  '\u0618', // Arabic Small Fatha
  '\u0619', // Arabic Small Damma
  '\u061A', // Arabic Small Kasra
  
  // Quranic Annotation Marks (U+06D6-U+06ED)
  '\u06D6', // Small High Ligature Sad with Lam
  '\u06D7', // Small High Ligature Qaf with Lam
  '\u06D8', // Small High Meem Initial Form
  '\u06D9', // Small High Lam Alef
  '\u06DA', // Small High Jeem
  '\u06DB', // Small High Three Dots
  '\u06DC', // Small High Seen
  '\u06DD', // End of Ayah
  '\u06DE', // Start of Rub El Hizb
  '\u06DF', // Small High Rounded Zero
  '\u06E0', // Small High Upright Rectangular Zero
  '\u06E1', // Small High Dotless Head of Khah (Jazm)
  '\u06E2', // Small High Meem Isolated Form
  '\u06E3', // Small Low Seen
  '\u06E4', // Small High Madda
  '\u06E5', // Small Waw
  '\u06E6', // Small Yeh
  '\u06E7', // Small High Yeh
  '\u06E8', // Small High Noon
  '\u06E9', // Place of Sajdah
  '\u06EA', // Empty Centre Low Stop
  '\u06EB', // Empty Centre High Stop
  '\u06EC', // Rounded High Stop with Filled Centre
  '\u06ED', // Small Low Meem
]);

/**
 * Check if a character is a harakat
 */
export function isHarakat(char: string): boolean {
  return ALL_HARAKAT_CHARS.has(char);
}

/**
 * Get the definition for a harakat character
 */
export function getHarakatDefinition(char: string): HarakatDefinition | null {
  return HARAKAT_DEFINITIONS[char] || QURANIC_MARKS[char] || null;
}

/**
 * Get the color for a harakat character
 */
export function getHarakatColor(char: string): string {
  const def = getHarakatDefinition(char);
  return def?.color || '#ffffff';
}

/**
 * Get the Tailwind color class for a harakat character
 */
export function getHarakatColorClass(char: string): string {
  const def = getHarakatDefinition(char);
  return def?.colorClass || 'text-white';
}

/**
 * Parse Arabic text and return segments with harakat information
 */
export interface TextSegment {
  text: string;
  isHarakat: boolean;
  definition: HarakatDefinition | null;
}

export function parseArabicText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentNonHarakat = '';
  
  for (const char of text) {
    if (isHarakat(char)) {
      // Push any accumulated non-harakat text
      if (currentNonHarakat) {
        segments.push({
          text: currentNonHarakat,
          isHarakat: false,
          definition: null,
        });
        currentNonHarakat = '';
      }
      // Push the harakat
      segments.push({
        text: char,
        isHarakat: true,
        definition: getHarakatDefinition(char),
      });
    } else {
      currentNonHarakat += char;
    }
  }
  
  // Push any remaining non-harakat text
  if (currentNonHarakat) {
    segments.push({
      text: currentNonHarakat,
      isHarakat: false,
      definition: null,
    });
  }
  
  return segments;
}

/**
 * Get all harakat definitions as an array for legend display
 */
export function getAllHarakatForLegend(): HarakatDefinition[] {
  return Object.values(HARAKAT_DEFINITIONS);
}

/**
 * Group harakat by category for organized display
 */
export interface HarakatCategory {
  name: string;
  nameArabic: string;
  harakat: HarakatDefinition[];
}

export function getHarakatByCategory(): HarakatCategory[] {
  return [
    {
      name: 'Short Vowels',
      nameArabic: 'الحَرَكَات القَصِيرَة',
      harakat: [
        HARAKAT_DEFINITIONS['\u064E'], // Fatha
        HARAKAT_DEFINITIONS['\u0650'], // Kasra
        HARAKAT_DEFINITIONS['\u064F'], // Damma
      ],
    },
    {
      name: 'Nunation (Tanween)',
      nameArabic: 'التَّنْوِين',
      harakat: [
        HARAKAT_DEFINITIONS['\u064B'], // Tanween Fath
        HARAKAT_DEFINITIONS['\u064D'], // Tanween Kasr
        HARAKAT_DEFINITIONS['\u064C'], // Tanween Damm
      ],
    },
    {
      name: 'Other Marks',
      nameArabic: 'عَلَامَات أُخْرَى',
      harakat: [
        HARAKAT_DEFINITIONS['\u0652'], // Sukun
        HARAKAT_DEFINITIONS['\u0651'], // Shadda
        HARAKAT_DEFINITIONS['\u0653'], // Maddah
        HARAKAT_DEFINITIONS['\u0670'], // Superscript Alef
      ],
    },
  ];
}

