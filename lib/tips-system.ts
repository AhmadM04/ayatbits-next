/**
 * Tips System for Puzzle View
 * Calculates available tips based on ayah length (word count)
 */

export type DifficultyTier = 'Short' | 'Medium' | 'Long' | 'Very Long';

export interface TierInfo {
  tier: DifficultyTier;
  tips: number;
  minWords: number;
  maxWords: number;
}

/**
 * Difficulty tiers configuration
 * - Short (1-5 words): 1 tip
 * - Medium (6-12 words): 2 tips
 * - Long (13-20 words): 3 tips
 * - Very Long (21+ words): 4 tips
 */
const DIFFICULTY_TIERS: TierInfo[] = [
  { tier: 'Short', tips: 1, minWords: 1, maxWords: 5 },
  { tier: 'Medium', tips: 2, minWords: 6, maxWords: 12 },
  { tier: 'Long', tips: 3, minWords: 13, maxWords: 20 },
  { tier: 'Very Long', tips: 4, minWords: 21, maxWords: Infinity },
];

/**
 * Calculate the number of available tips based on word count
 * @param wordCount - Number of words in the ayah
 * @returns Number of tips available for this ayah
 */
export function calculateTipsForAyah(wordCount: number): number {
  if (wordCount <= 0) return 0;
  
  const tier = DIFFICULTY_TIERS.find(
    t => wordCount >= t.minWords && wordCount <= t.maxWords
  );
  
  return tier?.tips ?? 1; // Default to 1 tip if not found
}

/**
 * Get the difficulty tier information for a given word count
 * @param wordCount - Number of words in the ayah
 * @returns Tier information including name and tip count
 */
export function getDifficultyTier(wordCount: number): TierInfo {
  if (wordCount <= 0) {
    return DIFFICULTY_TIERS[0];
  }
  
  const tier = DIFFICULTY_TIERS.find(
    t => wordCount >= t.minWords && wordCount <= t.maxWords
  );
  
  return tier ?? DIFFICULTY_TIERS[0];
}

/**
 * Get a display-friendly description of the difficulty tier
 * @param wordCount - Number of words in the ayah
 * @returns Human-readable tier description
 */
export function getTierDescription(wordCount: number): string {
  const tier = getDifficultyTier(wordCount);
  return `${tier.tier} (${tier.tips} tip${tier.tips > 1 ? 's' : ''} available)`;
}


