'use client';

import { useLongPress } from '@/lib/hooks/useLongPress';
import QuranTextRenderer from '@/components/QuranTextRenderer';

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
        
        {/* THE TEXT BLOCK - MADANI MUSHAF STYLE WITH TAJWEED COLORS */}
        <div 
          className="text-justify text-3xl leading-[2.8] font-uthmani" 
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
                className="relative inline-block px-1 cursor-pointer select-none hover:bg-white/5 transition-colors"
              >
                {/* High-Performance Quran Text with Tajweed Colors */}
                <QuranTextRenderer 
                  text={verse.text_uthmani}
                  isCompleted={isCompleted}
                />
                
                {/* END OF AYAH SYMBOL */}
                <span className={`text-xl mx-1 font-sans ${isCompleted ? 'text-emerald-500' : 'text-emerald-700'}`}>
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
