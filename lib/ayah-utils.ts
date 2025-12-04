/**
 * Remove bismillah from the first ayah of surahs (except Al-Fatiha)
 * The bismillah (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ) should not be part of the first ayah
 * for surahs 2-114, but it is part of Al-Fatiha (surah 1).
 */

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

  if (!ayahText || !ayahText.trim()) {
    return ayahText;
  }

  let cleaned = ayahText.trim();

  // Pattern to match bismillah at the start (with various diacritic variations)
  // بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
  // This regex handles:
  // - Various forms of bismillah with different diacritics
  // - Optional spaces
  // - Optional punctuation after bismillah
  const bismillahRegex = /^بِسْمِ\s*اللَّهِ\s*الرَّحْمَ?ٰ?نِ\s*الرَّحِيمِ\s*[،\s]*/i;
  
  // Try direct match first
  if (bismillahRegex.test(cleaned)) {
    cleaned = cleaned.replace(bismillahRegex, '').trim();
    return cleaned || ayahText; // Return original if cleaning results in empty string
  }

  // Also try normalized comparison (removing diacritics for matching)
  const normalizedText = cleaned
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const normalizedBismillah = 'بسم الله الرحمن الرحيم';
  
  if (normalizedText.startsWith(normalizedBismillah)) {
    // Find where bismillah ends in the original text
    // We'll search for the pattern more carefully
    const bismPattern = /بِسْمِ[\s\u0640]*اللَّهِ[\s\u0640]*الرَّحْمَ?ٰ?نِ[\s\u0640]*الرَّحِيمِ/i;
    const match = cleaned.match(bismPattern);
    if (match && match.index === 0) {
      cleaned = cleaned.substring(match[0].length).trim();
      // Remove any leading punctuation or spaces
      cleaned = cleaned.replace(/^[،\s\u0640]+/, '').trim();
      return cleaned || ayahText;
    }
  }

  return ayahText; // Return original if no bismillah found
}

