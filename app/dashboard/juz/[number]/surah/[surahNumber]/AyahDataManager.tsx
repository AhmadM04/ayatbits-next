'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

export interface AyahData {
  ayahText: string;
  ayahNumber: number;
  translation: string;
  mushafPageNumber: number | null;
  puzzleId: string;
  isMemorized: boolean;
  isLiked: boolean;
  previousAyah: number | null;
  nextAyah: number | null;
  completedAyahs: number;
  totalAyahs: number;
  progressPercentage: number;
  surahName: string;
  surahNameArabic: string;
  juzNumber: number;
  selectedTranslation: string;
  enableWordByWordAudio: boolean;
  subscriptionPlan: string;
  puzzles: Array<{
    id: string;
    ayahNumber: number;
    isCompleted: boolean;
    isLiked: boolean;
  }>;
}

interface AyahDataManagerProps {
  initialData: AyahData;
  juzNumber: number;
  surahNumber: number;
  children: (data: AyahData, isLoading: boolean) => ReactNode;
}

/**
 * Client-side data manager for Ayah transitions
 * Handles fetching, caching, and loading states
 */
export default function AyahDataManager({
  initialData,
  juzNumber,
  surahNumber,
  children,
}: AyahDataManagerProps) {
  const searchParams = useSearchParams();
  const ayahParam = searchParams.get('ayah');
  const currentAyah = ayahParam ? parseInt(ayahParam) : initialData.ayahNumber;

  const [data, setData] = useState<AyahData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const previousAyahRef = useRef(currentAyah);
  const cacheRef = useRef<Map<number, AyahData>>(new Map());

  // ============================================================================
  // CLIENT-SIDE DATA FETCHING: When ayah changes, fetch new data
  // ============================================================================
  useEffect(() => {
    // Skip if ayah hasn't changed
    if (currentAyah === previousAyahRef.current) {
      return;
    }

    previousAyahRef.current = currentAyah;

    // Check cache first (instant!)
    const cached = cacheRef.current.get(currentAyah);
    if (cached) {
      console.log(`[AyahDataManager] Using cached data for ayah ${currentAyah}`);
      setData(cached);
      setIsLoading(false);
      return;
    }

    // Not in cache - fetch from API
    let isCancelled = false;
    setIsLoading(true);

    const fetchAyahData = async () => {
      try {
        const url = `/api/ayah?juz=${juzNumber}&surah=${surahNumber}&ayah=${currentAyah}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const result = await response.json();

        if (!isCancelled && result.success) {
          // Update state with new data
          setData(result.data);
          
          // Cache the data
          cacheRef.current.set(currentAyah, result.data);
          
          // Limit cache size (keep last 10 ayahs)
          if (cacheRef.current.size > 10) {
            const firstKey = cacheRef.current.keys().next().value;
            if (firstKey !== undefined) {
                cacheRef.current.delete(firstKey);
              }
          }
          
          console.log(`[AyahDataManager] Fetched and cached ayah ${currentAyah}`);
        }
      } catch (error) {
        console.error('[AyahDataManager] Failed to fetch ayah data:', error);
        // Don't update state on error - keep showing previous data
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // Small delay to allow pre-fetched data to be cached
    const timer = setTimeout(fetchAyahData, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentAyah, juzNumber, surahNumber]);

  // Seed cache with initial data
  useEffect(() => {
    cacheRef.current.set(initialData.ayahNumber, initialData);
  }, [initialData]);

  return <>{children(data, isLoading)}</>;
}

