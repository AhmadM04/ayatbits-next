import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { type CompositionProps, CROSS_FADE_FRAMES } from './Schema';
import { Background } from './scenes/Background';
import { HeroScene } from './scenes/HeroScene';
import { PuzzleScene } from './scenes/PuzzleScene';
import { DashboardScene } from './scenes/DashboardScene';
import { StreakScene } from './scenes/StreakScene';
import { FeatureScene } from './scenes/FeatureScene';
import { CTAScene } from './scenes/CTAScene';

// ─────────────────────────────────────────────────────────────────
// FadeSlide — cross-fade transition wrapper
// ─────────────────────────────────────────────────────────────────
// Wraps any scene with:
//   • Fade-IN  over the first `transFrames` frames  (opacity 0 → 1)
//   • Slide-IN from below over the same window      (translateY 40 → 0)
//   • Fade-OUT over the last `transFrames` frames   (opacity 1 → 0)
//   • Slide-OUT upward over the same window         (translateY 0 → -40)
//
// By extending each Sequence's durationInFrames by `TRANS` and
// starting the NEXT sequence `TRANS` frames before the current one ends,
// adjacent scenes overlap during the transition window — creating a
// true cross-fade without any additional npm packages.
//
// Pass `dur` = the sequence's own durationInFrames so the keyframes
// are correct (useVideoConfig().durationInFrames returns the GLOBAL total).
// ─────────────────────────────────────────────────────────────────
interface FadeSlideProps {
  children: React.ReactNode;
  /** This sequence's total durationInFrames (NOT the global video duration). */
  dur: number;
  /** Number of frames for each fade-in and fade-out transition. Default 20. */
  transFrames?: number;
  /** Set true for the last scene to skip the fade-out (cleaner ending). */
  isLast?: boolean;
}

