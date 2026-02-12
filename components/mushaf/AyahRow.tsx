'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { toArabicNumerals } from '@/lib/mushaf-utils';
import { type HarakatDefinition } from '@/lib/harakat-utils';
import { useLongPress } from '@/lib/hooks/useLongPress';
import QuranTextRenderer from '@/components/QuranTextRenderer';

export interface MushafVerse {
  id: number;
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
  pageNumber: number;
  juzNumber: number;
  puzzleId: string | null;
  isCompleted: boolean;
  isLiked: boolean;
}

interface AyahRowProps {
  verse: MushafVerse;
  onLongPress: (verse: MushafVerse) => void;
  onHarakatClick?: (definition: HarakatDefinition) => void;
  isHighlighted?: boolean;
}

const LONG_PRESS_DURATION = 500; // 500ms for long press

export default function AyahRow({ verse, onLongPress, onHarakatClick, isHighlighted = false }: AyahRowProps) {
  const [isHolding, setIsHolding] = useState(false);

  // ============================================================================
  // PERFORMANCE FIX: Use custom useLongPress hook with scroll detection
  // ============================================================================
  // This prevents the modal from opening when users are scrolling
  // Movement threshold of 10px ensures natural scrolling doesn't trigger long press
  // ============================================================================
  const longPressHandlers = useLongPress(
    () => {
      onLongPress(verse);
      setIsHolding(false);
    },
    LONG_PRESS_DURATION,
    {
      movementThreshold: 10, // Cancel if user moves more than 10px (scrolling)
      enableHaptics: true,
      hapticPattern: [100, 50, 100], // Double vibration pattern
      onStart: () => setIsHolding(true),
      onCancel: () => setIsHolding(false),
    }
  );

  const handleHarakatClick = useCallback((definition: HarakatDefinition) => {
    // Cancel holding state when user clicks on harakat
    setIsHolding(false);
    onHarakatClick?.(definition);
  }, [onHarakatClick]);

  return (
    <motion.span
      className={`
        relative inline-block group cursor-pointer select-none font-uthmani
        ${isHighlighted ? 'bg-green-500/20 rounded-lg px-1 -mx-1' : ''}
        ${isHolding ? 'bg-blue-500/20 rounded-lg px-1 -mx-1' : ''}
      `}
      style={{ 
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        display: 'inline',
        lineHeight: 'inherit',
        verticalAlign: 'baseline',
      }}
      {...longPressHandlers}
      animate={isHolding ? {
        scale: [1, 1.02, 1.02],
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
      } : {
        scale: 1,
        backgroundColor: 'rgba(0, 0, 0, 0)',
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      whileTap={!isHolding ? { scale: 0.98, opacity: 0.8 } : {}}
    >
      {/* High-Performance Quran Text with Tajweed Colors */}
      <QuranTextRenderer 
        text={verse.text}
        isCompleted={verse.isCompleted}
      />
      
      {/* Ayah number in Arabic numerals - NO ICONS */}
      <span className={`inline-flex items-center gap-1 mx-1.5 sm:mx-2 whitespace-nowrap align-middle ${verse.isCompleted ? 'text-green-500' : 'text-white'}`}>
        <span className="text-[0.9em] inline-block">
          ﴿{toArabicNumerals(verse.ayahNumber)}﴾
        </span>
      </span>
      
      {/* Hover/active indicator */}
      <span className={`
        absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-150
        ${isHolding 
          ? 'opacity-100 bg-blue-500/20 animate-pulse' 
          : 'opacity-0 group-hover:opacity-100 group-active:opacity-100 bg-white/5'
        }
      `} />
      
      {/* Long-press progress indicator */}
      {isHolding && (
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-blue-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: LONG_PRESS_DURATION / 1000, ease: 'linear' }}
        />
      )}
    </motion.span>
  );
}
