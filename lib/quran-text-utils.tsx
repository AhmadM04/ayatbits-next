import React from 'react';

/**
 * Quran Waqf (Stop) Marks Unicode Range
 * U+06D6 - U+06DC: Small High Letters (Jeem, Lam-Alif, Meem, etc.)
 * U+06DF - U+06E8: Additional Quranic symbols and stop signs
 * 
 * These marks indicate where to pause or stop while reciting.
 */
const WAQF_MARKS_REGEX = /([\u06D6-\u06DC\u06DF-\u06E8]+)/g;

/**
 * Formats Quranic Uthmani text by wrapping Waqf marks in colored spans
 * 
 * @param text - The Uthmani text string from the Quran API
 * @returns Array of React elements with Waqf marks styled differently
 */
export function formatQuranText(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts = text.split(WAQF_MARKS_REGEX);
  
  return parts.map((part, index) => {
    // Check if this part is a Waqf mark
    if (WAQF_MARKS_REGEX.test(part)) {
      // Reset regex lastIndex for next test
      WAQF_MARKS_REGEX.lastIndex = 0;
      
      return (
        <span 
          key={index} 
          className="text-amber-600/90"
          style={{ fontSize: '0.85em' }}
        >
          {part}
        </span>
      );
    }
    
    // Regular text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Alternative version that returns a single React element
 * Useful when you need a single node instead of an array
 */
export function formatQuranTextSingle(text: string): React.ReactNode {
  return <>{formatQuranText(text)}</>;
}

/**
 * List of common Waqf marks and their meanings (for reference)
 */
export const WAQF_MARKS_INFO = {
  '\u06D6': 'Small High Lam-Alif (ۖ) - Stopping prohibited',
  '\u06D7': 'Small High Zain (ۗ) - Continuation preferred',
  '\u06D8': 'Small High Meem-initial (ۘ) - Must stop',
  '\u06D9': 'Small High Lam-Alif-initial (ۙ) - May stop',
  '\u06DA': 'Small High Jeem (ۚ) - Permissible stop',
  '\u06DB': 'Small High Three Dots (ۛ) - Preferable stop',
  '\u06DC': 'Small High Seen (ۜ) - Preferable continuation',
  '\u06DD': 'End of Ayah (۝)',
  '\u06DE': 'Start of Rub el Hizb (۞)',
  '\u06DF': 'Small High Rounded Zero (۟)',
  '\u06E0': 'Small High Upright Rectangular Zero (۠)',
  '\u06E1': 'Small High Dotless Head of Khah (ۡ)',
  '\u06E2': 'Small High Meem Isolated (ۢ)',
  '\u06E3': 'Small Low Seen (ۣ)',
  '\u06E4': 'Small High Madda (ۤ)',
  '\u06E5': 'Small Waw (ۥ)',
  '\u06E6': 'Small Yeh (ۦ)',
  '\u06E7': 'Small High Yeh (ۧ)',
  '\u06E8': 'Small High Noon (ۨ)',
};

