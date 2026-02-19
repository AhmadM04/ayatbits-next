'use client';

import { useState } from 'react';
import { toArabicNumerals } from '@/lib/mushaf-utils';
import { useLongPress } from '@/lib/hooks/useLongPress';
import type { MushafVerse } from './AyahRow';

// =============================================================================
// Title Page Layout – Shaped calligraphic text for Mushaf pages 1 & 2
// =============================================================================
// Renders all verses as inline text that flows inside a diamond / lens shape
// created by CSS `shape-outside` floats on both sides. Verse markers (ornate
// circles with Arabic numerals) appear inline at the end of each verse.
// =============================================================================

interface TitlePageLayoutProps {
  verses: MushafVerse[];
  onLongPress: (verse: MushafVerse) => void;
}

const LONG_PRESS_DURATION = 500;

// ---------------------------------------------------------------------------
// Smooth polygon curves for the float shapes.
// Each polygon describes an edge that is wide at the top and bottom
// (pushing text inward → narrower lines) and recedes at the vertical
// centre (allowing text to fill the full width → widest line).
// The result is a symmetrical diamond / lens shape.
// ---------------------------------------------------------------------------
const LEFT_SHAPE_POLYGON = [
  '100% 0%',
  '92% 4%',
  '78% 11%',
  '60% 20%',
  '42% 30%',
  '26% 39%',
  '12% 46%',
  '0% 50%',
  '12% 54%',
  '26% 61%',
  '42% 70%',
  '60% 80%',
  '78% 89%',
  '92% 96%',
  '100% 100%',
].join(', ');

const RIGHT_SHAPE_POLYGON = [
  '0% 0%',
  '8% 4%',
  '22% 11%',
  '40% 20%',
  '58% 30%',
  '74% 39%',
  '88% 46%',
  '100% 50%',
  '88% 54%',
  '74% 61%',
  '58% 70%',
  '40% 80%',
  '22% 89%',
  '8% 96%',
  '0% 100%',
].join(', ');

// Float width as a percentage of the container.
// At the widest shape point (top / bottom) text is 100% – 2×FLOAT_WIDTH.
// At the narrowest (centre) text fills 100%.
const FLOAT_WIDTH = '13%';
// Generous height so the floats cover all possible content lengths.
const FLOAT_HEIGHT = '900px';
// Breathing room between the shape edge and the first/last glyph.
const SHAPE_MARGIN = '10px';

// ---------------------------------------------------------------------------
// Ornate verse marker SVG – traditional Mushaf style
// ---------------------------------------------------------------------------
function VerseMarker({ number, isCompleted }: { number: number; isCompleted: boolean }) {
  const color = isCompleted
    ? 'text-[#059669] dark:text-green-400'
    : 'text-[#8E7F71] dark:text-gray-400';

  return (
    <span
      className={`inline-flex items-center justify-center mx-0.5 sm:mx-1 whitespace-nowrap align-middle ${color}`}
    >
      <span className="relative inline-flex items-center justify-center w-[1.5em] h-[1.5em]">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          {/* Outer decorative ring */}
          <circle
            cx="16" cy="16" r="14.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.25"
          />
          {/* Main circle */}
          <circle
            cx="16" cy="16" r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            opacity="0.7"
          />
          {/* Cardinal-point petal dots */}
          <circle cx="16" cy="1" r="1.4" fill="currentColor" opacity="0.45" />
          <circle cx="16" cy="31" r="1.4" fill="currentColor" opacity="0.45" />
          <circle cx="1" cy="16" r="1.4" fill="currentColor" opacity="0.45" />
          <circle cx="31" cy="16" r="1.4" fill="currentColor" opacity="0.45" />
          {/* Diagonal petal dots */}
          <circle cx="5.3" cy="5.3" r="1" fill="currentColor" opacity="0.3" />
          <circle cx="26.7" cy="5.3" r="1" fill="currentColor" opacity="0.3" />
          <circle cx="5.3" cy="26.7" r="1" fill="currentColor" opacity="0.3" />
          <circle cx="26.7" cy="26.7" r="1" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Arabic numeral */}
        <span className="relative text-[0.5em] font-semibold leading-none">
          {toArabicNumerals(number)}
        </span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Single inline verse span – preserves long-press / interaction support
// ---------------------------------------------------------------------------
function InlineVerse({
  verse,
  onLongPress,
}: {
  verse: MushafVerse;
  onLongPress: (v: MushafVerse) => void;
}) {
  const [isHolding, setIsHolding] = useState(false);

  const longPressHandlers = useLongPress(
    () => {
      onLongPress(verse);
      setIsHolding(false);
    },
    LONG_PRESS_DURATION,
    {
      movementThreshold: 10,
      enableHaptics: true,
      hapticPattern: [100, 50, 100],
      onStart: () => setIsHolding(true),
      onCancel: () => setIsHolding(false),
    },
  );

  const textColor = verse.isCompleted
    ? 'text-[#059669] dark:text-green-400'
    : 'text-[#4A3728] dark:text-white';

  return (
    <span
      className={`
        cursor-pointer select-none font-uthmani transition-colors duration-200
        ${textColor}
        ${isHolding ? 'bg-blue-100/80 dark:bg-blue-500/20 rounded-sm' : ''}
      `}
      style={{ lineHeight: 'inherit' }}
      {...longPressHandlers}
    >
      {verse.text}
      <VerseMarker number={verse.ayahNumber} isCompleted={verse.isCompleted} />
      {/* Thin space after marker for natural word separation */}
      {' '}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main export – the shaped title-page container
// ---------------------------------------------------------------------------
export default function TitlePageLayout({ verses, onLongPress }: TitlePageLayoutProps) {
  return (
    <div
      className="font-uthmani text-[1.5rem] sm:text-2xl md:text-3xl"
      dir="rtl"
      style={{
        textAlign: 'center',
        lineHeight: '3.2',
        display: 'flow-root',          // contain floats without clipping
        wordSpacing: '0.14em',
        letterSpacing: '0.01em',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale' as any,
      }}
    >
      {/* Left shape float ─ creates the left indentation curve */}
      <div
        aria-hidden="true"
        style={{
          float: 'left',
          width: FLOAT_WIDTH,
          height: FLOAT_HEIGHT,
          shapeOutside: `polygon(${LEFT_SHAPE_POLYGON})`,
          shapeMargin: SHAPE_MARGIN,
        }}
      />

      {/* Right shape float ─ creates the right indentation curve */}
      <div
        aria-hidden="true"
        style={{
          float: 'right',
          width: FLOAT_WIDTH,
          height: FLOAT_HEIGHT,
          shapeOutside: `polygon(${RIGHT_SHAPE_POLYGON})`,
          shapeMargin: SHAPE_MARGIN,
        }}
      />

      {/* All verses flow inline within the shaped text area */}
      {verses.map((verse) => (
        <InlineVerse
          key={verse.id}
          verse={verse}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  );
}

