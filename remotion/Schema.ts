/**
 * AyatBits Remotion – Comprehensive Zod Schema
 * ==============================================
 * Every field here becomes a visual control in the Remotion Studio
 * sidebar.  Import `compositionSchema` into Main.tsx and use it as
 * the `schema` prop of each `<Composition>`.
 *
 * Requires:
 *   - zod            3.22.x  (already installed)
 *   - @remotion/zod-types    (already installed – provides zColor())
 */

import { zColor } from '@remotion/zod-types';
import { z } from 'zod';

export const compositionSchema = z.object({
  // ── Global Settings ─────────────────────────────────────────────
  /** Brand accent color.  Rendered as a color-picker in Studio. */
  primaryColor: zColor().default('#168c4a'),
  /** Canvas background color. */
  backgroundColor: zColor().default('#0a0a0a'),
  /**
   * CSS font-family string for all UI text.
   * Arabic verse text always uses the built-in Arabic stack.
   */
  fontFamily: z.string().default("'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif"),

  // ── Aspect Ratio ────────────────────────────────────────────────
  /** Locked per composition — but visible in Studio for reference. */
  ratio: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),

  // ── Per-Scene Durations (seconds) ───────────────────────────────
  // Each value is in seconds. The total video length is computed
  // automatically via calculateMetadata in Main.tsx.
  /** Duration of the Hero / Intro scene (seconds). */
  heroDuration: z.number().min(1).max(15).step(0.5).default(3),
  /** Duration of the Puzzle Reveal scene (seconds). */
  puzzleDuration: z.number().min(1).max(15).step(0.5).default(4.5),
  /** Duration of the Dashboard Preview scene (seconds). */
  dashboardDuration: z.number().min(1).max(15).step(0.5).default(4),
  /** Duration of the Streak Counter scene (seconds). */
  streakDuration: z.number().min(1).max(15).step(0.5).default(3.5),
  /** Duration of the Feature Highlights scene (seconds) — needs extra time for translation switch + AI tafsir demo. */
  featuresDuration: z.number().min(1).max(30).step(0.5).default(9),
  /** Duration of the Call-to-Action closing scene (seconds). */
  ctaDuration: z.number().min(1).max(15).step(0.5).default(3.5),

  // ── Hero / Intro Scene ──────────────────────────────────────────
  heroTitle: z.string().default('AyatBits'),
  heroSubtitle: z.string().default('Gamified Quran Memorization'),
  /**
   * Multiplier applied to the icon's final scale.
   * 1.0 = original size, 1.3 = 30 % bigger.
   */
  logoAnimationScale: z.number().min(0.5).max(2).default(1),

  // ── Puzzle Scene ────────────────────────────────────────────────
  /** Full Arabic verse text – tokenized at runtime by tokenizeAyah(). */
  puzzleVerse: z
    .string()
    .default('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'),
  /** English translation shown below the answer area. */
  puzzleTranslation: z
    .string()
    .default('In the name of Allah, the Most Gracious, the Most Merciful'),
  /** Arabic surah name (shown above the verse). */
  puzzleSurahArabic: z.string().default('الفاتحة'),
  /** English surah name (shown as caption). */
  puzzleSurahEnglish: z.string().default('Al-Fatiha'),
  /**
   * When true the answer area uses `direction: rtl` (correct for Arabic).
   * Toggle off for LTR languages or testing.
   */
  isRTL: z.boolean().default(true),
  /**
   * Slows down ALL spring / stagger animations.
   * 1 = original speed (fast & snappy)
   * 3 = smooth and cinematic
   * 5 = very slow
   */
  animationSlowdown: z.number().min(1).max(5).default(1.5),

  // ── Streak Scene ────────────────────────────────────────────────
  /** The target streak number displayed large on screen. */
  streakNumber: z.number().min(0).default(15),
  /** The starting streak number used for the count-up animation. */
  streakFrom: z.number().min(0).default(14),
  /** Label text beneath the counter (e.g. "Day Streak"). */
  streakLabel: z.string().default('Day Streak'),
  /** Toggle the 🔥 fire emoji row and sparkle particles. */
  showFireEffect: z.boolean().default(true),
  /** Header text above the counter card. */
  dailyAchievementText: z.string().default('Daily Achievement Unlocked!'),
  /** Stat shown in the bottom-left badge. */
  completedPuzzles: z.number().min(0).default(47),
  /** Stat shown in the bottom-right badge. */
  juzsExplored: z.number().min(0).default(3),

  // ── Feature Highlights ──────────────────────────────────────────
  /**
   * Array of feature strings, one per card.
   * Exactly three strings render best (matching the icon set).
   */
  features: z
    .array(z.string())
    .default(['6,236 Verses', 'Built-in Tafsir', 'Audio Accompaniment']),

  // ── CTA / Outro Scene ───────────────────────────────────────────
  /** Large headline text in the closing scene. */
  ctaHeading: z.string().default('Start Memorizing'),
  /** Text label on the CTA button. */
  ctaButtonText: z.string().default('Visit Web App'),
  /** URL / domain shown as social proof beneath the button. */
  ctaUrl: z.string().default('ayatbits.com'),

  // ── Audio (optional) ────────────────────────────────────────────
  /**
   * Path relative to /public for optional background audio.
   * Leave empty for silent render.
   */
  audioSrc: z.string().optional(),
});

/** Inferred TypeScript type — use this as the props type of AyatBitsShowcase. */
export type CompositionProps = z.infer<typeof compositionSchema>;

// ── Duration helpers ──────────────────────────────────────────────
// Shared between Main.tsx (calculateMetadata) and AyatBitsShowcase.

/** Cross-fade overlap in frames (keep in sync with FadeSlide default). */
export const CROSS_FADE_FRAMES = 20;

/**
 * Compute total video duration in frames from the per-scene second values.
 * Each scene's content is `Math.round(seconds × fps)` frames.
 * The total is the sum of all content durations (the cross-fade overlap
 * doesn't shorten the video because the last scene has no exit fade).
 */
export function calculateTotalFrames(props: CompositionProps, fps: number): number {
  const sceneDurations = [
    props.heroDuration,
    props.puzzleDuration,
    props.dashboardDuration,
    props.streakDuration,
    props.featuresDuration,
    props.ctaDuration,
  ];
  return sceneDurations.reduce((sum, sec) => sum + Math.round(sec * fps), 0);
}

