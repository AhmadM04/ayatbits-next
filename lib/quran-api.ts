/**
 * Quran API Integration
 * Uses Al-Quran Cloud API (api.alquran.cloud)
 * This matches the Expo project's API usage
 */

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { recommended: boolean; obligatory: boolean };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

export interface Juz {
  number: number;
  surahs: { number: number; ayahs: number[] }[];
}

import { QURAN_CONFIG } from './quran-config';

const API_BASE_URL = QURAN_CONFIG.API_BASE_URL;

/**
 * Fetch all surahs with their ayahs
 */
export async function fetchAllSurahs(): Promise<Surah[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/quran/quran-uthmani`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.surahs;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

/**
 * Fetch a specific surah by number
 */
export async function fetchSurah(surahNumber: number): Promise<Surah> {
  try {
    const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surahNumber}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
}

/**
 * Fetch ayahs for a specific juz
 */
export async function fetchJuz(juzNumber: number): Promise<Ayah[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/juz/${juzNumber}/quran-uthmani`);
    if (!response.ok) {
      throw new Error(`Failed to fetch juz ${juzNumber}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.ayahs;
  } catch (error) {
    console.error(`Error fetching juz ${juzNumber}:`, error);
    throw error;
  }
}

/**
 * Get juz information (which surahs and ayahs are in each juz)
 */
export async function getJuzInfo(): Promise<Juz[]> {
  // Juz boundaries are well-known, we can construct this
  // or fetch from API if available
  const juzs: Juz[] = [];
  
  // Fetch all surahs to get juz information
  const surahs = await fetchAllSurahs();
  
  // Group ayahs by juz
  const juzMap = new Map<number, Map<number, number[]>>();
  
  surahs.forEach(surah => {
    surah.ayahs.forEach(ayah => {
      const juz = ayah.juz;
      if (!juzMap.has(juz)) {
        juzMap.set(juz, new Map());
      }
      const surahMap = juzMap.get(juz)!;
      if (!surahMap.has(surah.number)) {
        surahMap.set(surah.number, []);
      }
      surahMap.get(surah.number)!.push(ayah.numberInSurah);
    });
  });
  
  // Convert to Juz format
  for (let juzNum = 1; juzNum <= 30; juzNum++) {
    const surahMap = juzMap.get(juzNum);
    if (surahMap) {
      const surahs: { number: number; ayahs: number[] }[] = [];
      surahMap.forEach((ayahs, surahNumber) => {
        surahs.push({ number: surahNumber, ayahs });
      });
      juzs.push({ number: juzNum, surahs });
    }
  }
  
  return juzs;
}

/**
 * Slice ayahs into puzzle chunks
 * This matches the Expo project's slicing logic
 * 
 * @param ayahs - Array of ayah texts
 * @param chunkSize - Number of ayahs per puzzle (default: 1, meaning one ayah per puzzle)
 * @param overlap - Whether to allow overlapping chunks (default: false)
 * @returns Array of puzzle chunks, each containing ayah text(s)
 */
export function sliceAyahsIntoPuzzles(
  ayahs: string[],
  chunkSize: number = 1,
  overlap: boolean = false
): string[] {
  if (chunkSize <= 0) {
    throw new Error('chunkSize must be greater than 0');
  }

  const puzzles: string[] = [];

  if (chunkSize === 1) {
    // One ayah per puzzle (most common case)
    return ayahs;
  }

  if (overlap) {
    // Create overlapping chunks (sliding window)
    for (let i = 0; i <= ayahs.length - chunkSize; i++) {
      const chunk = ayahs.slice(i, i + chunkSize).join(' ');
      puzzles.push(chunk);
    }
  } else {
    // Create non-overlapping chunks
    for (let i = 0; i < ayahs.length; i += chunkSize) {
      const chunk = ayahs.slice(i, i + chunkSize).join(' ');
      puzzles.push(chunk);
    }
  }

  return puzzles;
}

/**
 * Get ayahs for a specific surah
 */
export function getAyahsForSurah(surah: Surah): string[] {
  return surah.ayahs.map(ayah => ayah.text);
}

/**
 * Get ayahs for a specific juz
 */
export function getAyahsForJuz(juzAyahs: Ayah[]): string[] {
  return juzAyahs.map(ayah => ayah.text);
}

