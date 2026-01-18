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
};

// Extended Quranic marks (less common but found in Quran)
export const QURANIC_MARKS: Record<string, HarakatDefinition> = {
  // Small high seen
  '\u06DC': {
    unicode: 'U+06DC',
    character: '\u06DC',
    nameArabic: 'صَادٌ صَغِيرَة',
    nameEnglish: 'Small High Seen',
    transliteration: '',
    sound: 'Indicates pronunciation variant',
    description: 'A small seen mark indicating a pronunciation variant in Quranic recitation.',
    example: 'صۜ',
    exampleWord: 'Used in specific Quranic verses',
    color: '#94a3b8', // slate-400
    colorClass: 'text-slate-400',
  },
};

// Unicode ranges for detecting harakat
export const HARAKAT_UNICODE_RANGE = /[\u064B-\u065F\u0670]/;
export const HARAKAT_UNICODE_RANGE_GLOBAL = /[\u064B-\u065F\u0670]/g;

// All harakat characters for quick lookup
export const ALL_HARAKAT_CHARS = new Set([
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
  '\u0670', // Superscript Alef
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

