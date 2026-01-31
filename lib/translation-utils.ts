/**
 * Utility functions for cleaning and formatting translation text
 */

/**
 * Remove HTML tags and footnote markers from translation text
 * Some translations from Quran.com API contain HTML like <sup foot_note=195932>1</sup>
 */
export function cleanTranslationText(text: string): string {
  if (!text) return text;
  
  // Remove <sup> tags with footnote markers
  // Examples: <sup foot_note=195932>1</sup>, <sup>1</sup>
  let cleaned = text.replace(/<sup[^>]*>.*?<\/sup>/gi, '');
  
  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Extract footnote references from translation text
 * Returns array of footnote numbers/IDs if any exist
 */
export function extractFootnotes(text: string): string[] {
  if (!text) return [];
  
  const footnotes: string[] = [];
  const regex = /<sup[^>]*foot_note[^>]*>([^<]+)<\/sup>/gi;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    footnotes.push(match[1]);
  }
  
  return footnotes;
}

