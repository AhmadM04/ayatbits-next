'use client';

import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle } from 'lucide-react';
import { toArabicNumerals } from '@/lib/mushaf-utils';
import { HarakatText } from '@/components/arabic';
import { type HarakatDefinition } from '@/lib/harakat-utils';

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
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);
  const [isHolding, setIsHolding] = useState(false);

  const handleTouchStart = useCallback(() => {
    isLongPressing.current = false;
    setIsHolding(true);
    
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      
      // Enhanced haptic feedback - a more noticeable pattern
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        // Double vibration pattern for better feedback: [vibrate, pause, vibrate]
        navigator.vibrate([100, 50, 100]);
      }
      
      onLongPress(verse);
      setIsHolding(false);
    }, LONG_PRESS_DURATION);
  }, [verse, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsHolding(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Haptic feedback for right-click/context menu as well
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    onLongPress(verse);
  }, [verse, onLongPress]);

  const handleHarakatClick = useCallback((definition: HarakatDefinition) => {
    // Cancel the long press timer since user clicked on harakat
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsHolding(false);
    onHarakatClick?.(definition);
  }, [onHarakatClick]);

  return (
    <motion.span
      className={`
        relative inline group cursor-pointer select-none
        ${isHighlighted ? 'bg-green-500/20 rounded-lg px-1 -mx-1' : ''}
        ${isHolding ? 'bg-blue-500/20 rounded-lg px-1 -mx-1' : ''}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onContextMenu={handleContextMenu}
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
      {/* Status indicators - shown inline before ayah number */}
      {(verse.isCompleted || verse.isLiked) && (
        <span className="inline-flex items-center gap-0.5 mx-1 align-middle">
          {verse.isCompleted && (
            <CheckCircle className="w-3 h-3 text-green-500 inline" />
          )}
          {verse.isLiked && (
            <Heart className="w-3 h-3 text-red-500 fill-current inline" />
          )}
        </span>
      )}
      
      {/* Arabic text with harakat coloring */}
      <HarakatText 
        text={verse.text} 
        className="text-white"
        onHarakatClick={handleHarakatClick}
      />
      
      {/* Ayah number in Arabic numerals */}
      <span className="text-green-400 mx-2 text-lg">
        ﴿{toArabicNumerals(verse.ayahNumber)}﴾
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

