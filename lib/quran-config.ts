/**
 * Quran API Configuration
 * Configure these settings to match your Expo project's behavior
 */

export const QURAN_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://api.alquran.cloud/v1',
  
  // Ayah Slicing Configuration
  // These settings control how ayahs are split into puzzles
  // Match these with your Expo project's settings
  
  // Number of ayahs per puzzle
  // 1 = one ayah per puzzle (most common)
  // 2 = two ayahs per puzzle, etc.
  AYAH_CHUNK_SIZE: parseInt(process.env.AYAH_CHUNK_SIZE || '1', 10),
  
  // Whether to create overlapping chunks (sliding window)
  // false = non-overlapping chunks (most common)
  // true = overlapping chunks (e.g., puzzle 1: ayahs 1-2, puzzle 2: ayahs 2-3)
  AYAH_OVERLAP: process.env.AYAH_OVERLAP === 'true',
  
  // Minimum ayah length to create a puzzle (in words)
  // Ayahs shorter than this will be skipped or combined
  MIN_AYAH_LENGTH: parseInt(process.env.MIN_AYAH_LENGTH || '3', 10),
  
  // Maximum ayah length to create a puzzle (in words)
  // Ayahs longer than this will be split further
  MAX_AYAH_LENGTH: parseInt(process.env.MAX_AYAH_LENGTH || '50', 10),
};

