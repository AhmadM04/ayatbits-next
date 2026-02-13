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
 * MushafView - Simple, High-Performance Justified Block Layout
 * 
 * Design Philosophy:
 * - Single text rendering (no overlay, no duplication)
 * - Madani Mushaf style justified text
 * - KFGQPC Uthmanic Script HAFS font
 * - Clean color transitions (gray → green when completed)
 * - Optimized for mobile performance
 */
export default function MushafView({ verses, onVerseLongPress }: MushafViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24">
      {/* LIGHT THEME: Clean white background with subtle border and shadow */}
      <div className="bg-white border border-gray-100 shadow-sm min-h-[80vh] rounded-2xl p-6" dir="rtl">
        
        {/* The Block Text Container - Madani Mushaf Style */}
        <div 
          className="font-uthmani text-3xl leading-[2.8] text-justify"
          style={{ textAlignLast: 'center' }}
        >
          {verses.map((verse) => {
            const longPressHandlers = useLongPress(
              () => onVerseLongPress(verse),
              500
            );

            const isCompleted = verse.progress === 'COMPLETED' || verse.isCompleted;

            return (
              <span
                key={verse.id}
                {...longPressHandlers}
                className={`
                  relative inline px-1 cursor-pointer transition-colors select-none
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
