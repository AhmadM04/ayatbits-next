/**
 * Tajweed/Harakat Color Parser
 * 
 * This utility colorizes Arabic diacritics (harakats) for Tajweed visualization
 * without breaking the Arabic cursive text shaping.
 * 
 * Performance: Uses RegEx for efficient parsing on mobile devices.
 */

// Harakat Unicode mappings with Tailwind color classes
const HARAKAT_COLORS: Record<string, string> = {
  '\u064E': 'text-red-400',      // Fatha (َ)
  '\u064F': 'text-green-400',    // Damma (ُ)
  '\u0650': 'text-blue-400',     // Kasra (ِ)
  '\u0652': 'text-gray-400',     // Sukun (ْ)
  '\u0651': 'text-orange-400',   // Shadda (ّ)
  '\u064B': 'text-red-300',      // Tanween Fatha (ً)
  '\u064C': 'text-green-300',    // Tanween Damma (ٌ)
  '\u064D': 'text-blue-300',     // Tanween Kasra (ٍ)
  '\u0653': 'text-purple-400',   // Maddah (ٓ)
  '\u0654': 'text-yellow-400',   // Hamza Above (ٔ)
  '\u0655': 'text-yellow-400',   // Hamza Below (ٕ)
  '\u0656': 'text-teal-400',     // Subscript Alef (ٖ)
  '\u0657': 'text-pink-400',     // Inverted Damma (ٗ)
  '\u0658': 'text-indigo-400',   // Mark Noon Ghunna (٘)
};

// Waqf/Stop marks (U+06D6 - U+06DC, U+06DF - U+06E8)
const WAQF_MARKS_PATTERN = '[\u06D6-\u06DC\u06DF-\u06E8]';

// Combined pattern for all colorizable marks
const COLORIZABLE_MARKS_PATTERN = new RegExp(
  `([${Object.keys(HARAKAT_COLORS).map(k => k).join('')}]|${WAQF_MARKS_PATTERN})`,
  'g'
);

/**
 * Colorizes Quranic text by wrapping harakats and waqf marks in colored spans
 * 
 * @param text - The Uthmani text string
 * @returns HTML string with colored diacritics (safe for dangerouslySetInnerHTML)
 */
export function colorizeHarakat(text: string): string {
  if (!text) return '';

  // Replace each harakat/waqf mark with a colored span
  return text.replace(COLORIZABLE_MARKS_PATTERN, (match) => {
    // Check if it's a waqf mark
    if (match.match(new RegExp(WAQF_MARKS_PATTERN))) {
      return `<span class="text-amber-500" style="font-size: 0.85em;">${match}</span>`;
    }
    
    // It's a harakat - use the color mapping
    const colorClass = HARAKAT_COLORS[match] || 'text-gray-400';
    return `<span class="${colorClass}">${match}</span>`;
  });
}

/**
 * Pre-processes text for the overlay technique
 * Returns the original text (for base layer) and colorized HTML (for overlay)
 */
export function prepareOverlayText(text: string): {
  baseText: string;
  colorizedHTML: string;
} {
  return {
    baseText: text,
    colorizedHTML: colorizeHarakat(text),
  };
}

/**
 * Cache for processed texts to improve performance
 * Limited to 100 entries to prevent memory issues on mobile
 */
const colorizeCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

/**
 * Memoized version of colorizeHarakat for better performance
 */
export function colorizeHarakatMemoized(text: string): string {
  if (colorizeCache.has(text)) {
    return colorizeCache.get(text)!;
  }

  const result = colorizeHarakat(text);
  
  // Implement LRU-like behavior: clear cache when it gets too large
  if (colorizeCache.size >= MAX_CACHE_SIZE) {
    const firstKey = colorizeCache.keys().next().value;
    if (firstKey !== undefined) {
      colorizeCache.delete(firstKey);
    }
  }
  
  colorizeCache.set(text, result);
  return result;
}

/**
 * Clears the colorization cache
 * Useful for memory management on long sessions
 */
export function clearColorizeCache(): void {
  colorizeCache.clear();
}