const FadeSlide: React.FC<FadeSlideProps> = ({
  children,
  dur,
  transFrames = 20,
  isLast = false,
}) => {
  const frame = useCurrentFrame();

  // Guard: mid point separates in-region from out-region.
  // If sequence is shorter than 2×transFrames, clamp to midpoint.
  const mid = Math.max(transFrames + 1, dur - transFrames);

  const opacity = isLast
    ? // Last scene: fade in only
      interpolate(frame, [0, transFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(frame, [0, transFrames, mid, dur], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const slideY = isLast
    ? interpolate(frame, [0, transFrames], [40, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(frame, [0, transFrames, mid, dur], [40, 0, 0, -40], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${slideY}px)`,
        // GPU-composited properties only — no layout thrash
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// AyatBitsShowcase
// ─────────────────────────────────────────────────────────────────
/**
 * Orchestrates all scenes with smooth cross-fade transitions.
 *
 * Transition strategy (no extra packages required):
 *   Each scene's Sequence is extended by TRANS frames beyond its content
 *   duration. The NEXT scene starts TRANS frames before the current one
 *   ends — so they overlap. FadeSlide handles the in/out opacity within
 *   each sequence. Result: seamless cross-fade at every boundary.
 *
 * Timeline @ 30 fps (TRANS = 20 frames = 0.67 s):
 *
 *   Scene      Content start  Content dur   Sequence start  Sequence dur
 *   ─────────  ─────────────  ───────────   ──────────────  ────────────
 *   Hero              0           90 fr            0           110 fr
 *   Puzzle           90          135 fr           90           155 fr
 *   Dashboard       225          120 fr          225           140 fr
 *   Streak          345          105 fr          345           125 fr
 *   Features        450          105 fr          450           125 fr
 *   CTA             555          105 fr          555           105 fr  ← no exit fade
 *
 *   Total video: 660 frames = 22 s (unchanged)
 *
 * Audio sits outside every Sequence and is unaffected by timing changes.
 */
export const AyatBitsShowcase: React.FC<CompositionProps> = (props) => {
  const {
    // Global
    ratio,
    primaryColor,
    backgroundColor,
    fontFamily,
    animationSlowdown,

    // Per-scene durations (seconds, from Studio sidebar)
    heroDuration,
    puzzleDuration,
    dashboardDuration,
    streakDuration,
    featuresDuration,
    ctaDuration,

    // Hero
    heroTitle,
    heroSubtitle,
    logoAnimationScale,

    // Puzzle
    puzzleVerse,
    puzzleTranslation,
    puzzleSurahArabic,
    puzzleSurahEnglish,
    isRTL,

    // Streak
    streakNumber,
    streakFrom,
    streakLabel,
    showFireEffect,
    dailyAchievementText,
    completedPuzzles,
    juzsExplored,

    // Features
    features,

    // CTA
    ctaHeading,
    ctaButtonText,
    ctaUrl,

    // Audio
    audioSrc,
  } = props;

  const { fps } = useVideoConfig();

  // ── Cross-fade overlap (frames) ────────────────────────────────
  // Adjacent sequences overlap by this many frames.
  // Keep in sync with the `TRANS` default in FadeSlide above.
  const TRANS = CROSS_FADE_FRAMES;

  // ── Base content durations (derived from sidebar props) ────────
  const HERO_BASE      = Math.round(heroDuration * fps);
  const PUZZLE_BASE    = Math.round(puzzleDuration * fps);
  const DASH_BASE      = Math.round(dashboardDuration * fps);
  const STREAK_BASE    = Math.round(streakDuration * fps);
  const FEATURES_BASE  = Math.round(featuresDuration * fps);
  const CTA_BASE       = Math.round(ctaDuration * fps);

  // ── Sequence starts (dynamically chained) ──────────────────────
  // Each scene's content "starts" immediately when its Sequence opens —
  // the FadeSlide fade-in covers the first TRANS frames of that content.
  const HERO_START     = 0;
  const PUZZLE_START   = HERO_START    + HERO_BASE;
  const DASH_START     = PUZZLE_START  + PUZZLE_BASE;
  const STREAK_START   = DASH_START    + DASH_BASE;
  const FEATURES_START = STREAK_START  + STREAK_BASE;
  const CTA_START      = FEATURES_START + FEATURES_BASE;

  // ── Sequence durations (content + TRANS for outgoing overlap) ──
  // Each sequence runs TRANS frames past its content end so it can
  // fade out while the next sequence is fading in.
  const HERO_DUR      = HERO_BASE     + TRANS;
  const PUZZLE_DUR    = PUZZLE_BASE   + TRANS;
  const DASH_DUR      = DASH_BASE     + TRANS;
  const STREAK_DUR    = STREAK_BASE   + TRANS;
  const FEATURES_DUR  = FEATURES_BASE + TRANS;
  const CTA_DUR       = CTA_BASE; // last scene — no exit extension

  return (
    <AbsoluteFill style={{ backgroundColor }}>

      {/* ── Background (always rendered — no transitions) ─────── */}
      <Background
        ratio={ratio}
        primaryColor={primaryColor}
        backgroundColor={backgroundColor}
      />

      {/* ── Audio (always rendered — unaffected by transitions) ── */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={0.7} />}

      {/* ── Scene 1: Hero ──────────────────────────────────────── */}
      <Sequence from={HERO_START} durationInFrames={HERO_DUR} name="Hero">
        <FadeSlide dur={HERO_DUR} transFrames={TRANS}>
          <HeroScene
            ratio={ratio}
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            heroTitle={heroTitle}
            heroSubtitle={heroSubtitle}
            logoAnimationScale={logoAnimationScale}
            animationSlowdown={animationSlowdown}
          />
        </FadeSlide>
      </Sequence>

      {/* ── Scene 2: Puzzle Reveal ─────────────────────────────── */}
      <Sequence from={PUZZLE_START} durationInFrames={PUZZLE_DUR} name="Puzzle">
        <FadeSlide dur={PUZZLE_DUR} transFrames={TRANS}>
          <PuzzleScene
            ratio={ratio}
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            puzzleVerse={puzzleVerse}
            puzzleTranslation={puzzleTranslation}
            puzzleSurahArabic={puzzleSurahArabic}
            puzzleSurahEnglish={puzzleSurahEnglish}
            isRTL={isRTL}
            animationSlowdown={animationSlowdown}
          />
        </FadeSlide>
      </Sequence>

      {/* ── Scene 3: Dashboard Preview ─────────────────────────── */}
      <Sequence from={DASH_START} durationInFrames={DASH_DUR} name="Dashboard">
        <FadeSlide dur={DASH_DUR} transFrames={TRANS}>
          <DashboardScene ratio={ratio} />
        </FadeSlide>
      </Sequence>

      {/* ── Scene 4: Streak Counter ────────────────────────────── */}
      <Sequence from={STREAK_START} durationInFrames={STREAK_DUR} name="Streak">
        <FadeSlide dur={STREAK_DUR} transFrames={TRANS}>
          <StreakScene
            ratio={ratio}
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            streakNumber={streakNumber}
            streakFrom={streakFrom}
            streakLabel={streakLabel}
            showFireEffect={showFireEffect}
            dailyAchievementText={dailyAchievementText}
            completedPuzzles={completedPuzzles}
            juzsExplored={juzsExplored}
            animationSlowdown={animationSlowdown}
          />
        </FadeSlide>
      </Sequence>

      {/* ── Scene 5: Feature Highlights ────────────────────────── */}
      <Sequence from={FEATURES_START} durationInFrames={FEATURES_DUR} name="Features">
        <FadeSlide dur={FEATURES_DUR} transFrames={TRANS}>
          <FeatureScene
            ratio={ratio}
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            features={features}
            animationSlowdown={animationSlowdown}
          />
        </FadeSlide>
      </Sequence>

      {/* ── Scene 6: Call to Action ────────────────────────────── */}
      {/* isLast=true: skip the exit fade so the video ends cleanly */}
      <Sequence from={CTA_START} durationInFrames={CTA_DUR} name="CTA">
        <FadeSlide dur={CTA_DUR} transFrames={TRANS} isLast>
          <CTAScene
            ratio={ratio}
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            ctaHeading={ctaHeading}
            ctaButtonText={ctaButtonText}
            ctaUrl={ctaUrl}
            animationSlowdown={animationSlowdown}
          />
        </FadeSlide>
      </Sequence>

    </AbsoluteFill>
  );
};
