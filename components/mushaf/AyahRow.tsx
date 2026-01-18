'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle } from 'lucide-react';
import { toArabicNumerals } from '@/lib/mushaf-utils';

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
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);

  const handleTouchStart = useCallback(() => {
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress(verse);
    }, LONG_PRESS_DURATION);
  }, [verse, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress(verse);
  }, [verse, onLongPress]);

  return (
    <motion.span
      className={`
        relative inline group cursor-pointer select-none
        ${isHighlighted ? 'bg-green-500/20 rounded-lg px-1 -mx-1' : ''}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onContextMenu={handleContextMenu}
      whileTap={{ scale: 0.98, opacity: 0.8 }}
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
      
      {/* Arabic text */}
      <span className="text-white">
        {verse.text}
      </span>
      
      {/* Ayah number in Arabic numerals */}
      <span className="text-green-400 mx-2 text-lg">
        ﴿{toArabicNumerals(verse.ayahNumber)}﴾
      </span>
      
      {/* Hover/active indicator */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 bg-white/5 rounded-lg pointer-events-none transition-opacity duration-150" />
    </motion.span>
  );
}

