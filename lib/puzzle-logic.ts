/**
 * Puzzle Logic - Ported from Expo WordPuzzle component
 * Removed React Native dependencies, pure TypeScript
 */

// PERFORMANCE: Conditional logging - only in development
const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : (..._args: any[]) => {};

export type WordToken = {
  id: string;
  text: string;
  norm: string;
  position: number;
  transliteration?: string;
};

export type PuzzleValidationResult = {
  isCorrect: boolean;
  correctCount: number;
  totalCount: number;
  mistakes: number;
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Normalize Arabic text for comparison
 * Removes diacritics, normalizes characters, etc.
 */
export function normalizeArabic(input: string): string {
  if (!input) return '';
  
  const original = input;
  let out = input.normalize('NFKD');
  
  // Remove tashkeel and Quranic annotation marks (all diacritics)
  out = out.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '');
  
  // Remove kashida (tatweel)
  out = out.replace(/\u0640/g, '');
  
  // Remove zero-width characters and invisible formatting
  out = out.replace(/[\u200c\u200d\u200e\u200f\ufeff\u2060\u2061\u2062\u2063]/g, '');
  
  // Normalize Alef forms to bare Alef
  out = out.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
  
  // Normalize Lam-Alef ligatures to Lam + Alef
  out = out.replace(/[\ufefb\ufefc\ufef7\ufef8\ufef5\ufef6]/g, '\u0644\u0627');
  
  // Normalize Alef Maqsura to Ya
  out = out.replace(/\u0649/g, '\u064A');
  
  // Normalize Teh Marbuta to Heh
  out = out.replace(/\u0629/g, '\u0647');
  
  // Strip Arabic punctuation/marks
  out = out.replace(/[\u061B\u061F\u060C\u066B\u066C\u0670]/g, '');
  
  // Collapse whitespace and trim
  out = out.replace(/\s+/g, ' ').trim();
  
  // Final NFC normalization for consistent comparison
  const normalized = out.normalize('NFC');
  
  // Debug logging for normalization differences
  if (DEBUG && original !== normalized) {
    log('[NORMALIZE]', {
      original,
      normalized,
      originalBytes: [...original].map(c => c.charCodeAt(0).toString(16)),
      normalizedBytes: [...normalized].map(c => c.charCodeAt(0).toString(16)),
    });
  }
  
  return normalized;
}

/**
 * Known Muqatta'at (Huruf al-Muqatta'at) - isolated letters that start some surahs
 * These should be separated letter by letter in the puzzle
 */
const MUQATTAAT_PATTERNS = [
  // Exact matches for the known Muqatta'at
  'الم', 'المص', 'الر', 'المر', 'كهيعص', 'طه', 'طسم', 'طس', 'يس', 'ص', 'حم', 'حم عسق', 'عسق', 'ق', 'ن',
  // With diacritics variations
  'الٓمٓ', 'الٓمٓصٓ', 'الٓرٰ', 'الٓمٓرٰ', 'كٓهيعٓصٓ', 'طٰهٰ', 'طٰسٓمٓ', 'طٰسٓ', 'يٰسٓ', 'صٓ', 'حٰمٓ', 'قٓ', 'نٓ',
  // Additional variations
  'الۤمۤ', 'الۤمۤصۤ', 'الۤرٰ', 'الۤمۤرٰ',
];

/**
 * Check if a word is a Muqatta'at (isolated letter pattern)
 */
