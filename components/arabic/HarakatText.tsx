'use client';

import { useState, useCallback, useRef } from 'react';
import { parseArabicText, type HarakatDefinition } from '@/lib/harakat-utils';

interface HarakatTextProps {
  text: string;
  className?: string;
  onHarakatClick?: (definition: HarakatDefinition) => void;
}

const LONG_PRESS_DURATION = 400; // ms

interface HarakatSpanProps {
  char: string;
  definition: HarakatDefinition;
  onLongPress: (definition: HarakatDefinition) => void;
}

function HarakatSpan({ char, definition, onLongPress }: HarakatSpanProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    isLongPressing.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressing.current = true;
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress(definition);
    }, LONG_PRESS_DURATION);
  }, [definition, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevent if it was a long press
    if (isLongPressing.current) {
      e.preventDefault();
      return;
    }
    onLongPress(definition);
  }, [definition, onLongPress]);

  return (
    <span
      className="relative cursor-pointer transition-transform hover:scale-110"
      style={{ color: definition.color }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
    >
      {char}
      
      {/* Hover Tooltip */}
      {showTooltip && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                     bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg
                     text-xs text-white whitespace-nowrap pointer-events-none
                     animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ direction: 'ltr' }}
        >
          <span className="font-medium" style={{ color: definition.color }}>
            {definition.nameEnglish}
          </span>
          <span className="text-gray-400 mx-1">·</span>
          <span className="text-gray-300">{definition.transliteration}</span>
          
          {/* Tooltip arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <span className="block w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1a1a]" />
          </span>
        </span>
      )}
    </span>
  );
}

export default function HarakatText({ 
  text, 
  className = '',
  onHarakatClick,
}: HarakatTextProps) {
  const segments = parseArabicText(text);

  const handleHarakatLongPress = useCallback((definition: HarakatDefinition) => {
    if (onHarakatClick) {
      onHarakatClick(definition);
    }
  }, [onHarakatClick]);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.isHarakat && segment.definition) {
          return (
            <HarakatSpan
              key={`harakat-${index}`}
              char={segment.text}
              definition={segment.definition}
              onLongPress={handleHarakatLongPress}
            />
          );
        }
        return <span key={`text-${index}`}>{segment.text}</span>;
      })}
    </span>
  );
}


