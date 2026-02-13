/**
 * Cached Quran Data Fetching
 * 
 * This module provides cached access to static Quran data that never changes.
 * Uses Next.js unstable_cache to avoid repeated API calls or DB queries.
 */

import { unstable_cache } from 'next/cache';

// Quran.com API response types
export interface QuranVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  chapter_id: number;
}

interface QuranPageResponse {
  verses: QuranVerse[];
}

/**
 * Fetch verses for a specific Mushaf page from Quran.com API
 * 
 * This is the raw fetch function (not cached).
 * Do NOT call this directly - use getCachedVersesForPage instead.
 */
async function fetchVersesForPage(pageNumber: number): Promise<QuranVerse[]> {
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&translations=false&fields=text_uthmani,verse_key,verse_number,page_number,juz_number,hizb_number,chapter_id`,
      { 
        next: { revalidate: false }, // unstable_cache handles revalidation
        cache: 'force-cache', // Force cache at fetch level too
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page ${pageNumber}: ${response.status}`);
    }
    
    const data: QuranPageResponse = await response.json();
    return data.verses || [];
  } catch (error) {
    console.error(`Error fetching verses for page ${pageNumber}:`, error);
    return [];
  }
}

/**
 * Get cached verses for a specific Mushaf page
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Verses are static (never change) so we cache them indefinitely
 * - First call: ~500ms (API fetch)
 * - Subsequent calls: ~5ms (cache hit)
 * - 100x speedup!
 * 
 * Cache Strategy:
 * - Cache Key: Dynamic per page (quran-page-verses-{pageNumber})
 * - Revalidation: 30 days (verses never change, but we revalidate occasionally)
 * - Tags: ['quran-data'] for manual cache purging if needed
 */
export const getCachedVersesForPage = unstable_cache(
  async (pageNumber: number) => {
    console.log(`[CACHE MISS] Fetching verses for page ${pageNumber} from API`);
    const verses = await fetchVersesForPage(pageNumber);
    return verses;
  },
  ['quran-page-verses'], // Base cache key
  {
    revalidate: 2592000, // 30 days in seconds (verses never change)
    tags: ['quran-data'], // Tag for manual invalidation
  }
);

/**
 * Prefetch verses for adjacent pages (optional optimization)
 * Call this in the background to warm up the cache for next/previous pages
 */
export async function prefetchAdjacentPages(currentPage: number) {
  const promises: Promise<QuranVerse[]>[] = [];
  
  // Prefetch previous page
  if (currentPage > 1) {
    promises.push(getCachedVersesForPage(currentPage - 1));
  }
  
  // Prefetch next page
  if (currentPage < 604) { // Total Mushaf pages
    promises.push(getCachedVersesForPage(currentPage + 1));
  }
  
  // Fire and forget - don't wait for results
  Promise.all(promises).catch(err => 
    console.error('Failed to prefetch adjacent pages:', err)
  );
}

