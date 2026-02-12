'use client';

import { useLongPress } from '@/lib/hooks/useLongPress';
import { formatQuranText } from '@/lib/quran-text-utils';

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

export default function MushafView({ verses, onVerseLongPress }: MushafViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24">
      <div className="bg-[#0a0a0a] min-h-[80vh] rounded-xl p-6" dir="rtl">
        
        {/* THE TEXT BLOCK - MADANI MUSHAF STYLE */}
        <div 
          className="text-justify text-3xl leading-[2.5] font-uthmani" 
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
                  relative inline px-1 transition-colors cursor-pointer select-none
                  ${isCompleted ? 'text-green-500' : 'text-gray-200'}
                  hover:bg-white/5
                `}
              >
                {/* Quran Text with Waqf marks colored */}
                {formatQuranText(verse.text_uthmani)}
                
                {/* END OF AYAH SYMBOL - JUST TEXT */}
                <span className={`text-xl mx-2 font-sans ${isCompleted ? 'text-green-500' : 'text-green-800'}`}>
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
