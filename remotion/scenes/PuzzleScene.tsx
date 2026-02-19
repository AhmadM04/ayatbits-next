import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ─── REAL IMPORTS from the AyatBits codebase ──────────────────
import { tokenizeAyah, type WordToken } from '@/lib/puzzle-logic';
import HarakatColoredText from '@/components/arabic/HarakatColoredText';
// ───────────────────────────────────────────────────────────────

import { COLORS, FONTS, FONT_SIZES, fontSize, type AspectRatioKey } from '../Theme';

interface PuzzleSceneProps {
  ratio: AspectRatioKey;
  primaryColor: string;
  fontFamily: string;
  puzzleVerse: string;
  puzzleTranslation: string;
  puzzleSurahArabic: string;
  puzzleSurahEnglish: string;
  isRTL: boolean;
  animationSlowdown: number;
}

// ─────────────────────────────────────────────────────────────────
// SVG Cursor — white pointer with drop shadow, exactly matching
// a macOS-style cursor. Anchor point at the tip (top-left corner).
// ─────────────────────────────────────────────────────────────────
const Cursor: React.FC<{
  x: number;
  y: number;
  pressing: boolean;
  opacity: number;
}> = ({ x, y, pressing, opacity }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      zIndex: 200,
      pointerEvents: 'none',
      opacity,
      transform: `scale(${pressing ? 0.88 : 1})`,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
      willChange: 'transform, left, top',
    }}
  >
    <svg width="28" height="34" viewBox="0 0 24 30" fill="none">
      <path
        d="M5.5 1.5L5.5 22.5L10.5 17.5L15.5 24.5L19.5 22.5L14.5 15.5L21.5 15.5L5.5 1.5Z"
        fill={COLORS.white}
        stroke="#333"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Lucide-style SVG icons (no dependency needed)
// ─────────────────────────────────────────────────────────────────
const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : '#6b7280'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.685-4.5 1.757A5.987 5.987 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const HelpIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const RefreshIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const CheckCircleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 60, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// Easing curves for human-like cursor motion
// ─────────────────────────────────────────────────────────────────
const EASE_MOVE = Easing.bezier(0.25, 0.1, 0.25, 1.0);
const EASE_LIFT = Easing.bezier(0.0, 0.0, 0.2, 1.0);
const EASE_DROP = Easing.bezier(0.4, 0.0, 0.2, 1.0);

// ─────────────────────────────────────────────────────────────────
// Per-word phase timing (base frames, multiplied by slowdown)
// ─────────────────────────────────────────────────────────────────
const BASE_HOVER  = 8;   // cursor moves to bank word, word highlights
const BASE_GRAB   = 4;   // grab (scale up, shadow)
const BASE_DRAG   = 18;  // word travels from bank to slot
const BASE_PAUSE  = 4;   // brief hover above slot
const BASE_DROP   = 6;   // snap into place with spring
const BASE_TOTAL  = BASE_HOVER + BASE_GRAB + BASE_DRAG + BASE_PAUSE + BASE_DROP;
const BASE_GAP    = 6;   // gap between words
const BASE_STAGGER = BASE_TOTAL + BASE_GAP;

