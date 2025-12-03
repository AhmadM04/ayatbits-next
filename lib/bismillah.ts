/**
 * Utility functions for handling Bismillah (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ)
 * Bismillah appears at the start of the first ayah of most surahs (except Al-Fatiha and At-Tawbah)
 */

export const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

/**
 * Check if a surah should have Bismillah at the start of its first ayah
 * @param surahNumber - The surah number (1-114)
 * @returns true if the surah should have Bismillah
 */
export function shouldShowBismillah(surahNumber: number): boolean {
  // Al-Fatiha (1) has Bismillah as part of ayah 1, not separate
  // At-Tawbah (9) doesn't have Bismillah at all
  return surahNumber !== 1 && surahNumber !== 9;
}

/**
 * Separate Bismillah from the ayah text
 * @param ayahText - The full ayah text
 * @param surahNumber - The surah number
 * @param ayahNumber - The ayah number
 * @returns Object with separated bismillah and remaining ayah text
 */
export function separateBismillah(
  ayahText: string,
  surahNumber: number,
  ayahNumber: number
): { bismillah: string | null; ayahText: string } {
  // Only separate for first ayah of surahs that should have Bismillah
  if (ayahNumber !== 1 || !shouldShowBismillah(surahNumber)) {
    return { bismillah: null, ayahText };
  }

  // Check if ayah text starts with Bismillah
  const trimmedText = ayahText.trim();
  
  // Normalize whitespace for comparison
  const normalizedBismillah = BISMILLAH.replace(/\s+/g, ' ').trim();
  const normalizedAyah = trimmedText.replace(/\s+/g, ' ').trim();
  
  if (normalizedAyah.startsWith(normalizedBismillah)) {
    // Remove Bismillah from the start
    const remainingText = normalizedAyah.slice(normalizedBismillah.length).trim();
    return {
      bismillah: BISMILLAH,
      ayahText: remainingText || '', // Return empty string if only Bismillah
    };
  }

  return { bismillah: null, ayahText };
}

