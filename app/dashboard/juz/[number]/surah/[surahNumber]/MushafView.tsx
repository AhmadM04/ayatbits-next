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
      className="text-justify leading-[2.8] text-2xl dir-rtl font-arabic"
      style={{ textAlignLast: 'center' }}
    >
      {verses.map((verse) => {
        const longPressHandlers = useLongPress(
          () => onVerseLongPress(verse),
          500
        );

        const textColor = verse.isCompleted ? 'text-emerald-500' : 'text-gray-200';

        return (
          <span
            key={verse.id}
            {...longPressHandlers}
            className={`${textColor} cursor-pointer transition-colors duration-200`}
          >
            {verse.text_uthmani}{' '}
            <span className="font-sans">
              ۝{verse.verse_key.split(':')[1]}
            </span>
          </span>
        );
      })}
    </div>
  );
}