function isMuqattaat(word: string): boolean {
  const normalized = normalizeArabic(word);
  
  // Check exact matches
  for (const pattern of MUQATTAAT_PATTERNS) {
    if (normalizeArabic(pattern) === normalized) {
      return true;
    }
  }
  
  // Check if it matches common Muqatta'at patterns (short words with specific letters)
  const muqattaatLetters = ['ا', 'ل', 'م', 'ر', 'ح', 'ط', 'س', 'ي', 'ص', 'ق', 'ن', 'ع', 'ك', 'ه'];
  
  // Remove diacritics for pattern matching
  const cleanWord = normalized.replace(/\s/g, '');
  
  // Muqatta'at are typically 1-5 letters and only contain specific letters
  if (cleanWord.length >= 1 && cleanWord.length <= 6) {
    const allLettersAreMuqattaat = [...cleanWord].every(char => 
      muqattaatLetters.includes(char) || char === ' '
    );
    
    // Additional check: these words appear at the beginning of surahs
    // and are typically read as individual letters
    if (allLettersAreMuqattaat) {
      // Known normalized patterns
      const knownNormalized = [
        'الم', 'المص', 'الر', 'المر', 'كهيعص', 'طه', 'طسم', 'طس', 'يس', 'ص', 'حم', 'عسق', 'ق', 'ن'
      ];
      return knownNormalized.includes(cleanWord);
    }
  }
  
  return false;
}

/**
 * Separate a Muqatta'at word into individual letters
 * Each letter becomes its own token
 */
function separateMuqattaatLetters(word: string): string[] {
  // Remove diacritics but preserve the original characters
  const letters: string[] = [];
  let currentLetter = '';
  
  for (const char of word) {
    // Check if it's a base Arabic letter
    const isBaseLetter = /[\u0621-\u063A\u0641-\u064A]/.test(char);
    // Check if it's a diacritic or modifier
    const isDiacritic = /[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u0670]/.test(char);
    // Check if it's a special marker (like superscript alef)
    const isMarker = /[\u0653-\u0655\u06E5-\u06E6]/.test(char);
    
    if (isBaseLetter) {
      if (currentLetter) {
        letters.push(currentLetter);
      }
      currentLetter = char;
    } else if (isDiacritic || isMarker) {
      // Add diacritic to current letter
      currentLetter += char;
    } else if (char.trim() === '') {
      // Skip whitespace
      if (currentLetter) {
        letters.push(currentLetter);
        currentLetter = '';
      }
    } else {
      // Other characters (like special marks)
      currentLetter += char;
    }
  }
  
  if (currentLetter) {
    letters.push(currentLetter);
  }
  
  return letters.filter(l => l.trim() !== '');
}

/**
 * Tokenize an Ayah text into word tokens
 */
