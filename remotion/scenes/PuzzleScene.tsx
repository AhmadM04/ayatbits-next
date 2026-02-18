import React from 'react';
import {
  AbsoluteFill,
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
  /** Brand accent color */
  primaryColor: string;
  /** CSS font-family for UI text */
  fontFamily: string;
  /** Full Arabic verse text – tokenized by the real tokenizeAyah() */
  puzzleVerse: string;
  /** English translation shown after all words are placed */
  puzzleTranslation: string;
  /** Arabic surah name shown above the verse */
  puzzleSurahArabic: string;
  /** English surah caption */
  puzzleSurahEnglish: string;
  /**
   * When `true`, the answer area uses `direction: rtl` (correct for Arabic).
   * Toggle to `false` to test LTR layout.
   */
  isRTL: boolean;
  /**
   * Multiplies all stagger delays and divides spring frames.
   * 1 = original speed, 3 = smooth & cinematic, 5 = very slow.
   */
  animationSlowdown: number;
}

/**
 * Frame-Driven Puzzle Scene
 * =========================
 * Uses the REAL tokenizeAyah() + HarakatColoredText from the AyatBits codebase.
 *
 * Timeline (relative to Sequence start, at slowdown = 1):
 *   Frame  0–10  : Section slides in
 *   Frame 10–30  : Empty answer slots appear
 *   Frame 30–…   : Words fly in one by one (staggered springs)
 *   Frame …+10   : Translation fades in
 *   Frame …+5    : Success badge pops in
 *
 * `animationSlowdown` stretches all timings proportionally so the
 * Studio's slider gives a live cinematic speed control.
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

  // Helper: slow the spring's effective frame
  const sf = (f: number) => f / animationSlowdown;

  // ── Tokenize using REAL puzzle logic ────────────────────────
  const tokens: WordToken[] = React.useMemo(
    () => tokenizeAyah(puzzleVerse),
    [puzzleVerse],
  );

  // ── Scaled timing constants ──────────────────────────────────
  const PLACE_START = Math.round(30 * animationSlowdown);
  const STAGGER     = Math.round(8  * animationSlowdown);

  // ── Section entrance ────────────────────────────────────────
  const entranceSpring  = spring({ frame: sf(frame), fps, config: { damping: 14, stiffness: 80, mass: 0.8 } });
  const sectionOpacity  = interpolate(entranceSpring, [0, 1], [0, 1]);
  const sectionY        = interpolate(entranceSpring, [0, 1], [60, 0]);

  // ── How many words are placed based on current frame ────────
  const placedCount = Math.min(
    tokens.length,
    Math.max(0, Math.floor((frame - PLACE_START) / STAGGER) + 1),
  );

  // ── Success state ────────────────────────────────────────────
  const successFrame = PLACE_START + tokens.length * STAGGER;
  const showSuccess  = frame >= successFrame;
  const successFlash = showSuccess
    ? interpolate(
        frame,
        [successFrame, successFrame + 8, successFrame + 20],
        [0, 0.4, 0],
        { extrapolateRight: 'clamp' },
      )
    : 0;

  const checkSpring = spring({
    frame: sf(Math.max(0, frame - successFrame - 2)),
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 },
  });

  // ── Responsive sizes ─────────────────────────────────────────
  const wordFontSize = fontSize(FONT_SIZES.arabicVerse, ratio);
  const slotMinWidth = ratio === 'horizontal' ? 130 : 100;
  const slotHeight   = ratio === 'horizontal' ? 68  : 56;
  const gap          = ratio === 'horizontal' ? 18  : 12;
  const pad          = ratio === 'horizontal' ? 120 : 60;

  const progress = tokens.length > 0 ? placedCount / tokens.length : 0;

  // Derive slightly lighter shade for filled slot border
  const slotFillBorder = `${primaryColor}80`;
  const slotFillBg     = `${primaryColor}15`;
  const successGlow    = `${primaryColor}30`;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: pad,
        opacity: sectionOpacity,
        transform: `translateY(${sectionY}px)`,
      }}
    >
      {/* Success flash overlay */}
      {successFlash > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle, ${primaryColor}${Math.round(successFlash * 255)
              .toString(16)
              .padStart(2, '0')} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          width: '100%',
          maxWidth: ratio === 'horizontal' ? 1400 : 800,
        }}
      >
        {/* Surah header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: FONTS.arabic,
              fontSize: wordFontSize * 0.55,
              color: primaryColor,
              opacity: 0.9,
              direction: 'rtl',
            }}
          >
            سورة {puzzleSurahArabic}
          </span>
          <span
            style={{
              fontFamily,
              fontSize: fontSize(FONT_SIZES.caption, ratio),
              color: COLORS.textMuted,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Surah {puzzleSurahEnglish}
          </span>
        </div>

        {/* Puzzle header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: ratio === 'horizontal' ? 700 : 500,
          }}
        >
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 50,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontFamily, fontSize: 13, fontWeight: 500, color: COLORS.textMuted }}>
              Mistakes: 0
            </span>
          </div>
          <span style={{ fontFamily, fontSize: 13, color: COLORS.textMuted }}>
            {placedCount}/{tokens.length}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            maxWidth: ratio === 'horizontal' ? 700 : 500,
            height: 4,
            background: `${COLORS.white}08`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: primaryColor,
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Answer area — direction driven by isRTL prop */}
        <div
          style={{
            width: '100%',
            maxWidth: ratio === 'horizontal' ? 700 : 500,
            minHeight: slotHeight + 40,
            padding: 20,
            borderRadius: 16,
            border: `2px dashed ${COLORS.border}`,
            background: `${COLORS.white}02`,
            display: 'flex',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap,
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {tokens.map((token, index) => {
            const isPlaced = index < placedCount;

            const wordDelay  = PLACE_START + index * STAGGER;
            const wordSpring = spring({
              frame: sf(Math.max(0, frame - wordDelay)),
              fps,
              config: { damping: 10, stiffness: 150, mass: 0.6 },
            });

            const wordY      = isPlaced ? interpolate(wordSpring, [0, 1], [80, 0]) : 0;
            const wordOpacity = isPlaced ? interpolate(wordSpring, [0, 1], [0, 1]) : 0;
            const wordScale  = isPlaced ? interpolate(wordSpring, [0, 1], [0.7, 1]) : 1;

            const slotPulse =
              !isPlaced && frame >= 10
                ? interpolate(Math.sin(frame * 0.1 + index), [-1, 1], [0.3, 0.6])
                : 0;

            return (
              <div
                key={token.id}
                style={{
                  minWidth: slotMinWidth,
                  height: slotHeight,
                  borderRadius: 12,
                  border: isPlaced
                    ? `2px solid ${slotFillBorder}`
                    : `2px dashed ${COLORS.border}`,
                  background: isPlaced ? slotFillBg : `${COLORS.white}05`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isPlaced ? 1 : 0.5 + slotPulse,
                  padding: '0 12px',
                  boxShadow: isPlaced ? `0 0 20px ${primaryColor}20` : 'none',
                }}
              >
                {isPlaced ? (
                  <div
                    style={{
                      transform: `translateY(${wordY}px) scale(${wordScale})`,
                      opacity: wordOpacity,
                    }}
                  >
                    {/* ── REAL HarakatColoredText from the codebase ── */}
                    <span
                      style={{
                        fontFamily: FONTS.arabic,
                        fontSize: wordFontSize,
                        lineHeight: 1.6,
                        color: COLORS.neonGreen,
                      }}
                    >
                      <HarakatColoredText text={token.text} />
                    </span>
                  </div>
                ) : (
                  <span style={{ fontFamily, fontSize: 13, color: COLORS.textMuted }}>
                    {index + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Word bank */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            maxWidth: ratio === 'horizontal' ? 700 : 500,
          }}
        >
          {tokens.map((token, index) => {
            const isPlaced   = index < placedCount;
            const bankOpacity = isPlaced
              ? interpolate(
                  frame,
                  [PLACE_START + index * STAGGER - 2, PLACE_START + index * STAGGER + 3],
                  [1, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                )
              : 1;

            if (bankOpacity <= 0) return null;

            return (
              <div
                key={`bank-${token.id}`}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  opacity: bankOpacity,
                  cursor: 'grab',
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.arabic,
                    fontSize: wordFontSize * 0.8,
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

        {/* Translation (fades in after all placed) */}
        {frame >= PLACE_START + 10 && (
          <div
            style={{
              fontFamily,
              fontSize: fontSize(FONT_SIZES.body, ratio),
              color: COLORS.textSecondary,
              textAlign: 'center',
              maxWidth: ratio === 'horizontal' ? 700 : 500,
              lineHeight: 1.6,
              fontStyle: 'italic',
              opacity: interpolate(
                frame,
                [
                  PLACE_START + tokens.length * STAGGER - 5,
                  PLACE_START + tokens.length * STAGGER + 10,
                ],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              ),
            }}
          >
            &ldquo;{puzzleTranslation}&rdquo;
          </div>
        )}

        {/* Success badge */}
        {showSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: `${COLORS.emeraldDark}20`,
              border: `2px solid ${COLORS.emeraldDark}`,
              borderRadius: 16,
              padding: '12px 28px',
              transform: `scale(${interpolate(checkSpring, [0, 1], [0.5, 1])})`,
              opacity: interpolate(checkSpring, [0, 1], [0, 1]),
              boxShadow: `0 0 40px ${successGlow}`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: COLORS.emeraldDark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke={COLORS.white}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={24}
                  strokeDashoffset={interpolate(checkSpring, [0, 1], [24, 0])}
                />
              </svg>
            </div>
            <span
              style={{
                fontFamily,
                fontSize: fontSize(FONT_SIZES.body, ratio),
                fontWeight: 700,
                color: COLORS.emeraldDark,
              }}
            >
              Verse Complete!
            </span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
