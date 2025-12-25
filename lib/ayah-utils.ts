/**
 * Utility functions for handling Ayah text
 */

// The bismillah text with diacritics (multiple variations)
export const BISMILLAH_TEXT = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
export const BISMILLAH_DISPLAY = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

/**
 * Check if bismillah should be shown separately for this surah
 * Returns true for all surahs except Al-Fatiha (surah 1) and At-Tawbah (surah 9)
 * At-Tawbah doesn't have bismillah
 */
export function shouldShowBismillahSeparately(surahNumber: number): boolean {
  // Al-Fatiha (1): Bismillah is part of the ayah
  // At-Tawbah (9): No bismillah at all
  return surahNumber !== 1 && surahNumber !== 9;
}

/**
 * Normalize Arabic text by removing diacritics and normalizing alef forms
 */
function normalizeForComparison(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKD')
    // Remove all diacritics
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u0670]/g, '')
    // Normalize alef forms (alef with wasla, alef with hamza, etc.) to regular alef
    .replace(/[\u0622\u0623\u0625\u0627\u0671]/g, 'ا')
    // Remove kashida
    .replace(/\u0640/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a text contains bismillah at the beginning
 */
export function hasBismillah(text: string): boolean {
  if (!text || !text.trim()) return false;
  
  const normalizedText = normalizeForComparison(text);
  const normalizedBismillah = normalizeForComparison('بسم الله الرحمن الرحيم');
  
  return normalizedText.startsWith(normalizedBismillah);
}

/**
 * Remove bismillah from ayah text if it's the first ayah of a surah (except Al-Fatiha)
 */
export function cleanAyahText(
  ayahText: string,
  surahNumber: number,
  ayahNumber: number
): string {
  // Al-Fatiha (surah 1) should keep bismillah as it's part of the first ayah
  if (surahNumber === 1) {
    return ayahText;
  }

  // Only process first ayah of other surahs
  if (ayahNumber !== 1) {
    return ayahText;
  }

  // At-Tawbah (surah 9) doesn't have bismillah
  if (surahNumber === 9) {
    return ayahText;
  }

  if (!ayahText || !ayahText.trim()) {
    return ayahText;
  }

  const trimmed = ayahText.trim();
  
  // Check if it has bismillah using normalized comparison
  if (!hasBismillah(trimmed)) {
    return ayahText;
  }

  // Find the bismillah pattern and remove it
  // Match various forms of bismillah including:
  // - بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
  // - بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  // - And other diacritic variations
  
  // Split into words and find where bismillah ends
  const words = trimmed.split(/\s+/);
  let bismillahEndIndex = 0;
  
  // Bismillah is typically 4 words: بسم الله الرحمن الرحيم
  // We check normalized versions
  const bismillahWords = ['بسم', 'الله', 'الرحمن', 'الرحيم'];
  
  for (let i = 0; i < Math.min(words.length, 4); i++) {
    const normalizedWord = normalizeForComparison(words[i]);
    if (normalizedWord === bismillahWords[i]) {
      bismillahEndIndex = i + 1;
    } else {
      break;
    }
  }
  
  if (bismillahEndIndex === 4) {
    // Found complete bismillah, remove it
    const remaining = words.slice(4).join(' ').trim();
    return remaining || ayahText; // Return original if nothing left
  }
  
  return ayahText; // Return original if pattern not found
}

/**
 * Extract bismillah from the text if present
 * Returns { bismillah: string | null, remainingText: string }
 */
export function extractBismillah(
  ayahText: string,
  surahNumber: number,
  ayahNumber: number
): { bismillah: string | null; remainingText: string } {
  // Al-Fatiha (surah 1) - bismillah is part of the ayah
  if (surahNumber === 1) {
    return { bismillah: null, remainingText: ayahText };
  }

  // Only first ayah has bismillah
  if (ayahNumber !== 1) {
    return { bismillah: null, remainingText: ayahText };
  }

  // At-Tawbah (surah 9) doesn't have bismillah
  if (surahNumber === 9) {
    return { bismillah: null, remainingText: ayahText };
  }

  if (!ayahText || !ayahText.trim()) {
    return { bismillah: null, remainingText: ayahText };
  }

  // Check if the text has bismillah
  if (hasBismillah(ayahText)) {
    const cleanedText = cleanAyahText(ayahText, surahNumber, ayahNumber);
    return {
      bismillah: BISMILLAH_DISPLAY,
      remainingText: cleanedText,
    };
  }

  return { bismillah: null, remainingText: ayahText };
}

/**
 * Check if an ayah is a Muqatta'at (isolated letters at the start of surahs)
 * This is used to determine if the first ayah should be treated specially
 */
export function isMuqattaatAyah(ayahText: string, surahNumber: number, ayahNumber: number): boolean {
  // Only first (or second after bismillah removal) ayah can be Muqatta'at
  if (ayahNumber > 1) return false;
  
  // Surahs that start with Muqatta'at
  const muqattaatSurahs = [2, 3, 7, 10, 11, 12, 13, 14, 15, 19, 20, 26, 27, 28, 29, 30, 31, 32, 36, 38, 40, 41, 42, 43, 44, 45, 46, 50, 68];
  
  return muqattaatSurahs.includes(surahNumber);
}
