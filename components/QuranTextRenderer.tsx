'use client';

import React, { useMemo } from 'react';
import { colorizeHarakatMemoized } from '@/lib/tajweed-parser';

interface QuranTextRendererProps {
  text: string;
  isCompleted?: boolean;
  className?: string;
}

/**
 * High-Performance Quran Text Renderer with Tajweed Colors
 * 
 * Uses the "Overlay Technique" to color diacritics without breaking Arabic shaping:
 * - Layer 1 (Base): Visible text skeleton with inherited color (green if completed, white otherwise)
 * - Layer 2 (Overlay): Absolute positioned colored diacritics with transparent letters
 * 
 * This ensures perfect alignment while maintaining cursive text integrity.
 * 
 * Performance Optimizations:
 * - React.memo prevents unnecessary re-renders
 * - useMemo caches the colorized HTML
 * - Memoized colorization function with LRU cache
 */
const QuranTextRenderer: React.FC<QuranTextRendererProps> = React.memo(({ 
  text, 
  isCompleted = false,
  className = '',
}) => {
  // Determine base text color based on completion status
  const baseColorClass = isCompleted ? 'text-green-500' : 'text-white';

  // Memoize the colorized HTML to avoid re-processing on every render
  const colorizedHTML = useMemo(() => {
    return colorizeHarakatMemoized(text);
  }, [text]);

  return (
    <span className={`relative inline ${className}`}>
      {/* LAYER 1: Base Text - Visible skeleton with appropriate color */}
      <span 
        className={`${baseColorClass} transition-colors duration-200`}
        style={{
          display: 'inline',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {text}
      </span>

      {/* LAYER 2: Colored Overlay - Transparent letters, colored diacritics */}
      <span
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          color: 'transparent',
          zIndex: 2,
          display: 'inline',
          whiteSpace: 'pre-wrap',
          wordBreak: 'keep-all',
        }}
        dangerouslySetInnerHTML={{ __html: colorizedHTML }}
        aria-hidden="true"
      />
    </span>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if text or completion status changes
  return (
    prevProps.text === nextProps.text &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.className === nextProps.className
  );
});

QuranTextRenderer.displayName = 'QuranTextRenderer';

export default QuranTextRenderer;

