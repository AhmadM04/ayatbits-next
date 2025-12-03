/**
 * Puzzle Logic - Ported from Expo WordPuzzle component
 * Removed React Native dependencies, pure TypeScript
 */

export type WordToken = {
  id: string;
  text: string;
  norm: string;
  position: number;
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
  let out = input.normalize('NFKD');
  // Remove tashkeel and Quranic annotation marks
  out = out.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '');
  // Remove kashida
  out = out.replace(/\u0640/g, '');
  // Remove zero-width characters
  out = out.replace(/[\u200c\u200d\u200e\u200f\ufeff]/g, '');
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
  // Collapse whitespace
  out = out.replace(/\s+/g, ' ').trim();
  // NFC
  return out.normalize('NFC');
}

/**
 * Check if a word should be separated into individual letters
 */
function shouldSeparateLetters(word: string): boolean {
  const isolatedLetterWords = [
    'الْم', 'الر', 'المر', 'كهيعص', 'طه', 'طس', 'طسم', 'يس', 'ص', 'ق', 'ن', 'حم', 'عسق'
  ];

  if (isolatedLetterWords.includes(word)) {
    return true;
  }

  if (word.length <= 4 && word.length > 1) {
    const isAllArabic = /^[\u0600-\u06FF]+$/.test(word);
    if (isAllArabic) {
      const isolatedLetters = ['ا', 'ل', 'م', 'ر', 'ح', 'ط', 'س', 'ي', 'ص', 'ق', 'ن', 'ع', 'ك', 'ه'];
      const hasIsolatedLetters = isolatedLetters.some(letter => word.includes(letter));
      return hasIsolatedLetters;
    }
  }

  return false;
}

/**
 * Separate a word into individual letters
 */
function separateIntoLetters(word: string): string[] {
  return word.split('').filter(char => char.trim() !== '');
}

/**
 * Tokenize an Ayah text into word tokens
 */
export function tokenizeAyah(ayahText: string): WordToken[] {
  const parts = ayahText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((acc: string[], part: string, index: number, array: string[]) => {
      const isPunctuation = part.length <= 3 && /^[^\u0600-\u06FF]*$/.test(part);
      const isTripleDots = part === '...' || part === '…';
      const isCommonPunctuation = /^[.,;:!?()\[\]{}""''«»…]+$/.test(part);
      const isSmallArabicParticle = part.length <= 4 && /^[\u0600-\u06FF]+$/.test(part);
      const arabicParticles = [
        'من', 'إلى', 'في', 'على', 'عن', 'مع', 'ب', 'ل', 'ك', 'ه', 'هذا', 'هذه', 'ذلك', 'تلك',
        'التي', 'الذي', 'اللذان', 'اللتان', 'الذين', 'اللاتي', 'اللائي', 'اللذين', 'اللتين',
        'و', 'ف', 'ثم', 'أو', 'لكن', 'إلا', 'إن', 'أن', 'ما', 'لا', 'كل', 'بعض', 'أي', 'أين',
        'متى', 'كيف', 'لماذا', 'ماذا', 'عند', 'لدى', 'حول', 'خلال', 'بعد', 'قبل',
        'توا', 'قد', 'سوف', 'كان', 'يكون', 'كانت', 'تكون', 'كانوا', 'يكونوا'
      ];
      const isKnownParticle = arabicParticles.includes(part);

      if (isPunctuation || isTripleDots || isCommonPunctuation) {
        if (acc.length > 0) {
          acc[acc.length - 1] += ' ' + part;
        } else {
          acc.push(part);
        }
      } else if (isSmallArabicParticle || isKnownParticle) {
        if (index < array.length - 1) {
          const nextPart = array[index + 1];
          if (nextPart && /^[\u0600-\u06FF]+/.test(nextPart)) {
            acc.push(part + ' ' + nextPart);
            array.splice(index + 1, 1);
          } else {
            acc.push(part);
          }
        } else {
          if (acc.length > 0) {
            acc[acc.length - 1] += ' ' + part;
          } else {
            acc.push(part);
          }
        }
      } else {
        acc.push(part);
      }
      return acc;
    }, []);

  let order = 0;
  let tokenCounter = 0;
  const tokens: WordToken[] = [];
  
  parts.forEach((word) => {
    if (shouldSeparateLetters(word)) {
      const letters = separateIntoLetters(word);
      letters.forEach((letter) => {
        tokens.push({
          id: `token-${tokenCounter++}-${order}`,
          text: letter,
          norm: normalizeArabic(letter),
          position: order++,
        });
      });
    } else {
      tokens.push({
        id: `token-${tokenCounter++}-${order}`,
        text: word,
        norm: normalizeArabic(word),
        position: order++,
      });
    }
  });

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

