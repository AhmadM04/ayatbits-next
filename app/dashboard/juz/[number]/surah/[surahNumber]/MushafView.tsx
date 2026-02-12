'use client';

import { useLongPress } from '@/lib/hooks/useLongPress';

interface Verse {
  id: string;
  text_uthmani: string;
  verse_key: string;
  isCompleted: boolean;
  isLiked: boolean;
}

interface MushafViewProps {
  verses: Verse[];
  onVerseLongPress: (verse: Verse) => void;
}

export default function MushafView({ verses, onVerseLongPress }: MushafViewProps) {
  return (
    <div 
      className="text-justify font-arabic text-2xl leading-[2.6] w-full" 
      dir="rtl"
      style={{ textAlignLast: 'center' }}
    >
      {verses.map((verse) => {
        const longPressHandlers = useLongPress(
          () => onVerseLongPress(verse),
          500
        );

        return (
          <span
            key={verse.id}
            {...longPressHandlers}
            className={`
              relative px-0.5 transition-colors duration-200 cursor-pointer
              ${verse.isCompleted ? 'text-success' : 'text-foreground'} 
              hover:bg-muted
            `}
          >
            {/* 1. The Verse Text */}
            {verse.text_uthmani}{' '}
            
            {/* 2. The End of Ayah Symbol (Inline) */}
            <span className="font-sans text-xl mx-1 opacity-80">
              ۝{verse.verse_key.split(':')[1]}
            </span>
          </span>
        );
      })}
    </div>
  );
}