export function tokenizeAyah(ayahText: string): WordToken[] {
  const trimmed = ayahText.trim();
  if (!trimmed) return [];
  
  const parts = trimmed
    .split(/\s+/)
    .filter(Boolean);
  
  // Check if the first word is a Muqatta'at
  const firstWord = parts[0] || '';
  const firstWordIsMuqattaat = isMuqattaat(firstWord);
  
  // Process parts - combine small particles with following words
  const processedParts: string[] = [];
  const arabicParticles = [
    'من', 'إلى', 'في', 'على', 'عن', 'مع', 'ب', 'ل', 'ك', 'ه', 'و', 'ف', 'ثم', 'أو', 'لكن', 
    'إلا', 'إن', 'أن', 'ما', 'لا', 'كل', 'بعض', 'أي', 'أين', 'متى', 'كيف', 'لماذا', 'ماذا',
    'عند', 'لدى', 'حول', 'خلال', 'بعد', 'قبل', 'قد', 'سوف', 'كان', 'يكون', 'كانت', 'تكون'
  ];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Skip Muqatta'at from particle processing - they'll be handled separately
    if (i === 0 && firstWordIsMuqattaat) {
      processedParts.push(part);
      continue;
    }
    
    const isPunctuation = part.length <= 3 && /^[^\u0600-\u06FF]*$/.test(part);
    const isTripleDots = part === '...' || part === '…';
    const isCommonPunctuation = /^[.,;:!?()\[\]{}""''«»…]+$/.test(part);
    const isSmallArabicParticle = part.length <= 2 && /^[\u0600-\u06FF]+$/.test(part);
    const isKnownParticle = arabicParticles.includes(part);
    
    if (isPunctuation || isTripleDots || isCommonPunctuation) {
      if (processedParts.length > 0) {
        processedParts[processedParts.length - 1] += ' ' + part;
      } else {
        processedParts.push(part);
      }
    } else if (isSmallArabicParticle || isKnownParticle) {
      if (i < parts.length - 1) {
        const nextPart = parts[i + 1];
        if (nextPart && /^[\u0600-\u06FF]+/.test(nextPart)) {
          processedParts.push(part + ' ' + nextPart);
          i++; // Skip next part as we've combined it
        } else {
          processedParts.push(part);
        }
      } else {
        if (processedParts.length > 0) {
          processedParts[processedParts.length - 1] += ' ' + part;
        } else {
          processedParts.push(part);
        }
      }
    } else {
      processedParts.push(part);
    }
  }

  // Now create tokens
  let order = 0;
  let tokenCounter = 0;
  const tokens: WordToken[] = [];
  
  // Track word occurrences for debugging duplicates
  const wordNormMap = new Map<string, number>();
  
  for (let i = 0; i < processedParts.length; i++) {
    const word = processedParts[i];
    
    // Check if this is a Muqatta'at (only for first word)
    if (i === 0 && firstWordIsMuqattaat) {
      const letters = separateMuqattaatLetters(word);
      for (const letter of letters) {
        const norm = normalizeArabic(letter);
        const count = (wordNormMap.get(norm) || 0) + 1;
        wordNormMap.set(norm, count);
        
        const token = {
          id: `token-${tokenCounter++}-${order}`,
          text: letter,
          norm,
          position: order++,
        };
        tokens.push(token);
        
        if (DEBUG && count > 1) {
          log(`[DUPLICATE] Token created (${count}x):`, { 
            id: token.id, 
            text: token.text, 
            norm: token.norm,
            position: token.position 
          });
        }
      }
    } else {
      const norm = normalizeArabic(word);
      const count = (wordNormMap.get(norm) || 0) + 1;
      wordNormMap.set(norm, count);
      
      const token = {
        id: `token-${tokenCounter++}-${order}`,
        text: word,
        norm,
        position: order++,
      };
      tokens.push(token);
      
      if (DEBUG && count > 1) {
        log(`[DUPLICATE] Token created (${count}x):`, { 
          id: token.id, 
          text: token.text, 
          norm: token.norm,
          position: token.position 
        });
      }
    }
  }
  
  // Log summary of duplicates
  if (DEBUG) {
    const duplicates = Array.from(wordNormMap.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      log('[TOKENIZATION] Duplicate words found:', duplicates.map(([norm, count]) => `"${norm}" (${count}x)`).join(', '));
    }
  }

  return tokens;
}

/**
 * Validate if the user's answer matches the correct order
 */
export function validatePuzzleAnswer(
  userAnswer: WordToken[],
  correctTokens: WordToken[]
): PuzzleValidationResult {
  let correctCount = 0;
  const totalCount = correctTokens.length;

  for (let i = 0; i < userAnswer.length && i < correctTokens.length; i++) {
    if (userAnswer[i].norm === correctTokens[i].norm) {
      correctCount++;
    }
  }

  const isCorrect = correctCount === totalCount && userAnswer.length === correctTokens.length;
  const mistakes = totalCount - correctCount;

  return {
    isCorrect,
    correctCount,
    totalCount,
    mistakes,
  };
}

/**
 * Check if a word placement is correct at a specific position
 */
export function isWordCorrectAtPosition(
  token: WordToken,
  position: number,
  correctTokens: WordToken[]
): boolean {
  if (position >= correctTokens.length) return false;
  return token.norm === correctTokens[position].norm;
}

/**
 * Get the correct token for a given position
 */
export function getCorrectTokenAtPosition(
  position: number,
  correctTokens: WordToken[]
): WordToken | null {
  if (position >= correctTokens.length) return null;
  return correctTokens[position];
}
