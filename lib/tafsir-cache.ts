import { connectDB, TafsirCache } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Get cached tafsir for a specific ayah and language.
 * Returns null if not found in cache.
 */
export async function getCachedTafsir(
  surahNumber: number,
  ayahNumber: number,
  language: string
): Promise<{ tafsirText: string; source: string; aiModel: string } | null> {
  try {
    await connectDB();

    const cached = await TafsirCache.findOne({
      surahNumber,
      ayahNumber,
      language: language.toLowerCase().trim(),
    }).lean();

    if (!cached) {
      return null;
    }

    logger.debug('Tafsir cache hit', {
      surahNumber,
      ayahNumber,
      language,
      cachedAt: cached.generatedAt,
    });

    return {
      tafsirText: cached.tafsirText,
      source: cached.source,
      aiModel: cached.aiModel,
    };
  } catch (error) {
    logger.error('Error fetching cached tafsir', error as Error, {
      surahNumber,
      ayahNumber,
      language,
    });
    return null;
  }
}

/**
 * Save generated tafsir to cache.
 * Updates existing entry if found, otherwise creates new one.
 */
export async function saveTafsir(
  surahNumber: number,
  ayahNumber: number,
  language: string,
  tafsirText: string,
  source: string,
  model: string = 'gemini-2.0-flash-exp'
): Promise<boolean> {
  try {
    await connectDB();

    const normalizedLang = language.toLowerCase().trim();

    // Use upsert to update or insert
    const result = await TafsirCache.findOneAndUpdate(
      {
        surahNumber,
        ayahNumber,
        language: normalizedLang,
      },
      {
        $set: {
          tafsirText,
          source,
          aiModel: model,
          generatedAt: new Date(),
        },
        $inc: { version: 1 },
        $setOnInsert: {
          surahNumber,
          ayahNumber,
          language: normalizedLang,
          version: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    logger.info('Tafsir saved to cache', {
      surahNumber,
      ayahNumber,
      language: normalizedLang,
      textLength: tafsirText.length,
      version: result?.version,
    });

    return true;
  } catch (error) {
    logger.error('Error saving tafsir to cache', error as Error, {
      surahNumber,
      ayahNumber,
      language,
    });
    return false;
  }
}

/**
 * Get cache statistics for a language.
 */
export async function getCacheStats(language?: string) {
  try {
    await connectDB();

    const query = language ? { language: language.toLowerCase().trim() } : {};
    
    const count = await TafsirCache.countDocuments(query);
    const latestEntry = await TafsirCache.findOne(query)
      .sort({ generatedAt: -1 })
      .lean();

    return {
      totalCached: count,
      latestGenerated: latestEntry?.generatedAt || null,
      language: language || 'all',
    };
  } catch (error) {
    logger.error('Error fetching cache stats', error as Error, { language });
    return null;
  }
}

/**
 * Clear cache for a specific ayah (all languages) or entire cache.
 */
export async function clearCache(
  surahNumber?: number,
  ayahNumber?: number
): Promise<number> {
  try {
    await connectDB();

    const filter: any = {};
    if (surahNumber !== undefined) filter.surahNumber = surahNumber;
    if (ayahNumber !== undefined) filter.ayahNumber = ayahNumber;

    const result = await TafsirCache.deleteMany(filter);
    
    logger.info('Tafsir cache cleared', {
      surahNumber,
      ayahNumber,
      deletedCount: result.deletedCount,
    });

    return result.deletedCount || 0;
  } catch (error) {
    logger.error('Error clearing cache', error as Error, {
      surahNumber,
      ayahNumber,
    });
    return 0;
  }
}

