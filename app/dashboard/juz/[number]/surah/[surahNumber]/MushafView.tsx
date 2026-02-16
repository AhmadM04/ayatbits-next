'use client';

import { useLongPress } from '@/lib/hooks/useLongPress';

interface Verse {
  id: string;
  text_uthmani: string;
  verse_key: string;
  isCompleted: boolean;
  isLiked: boolean;
  progress?: string;
}

interface MushafViewProps {
  verses: Verse[];
  onVerseLongPress: (verse: Verse) => void;
}

/**
 * Helper function to check if a verse is on a title page
 * Title pages: Surah 1 (Al-Fatiha) OR Surah 2 (Al-Baqarah) verses 1-5
 */
const isTitlePage = (surah: number, ayah: number): boolean => {
  return surah === 1 || (surah === 2 && ayah <= 5);
};

/**
 * MushafView - Simple, High-Performance Justified Block Layout
 * 
 * Design Philosophy:
 * - Single text rendering (no overlay, no duplication)
 * - Madani Mushaf style justified text
 * - KFGQPC Uthmanic Script HAFS font
 * - Clean color transitions (gray → green when completed)
 * - Optimized for mobile performance
 * - Special center-aligned layout for title pages (Surah 1 and Surah 2:1-5)
 */
export default function MushafView({ verses, onVerseLongPress }: MushafViewProps) {
  // Check if any verse is on a title page
  const hasTitlePageVerses = verses.some(verse => {
    const [surah, ayah] = verse.verse_key.split(':').map(Number);
    return isTitlePage(surah, ayah);
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24">
      {/* LIGHT THEME: Clean white background with subtle border and shadow */}
      <div className="bg-white border border-gray-100 shadow-sm min-h-[80vh] rounded-2xl p-6" dir="rtl">
        
        {/* The Block Text Container - Madani Mushaf Style */}
        <div 
          className={`
            font-uthmani text-3xl
            ${hasTitlePageVerses 
              ? 'flex flex-col items-center text-center leading-[3] space-y-6' 
              : 'text-justify leading-[2.8]'
            }
          `}
          style={hasTitlePageVerses ? {} : { textAlignLast: 'center' }}
        >
          {verses.map((verse) => {
            const longPressHandlers = useLongPress(
              () => onVerseLongPress(verse),
              500
            );

            const isCompleted = verse.progress === 'COMPLETED' || verse.isCompleted;
            
            // Extract surah and ayah numbers from verse_key
            const [surah, ayah] = verse.verse_key.split(':').map(Number);
            const isTitlePageVerse = isTitlePage(surah, ayah);

            // For title page verses, render as block with center alignment
            if (isTitlePageVerse) {
              return (
                <div
                  key={verse.id}
                  {...longPressHandlers}
                  className={`
                    relative w-full max-w-2xl mx-auto text-center cursor-pointer transition-colors select-none
                    ${isCompleted ? 'text-emerald-600 font-medium' : 'text-gray-900'}
                    hover:bg-gray-50 rounded py-2
                  `}
                >
                  {verse.text_uthmani}
                  {/* End of Ayah Symbol - Emerald for completed, gray for incomplete */}
                  <span className={`
                    font-sans text-2xl mx-2 opacity-70
                    ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}
                  `}>
                    ۝{verse.verse_key.split(':')[1]}
                  </span>
                </div>
              );
            }

            // Regular verses - block layout if container is flex-col, otherwise inline
            return (
              <span
                key={verse.id}
                {...longPressHandlers}
                className={`
                  relative cursor-pointer transition-colors select-none
                  ${hasTitlePageVerses 
                    ? 'block text-right w-full self-end' 
                    : 'inline px-1'
                  }
                  ${isCompleted ? 'text-emerald-600 font-medium' : 'text-gray-900'}
                  hover:bg-gray-50 rounded
                `}
              >
                {verse.text_uthmani}
                {/* End of Ayah Symbol - Emerald for completed, gray for incomplete */}
                <span className={`
                  font-sans text-2xl mx-2 opacity-70
                  ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}
                `}>
                  ۝{verse.verse_key.split(':')[1]}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