// ─────────────────────────────────────────────────────────────────
// Mashallah Success Overlay
// ─────────────────────────────────────────────────────────────────
const MashallahOverlay: React.FC<{
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ frame, fps, startFrame }) => {
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const bgOpacity = interpolate(elapsed, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const iconSpring = spring({
    frame: Math.max(0, elapsed - 5),
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.8 },
  });
  const iconScale = interpolate(iconSpring, [0, 1], [0.3, 1]);
  const iconOpacity = interpolate(iconSpring, [0, 1], [0, 1]);

  const textSpring = spring({
    frame: Math.max(0, elapsed - 15),
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.6 },
  });
  const textY = interpolate(textSpring, [0, 1], [20, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  const subtitleSpring = spring({
    frame: Math.max(0, elapsed - 25),
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.6 },
  });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [15, 0]);
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(5,150,105,0.25) 0%, ${COLORS.bgDark} 70%)`,
        opacity: bgOpacity,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      {/* Checkmark icon */}
      <div
        style={{
          transform: `scale(${iconScale})`,
          opacity: iconOpacity,
          marginBottom: 24,
        }}
      >
        <CheckCircleIcon size={80} color="#22c55e" />
      </div>

      {/* Mashallah text */}
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.white,
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          marginBottom: 8,
        }}
      >
        Mashallah!
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: 16,
          color: COLORS.emeraldDark,
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>✨</span> Moving to next ayah...
      </div>
    </AbsoluteFill>
  );
};

/**
 * Puzzle Scene — Production-Accurate Drag & Drop
 * ================================================
 * Matches the exact production UI with:
 *   - Header: "Al-Fatihah / Ayah 1" with ❤️ and ❓ icons
 *   - Status row: "Mistakes: 0/3", "Tips: 1/1", refresh icon, "3/4" counter
 *   - Green progress bar
 *   - Dotted-border drop area with numbered slots (RTL: 4→3→2→1)
 *   - Word bank below with draggable Arabic words
 *   - Simulated mouse cursor mathematically anchored to word center
 *   - Mashallah! success overlay after all words placed
 */
export const PuzzleScene: React.FC<PuzzleSceneProps> = ({
  ratio,
  primaryColor,
  fontFamily,
  puzzleVerse,
  puzzleTranslation,
  puzzleSurahArabic,
  puzzleSurahEnglish,
  isRTL,
  animationSlowdown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sf = (f: number) => f / animationSlowdown;

  // ── Tokenize using REAL puzzle logic ────────────────────────
  const tokens: WordToken[] = React.useMemo(
    () => tokenizeAyah(puzzleVerse),
    [puzzleVerse],
  );

  // ── Scaled timing ──────────────────────────────────────────
  const SECTION_ENTER = Math.round(10 * animationSlowdown);
  const PLACE_START   = Math.round(35 * animationSlowdown);
  const HOVER_DUR     = Math.round(BASE_HOVER * animationSlowdown);
  const GRAB_DUR      = Math.round(BASE_GRAB  * animationSlowdown);
  const DRAG_DUR      = Math.round(BASE_DRAG  * animationSlowdown);
  const PAUSE_DUR     = Math.round(BASE_PAUSE * animationSlowdown);
  const DROP_DUR      = Math.round(BASE_DROP  * animationSlowdown);
  const STAGGER       = Math.round(BASE_STAGGER * animationSlowdown);
  const WORD_TOTAL    = HOVER_DUR + GRAB_DUR + DRAG_DUR + PAUSE_DUR + DROP_DUR;

  // ── Section entrance ──────────────────────────────────────
  const entranceSpring = spring({ frame: sf(frame), fps, config: { damping: 14, stiffness: 80, mass: 0.8 } });
  const sectionOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);
  const sectionY       = interpolate(entranceSpring, [0, 1], [60, 0]);

  // ── Per-word phase calculator ─────────────────────────────
  const getWordPhase = (index: number) => {
    const wordStart = PLACE_START + index * STAGGER;
    const elapsed = frame - wordStart;
    if (elapsed < 0) return { phase: 'waiting' as const, t: 0 };

    const hoverEnd = HOVER_DUR;
    const grabEnd  = hoverEnd + GRAB_DUR;
    const dragEnd  = grabEnd + DRAG_DUR;
    const pauseEnd = dragEnd + PAUSE_DUR;
    const dropEnd  = pauseEnd + DROP_DUR;

    if (elapsed < hoverEnd) return { phase: 'hover' as const,  t: elapsed / HOVER_DUR };
    if (elapsed < grabEnd)  return { phase: 'grab'  as const,  t: (elapsed - hoverEnd) / GRAB_DUR };
    if (elapsed < dragEnd)  return { phase: 'drag'  as const,  t: (elapsed - grabEnd) / DRAG_DUR };
    if (elapsed < pauseEnd) return { phase: 'pause' as const, t: (elapsed - dragEnd) / PAUSE_DUR };
    if (elapsed < dropEnd)  return { phase: 'drop'  as const,  t: (elapsed - pauseEnd) / DROP_DUR };
    return { phase: 'placed' as const, t: 1 };
  };

  const placedCount = tokens.reduce(
    (count, _, i) => count + (getWordPhase(i).phase === 'placed' ? 1 : 0),
    0,
  );

  // ── Responsive sizes ──────────────────────────────────────
  const isHorizontal = ratio === 'horizontal';
  const pad = isHorizontal ? 80 : 40;
  const containerWidth = isHorizontal ? 700 : ratio === 'square' ? 560 : 480;
  const wordFS = fontSize(FONT_SIZES.arabicVerse, ratio) * 0.75;
  const slotWidth = Math.max(80, Math.floor((containerWidth - 40 - (tokens.length - 1) * 10) / tokens.length));
  const slotHeight = isHorizontal ? 60 : 50;

  // ── Layout geometry for cursor path ────────────────────────
  // We define slot and bank positions relative to the center of the puzzle container.
  const ANSWER_AREA_CENTER_Y = 0;     // answer area vertical center (relative)
  const BANK_CENTER_Y = slotHeight + 80; // bank is below answer area

  // Compute slot X positions (centered, RTL-reversed)
  const slotPositions = tokens.map((_, i) => {
    const totalWidth = tokens.length * slotWidth + (tokens.length - 1) * 10;
    const startX = -totalWidth / 2 + slotWidth / 2;
    const idx = isRTL ? tokens.length - 1 - i : i;
    return { x: startX + idx * (slotWidth + 10), y: ANSWER_AREA_CENTER_Y };
  });

  // Compute bank word positions (centered row)
  const bankPositions = tokens.map((_, i) => {
    const bankWordWidth = slotWidth * 0.9;
    const bankGap = 10;
    const totalBankWidth = tokens.length * bankWordWidth + (tokens.length - 1) * bankGap;
    const startX = -totalBankWidth / 2 + bankWordWidth / 2;
    return { x: startX + i * (bankWordWidth + bankGap), y: BANK_CENTER_Y };
  });

  // ── Success timing ────────────────────────────────────────
  const allPlacedFrame = PLACE_START + (tokens.length - 1) * STAGGER + WORD_TOTAL;
  const mashallahStart = allPlacedFrame + 15;
  const showMashallah = frame >= mashallahStart;

  // ── Find active word for cursor ───────────────────────────
  const activeWordIndex = tokens.findIndex((_, i) => {
    const { phase } = getWordPhase(i);
    return phase !== 'waiting' && phase !== 'placed';
  });

  // ── Cursor position computation ───────────────────────────
  let cursorX = 0;
  let cursorY = 0;
  let cursorPressing = false;
  let cursorVisible = false;

  if (activeWordIndex >= 0 && !showMashallah) {
    const { phase, t } = getWordPhase(activeWordIndex);
    cursorVisible = true;

    const bankPos = bankPositions[activeWordIndex];
    const slotPos = slotPositions[activeWordIndex];

    if (phase === 'hover') {
      // Cursor moves smoothly to the bank word center
      const eased = EASE_MOVE(t);
      const prevSlot = activeWordIndex > 0 ? slotPositions[activeWordIndex - 1] : { x: 0, y: -60 };
      cursorX = interpolate(eased, [0, 1], [prevSlot.x, bankPos.x]);
      cursorY = interpolate(eased, [0, 1], [prevSlot.y, bankPos.y]);
      cursorPressing = false;
    } else if (phase === 'grab') {
      // Cursor is at bank word, pressing down
      cursorX = bankPos.x;
      cursorY = bankPos.y;
      cursorPressing = true;
    } else if (phase === 'drag') {
      // Cursor + word travel from bank to slot via arc
      const eased = EASE_MOVE(t);
      cursorX = interpolate(eased, [0, 1], [bankPos.x, slotPos.x]);
      const linearY = interpolate(eased, [0, 1], [bankPos.y, slotPos.y]);
      // Arc: parabolic Y dip
      const arcPeak = -40;
      const arcOffset = arcPeak * 4 * t * (1 - t);
      cursorY = linearY + arcOffset;
      cursorPressing = true;
    } else if (phase === 'pause') {
      cursorX = slotPos.x;
      cursorY = interpolate(EASE_DROP(t), [0, 1], [slotPos.y + 6, slotPos.y + 2]);
      cursorPressing = true;
    } else if (phase === 'drop') {
      const eased = EASE_DROP(t);
      cursorX = interpolate(eased, [0, 1], [slotPos.x, slotPos.x + 15]);
      cursorY = interpolate(eased, [0, 1], [slotPos.y + 2, slotPos.y - 10]);
      cursorPressing = false;
    }
  }

  const cursorOpacity = cursorVisible
    ? interpolate(
        frame,
        [PLACE_START - 5, PLACE_START, allPlacedFrame - 3, allPlacedFrame + 5],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      )
    : 0;

  const progress = tokens.length > 0 ? placedCount / tokens.length : 0;

  // ── Mashallah overlay transition ──────────────────────────
  const mashallahFade = showMashallah
    ? interpolate(frame, [mashallahStart, mashallahStart + 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: pad,
        background: COLORS.bgDark,
      }}
    >
      {/* ── Puzzle UI (fades out when Mashallah appears) ────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          maxWidth: containerWidth + 80,
          position: 'relative',
          opacity: sectionOpacity * (1 - mashallahFade),
          transform: `translateY(${sectionY}px)`,
        }}
      >
        {/* ── Header: Surah Name + Icons ─────────────────── */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            {/* Back arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.white,
                  }}
                >
                  {puzzleSurahEnglish}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 12,
                    color: COLORS.textMuted,
                  }}
                >
                  Ayah 1
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HeartIcon filled />
            <HelpIcon />
          </div>
        </div>

        {/* ── Status row: Mistakes, Tips, Refresh, Counter ── */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.textMuted }}>
              Mistakes: 0/3
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2}>
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.textMuted }}>
                Tips: 1/1
              </span>
            </div>
            <RefreshIcon />
          </div>
          <span style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.textMuted }}>
            {placedCount}/{tokens.length}
          </span>
        </div>

        {/* ── Progress bar ───────────────────────────────── */}
        <div
          style={{
            width: '100%',
            height: 5,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${COLORS.emeraldDark}, ${COLORS.emerald})`,
              borderRadius: 9999,
            }}
          />
        </div>

        {/* ── Answer Area (dotted border, numbered slots) ── */}
        <div
          style={{
            width: '100%',
            padding: '20px 16px',
            borderRadius: 16,
            border: `2px dashed rgba(255,255,255,0.1)`,
            background: 'rgba(255,255,255,0.01)',
            display: 'flex',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
            position: 'relative',
            minHeight: slotHeight + 30,
          }}
        >
          {tokens.map((token, index) => {
            const { phase, t } = getWordPhase(index);
            const isActive = phase !== 'waiting' && phase !== 'placed';
            const isPlaced = phase === 'placed';
            const isAnimating = isActive;

            // Slot visual state
            const slotBorderColor = isPlaced
              ? `rgba(5,150,105,0.6)`
              : `rgba(255,255,255,0.08)`;
            const slotBg = isPlaced
              ? `rgba(5,150,105,0.12)`
              : 'rgba(255,255,255,0.02)';
            const slotBorderStyle = isPlaced ? 'solid' : 'dashed';

            // Phase-based transforms for the word inside the slot
            let wordX = 0;
            let wordY = 0;
            let wordScale = 1;
            let wordOpacity = 0;
            let shadowBlur = 0;

            if (phase === 'hover' || phase === 'grab') {
              // Word not visible in slot yet (still in bank)
              wordOpacity = 0;
            } else if (phase === 'drag') {
              // Word traveling from bank to slot
              const eased = EASE_MOVE(t);
              const bankPos = bankPositions[index];
              const slotPos = slotPositions[index];
              const dx = bankPos.x - slotPos.x;
              const dy = bankPos.y - slotPos.y;
              wordX = interpolate(eased, [0, 1], [dx, 0]);
              const linearDy = interpolate(eased, [0, 1], [dy, 0]);
              const arcPeak = -40;
              const arcOffset = arcPeak * 4 * t * (1 - t);
              wordY = linearDy + arcOffset;
              wordScale = interpolate(eased, [0, 0.3, 0.7, 1], [1.08, 1.05, 1.05, 1.02]);
              wordOpacity = 1;
              shadowBlur = interpolate(eased, [0, 0.5, 1], [18, 22, 8]);
            } else if (phase === 'pause') {
              const eased = EASE_DROP(t);
              wordY = interpolate(eased, [0, 1], [6, 3]);
              wordScale = 1.02;
              wordOpacity = 1;
              shadowBlur = interpolate(eased, [0, 1], [8, 4]);
            } else if (phase === 'drop') {
              const dropSpring = spring({
                frame: Math.round(t * DROP_DUR),
                fps,
                config: { damping: 8, stiffness: 300, mass: 0.4 },
                durationInFrames: DROP_DUR,
              });
              wordY = interpolate(dropSpring, [0, 1], [3, 0]);
              wordScale = interpolate(dropSpring, [0, 1], [1.02, 1.0]);
              wordOpacity = 1;
              shadowBlur = interpolate(dropSpring, [0, 1], [4, 0]);
            } else if (phase === 'placed') {
              wordOpacity = 1;
              wordScale = 1;
            }

            // Slot number pulsing for empty slots
            const slotPulse =
              !isPlaced && !isActive && frame >= SECTION_ENTER
                ? interpolate(Math.sin(frame * 0.08 + index), [-1, 1], [0.35, 0.6])
                : 0;

            // Display slot number (reversed for RTL)
            const displayNumber = isRTL ? tokens.length - index : index + 1;

            return (
              <div
                key={token.id}
                style={{
                  width: slotWidth,
                  height: slotHeight,
                  borderRadius: 12,
                  border: `2px ${slotBorderStyle} ${slotBorderColor}`,
                  background: slotBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isPlaced || isActive ? 1 : 0.5 + slotPulse,
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: isPlaced
                    ? `0 0 16px rgba(5,150,105,0.2), inset 0 0 8px rgba(5,150,105,0.08)`
                    : 'none',
                }}
              >
                {(isAnimating && phase !== 'hover' && phase !== 'grab') || isPlaced ? (
                  <div
                    style={{
                      transform: `translate(${wordX}px, ${wordY}px) scale(${wordScale})`,
                      opacity: wordOpacity,
                      filter: shadowBlur > 0
                        ? `drop-shadow(0 ${shadowBlur * 0.4}px ${shadowBlur}px rgba(0,0,0,0.4))`
                        : 'none',
                      willChange: 'transform, filter, opacity',
                      zIndex: isAnimating ? 50 : 1,
                      position: isAnimating ? 'relative' : 'static',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.arabic,
                        fontSize: wordFS,
                        lineHeight: 1.6,
                        color: COLORS.neonGreen,
                      }}
                    >
                      <HarakatColoredText text={token.text} />
                    </span>
                  </div>
                ) : (
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.textMuted }}>
                    {displayNumber}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Instruction text ──────────────────────────── */}
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 13,
            color: COLORS.textMuted,
            textAlign: 'center',
          }}
        >
          Drag or tap a word to place it
        </div>

        {/* ── Word Bank ──────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {tokens.map((token, index) => {
            const { phase, t } = getWordPhase(index);

            let bankOpacity = 1;
            let bankScale = 1;
            let bankY = 0;
            let bankShadow = 0;
            let bankBorder = `1px solid rgba(255,255,255,0.08)`;

            if (phase === 'waiting') {
              bankOpacity = 1;
            } else if (phase === 'hover') {
              // Word highlights on hover
              const eased = EASE_LIFT(t);
              bankScale = interpolate(eased, [0, 1], [1, 1.05]);
              bankShadow = interpolate(eased, [0, 1], [0, 8]);
              bankBorder = `1px solid rgba(234,179,8,0.6)`;
            } else if (phase === 'grab') {
              // Word grabbed: scale up, lifted
              const eased = EASE_LIFT(t);
              bankScale = interpolate(eased, [0, 1], [1.05, 1.12]);
              bankY = interpolate(eased, [0, 1], [0, -8]);
              bankShadow = interpolate(eased, [0, 1], [8, 20]);
              bankBorder = `2px solid rgba(234,179,8,0.8)`;
            } else if (phase === 'drag') {
              // Fade out quickly
              bankOpacity = interpolate(t, [0, 0.15], [0.6, 0], {
                extrapolateRight: 'clamp',
              });
            } else {
              bankOpacity = 0;
            }

            if (bankOpacity <= 0) return null;

            return (
              <div
                key={`bank-${token.id}`}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: COLORS.surface,
                  border: bankBorder,
                  opacity: bankOpacity,
                  cursor: 'grab',
                  transform: `translateY(${bankY}px) scale(${bankScale})`,
                  boxShadow: bankShadow > 0
                    ? `0 ${bankShadow * 0.4}px ${bankShadow}px rgba(0,0,0,0.35)`
                    : 'none',
                  willChange: 'transform, box-shadow, opacity',
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.arabic,
                    fontSize: wordFS * 0.9,
                    color: COLORS.white,
                    lineHeight: 1.6,
                  }}
                >
                  <HarakatColoredText text={token.text} />
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Simulated Cursor ─────────────────────────── */}
        {/* Position relative to the container center */}
        <Cursor
          x={cursorX + containerWidth / 2 + 40}
          y={cursorY + slotHeight * 2 + 80}
          pressing={cursorPressing}
          opacity={cursorOpacity}
        />
      </div>

      {/* ── Mashallah Success Overlay ──────────────────── */}
      <MashallahOverlay frame={frame} fps={fps} startFrame={mashallahStart} />
    </AbsoluteFill>
  );
};

export default PuzzleScene;
