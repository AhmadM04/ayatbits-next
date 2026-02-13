'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toArabicNumerals } from '@/lib/mushaf-utils';
import { useLongPress } from '@/lib/hooks/useLongPress';

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
  isHighlighted?: boolean;
}

const LONG_PRESS_DURATION = 500; // 500ms for long press

export default function AyahRow({ verse, onLongPress, isHighlighted = false }: AyahRowProps) {
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

  // LIGHT THEME: Determine text color based on completion status
  // Darker green for completed verses to ensure readability on white background
  const textColor = verse.isCompleted 
    ? 'text-emerald-700 font-medium' 
    : 'text-gray-900';

  return (
    <motion.span
      className={`
        relative inline-block group cursor-pointer select-none font-uthmani
        ${textColor}
        ${isHighlighted ? 'bg-emerald-50 rounded-lg px-1 -mx-1' : ''}
        ${isHolding ? 'bg-blue-50 rounded-lg px-1 -mx-1' : ''}
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
        backgroundColor: 'rgba(239, 246, 255, 0.8)', // Light blue for light theme
      } : {
        scale: 1,
        backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent white
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      whileTap={!isHolding ? { scale: 0.98, opacity: 0.8 } : {}}
    >
      {/* Simple, Clean Quran Text Rendering */}
      {verse.text}{' '}
      
      {/* LIGHT THEME: Ayah number with emerald color for completed verses */}
      <span className={`
        inline-flex items-center gap-1 mx-1.5 sm:mx-2 whitespace-nowrap align-middle
        ${verse.isCompleted ? 'text-emerald-600' : 'text-gray-400'}
      `}>
        <span className="text-[0.85em] inline-block opacity-80">
          ﴿{toArabicNumerals(verse.ayahNumber)}﴾
        </span>
      </span>
      
      {/* LIGHT THEME: Hover/active indicator with gray background */}
      <span className={`
        absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-150
        ${isHolding 
          ? 'opacity-100 bg-blue-100 animate-pulse' 
          : 'opacity-0 group-hover:opacity-100 group-active:opacity-100 bg-gray-50'
        }
      `} />
      
      {/* Long-press progress indicator */}
      {isHolding && (
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: LONG_PRESS_DURATION / 1000, ease: 'linear' }}
        />
      )}
    </motion.span>
  );
}
