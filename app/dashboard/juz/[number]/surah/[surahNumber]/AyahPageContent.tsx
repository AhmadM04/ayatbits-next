'use client';

import { AnimatePresence } from 'framer-motion';
import AyahDataManager, { type AyahData } from './AyahDataManager';
import AyahSkeleton from './AyahSkeleton';
import TranslationDisplay from './TranslationDisplay';
import AyahSelectorClient from './AyahSelectorClient';
import BismillahDisplay from './BismillahDisplay';
import VerseNavButtons from './VerseNavButtons';
import ArabicTextCard from './ArabicTextCard';
import { shouldShowBismillahSeparately, extractBismillah } from '@/lib/ayah-utils';

interface AyahPageContentProps {
  initialData: AyahData;
  juzNumber: number;
  surahNumber: number;
}

/**
 * Client-side content wrapper for Ayah page
 * Handles data fetching, loading states, and rendering
 */
export default function AyahPageContent({
  initialData,
  juzNumber,
  surahNumber,
}: AyahPageContentProps) {
  return (
    <AyahDataManager
      initialData={initialData}
      juzNumber={juzNumber}
      surahNumber={surahNumber}
    >
      {(data, isLoading) => {
        const { bismillah, remainingText } = extractBismillah(
          data.ayahText,
          surahNumber,
          data.ayahNumber
        );
        const showBismillahSeparately = shouldShowBismillahSeparately(surahNumber) && data.ayahNumber === 1;
        const displayText = showBismillahSeparately ? remainingText : data.ayahText;

        return (
          <div className="relative">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#059669] to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${data.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Ayah Selector with Modal */}
            <AyahSelectorClient
              puzzles={data.puzzles}
              currentAyah={data.ayahNumber}
              juzNumber={juzNumber}
              surahNumber={surahNumber}
            />

            {/* Content with loading state */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <AyahSkeleton key="skeleton" />
              ) : (
                <div key={`ayah-${data.ayahNumber}`} className="space-y-4">
                  {/* Bismillah - Shown separately for surahs 2-114 (except 9) on first ayah */}
                  {showBismillahSeparately && bismillah && (
                    <BismillahDisplay
                      bismillah={bismillah}
                      surahNumber={surahNumber}
                    />
                  )}

                  {/* Arabic Text Card with Audio Player */}
                  <div data-tutorial="arabic-text">
                    <ArabicTextCard
                      surahNumber={surahNumber}
                      ayahNumber={data.ayahNumber}
                      ayahText={displayText}
                      puzzleId={data.puzzleId}
                      isMemorized={data.isMemorized}
                      isLiked={data.isLiked}
                      enableWordByWordAudio={data.enableWordByWordAudio}
                    />
                  </div>

                  {/* Translation */}
                  <div data-tutorial="translation">
                    <TranslationDisplay
                      surahNumber={surahNumber}
                      ayahNumber={data.ayahNumber}
                      selectedTranslation={data.selectedTranslation}
                      initialTranslation={data.translation}
                    />
                  </div>

                  {/* Start Puzzle & Navigation Buttons */}
                  <VerseNavButtons
                    puzzleId={data.puzzleId}
                    juzNumber={juzNumber}
                    surahNumber={surahNumber}
                    previousAyah={data.previousAyah || undefined}
                    nextAyah={data.nextAyah || undefined}
                    selectedAyah={data.ayahNumber}
                    totalAyahs={data.totalAyahs}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      }}
    </AyahDataManager>
  );
}

