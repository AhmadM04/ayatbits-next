import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { type CompositionProps } from './Schema';
import { Background } from './scenes/Background';
import { HeroScene } from './scenes/HeroScene';
import { PuzzleScene } from './scenes/PuzzleScene';
import { DashboardScene } from './scenes/DashboardScene';
import { StreakScene } from './scenes/StreakScene';
import { FeatureScene } from './scenes/FeatureScene';
import { CTAScene } from './scenes/CTAScene';
import { CANVAS_SIZES } from './Theme';

/**
 * AyatBitsShowcase
 * =================
 * Orchestrates all scenes.  Props are the full `CompositionProps` inferred
 * from `compositionSchema` — every field is editable in Remotion Studio.
 *
 * Timeline (at 30 fps):
 *   0.0s –  3.0s  (frame   0– 90)  → Hero (logo + title)
 *   3.0s –  7.5s  (frame  90–225)  → Puzzle Reveal
 *   7.5s – 11.5s  (frame 225–345)  → Dashboard Preview
 *  11.5s – 15.0s  (frame 345–450)  → Streak Counter
 *  15.0s – 18.5s  (frame 450–555)  → Feature Highlights
 *  18.5s – 22.0s  (frame 555–660)  → Call to Action
 *
 * Total: 22 s / 660 frames @ 30 fps
 */
export const AyatBitsShowcase: React.FC<CompositionProps> = (props) => {
  const {
    // Global
    ratio,
    primaryColor,
    backgroundColor,
    fontFamily,
    animationSlowdown,

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

  // ── Timing (in frames) ─────────────────────────────────────────
  const HERO_START      = 0;
  const HERO_DUR        = fps * 3;

  const PUZZLE_START    = HERO_START + HERO_DUR;
  const PUZZLE_DUR      = Math.round(fps * 4.5);

  const DASH_START      = PUZZLE_START + PUZZLE_DUR;
  const DASH_DUR        = fps * 4;

  const STREAK_START    = DASH_START + DASH_DUR;
  const STREAK_DUR      = Math.round(fps * 3.5);

  const FEATURES_START  = STREAK_START + STREAK_DUR;
  const FEATURES_DUR    = Math.round(fps * 3.5);

  const CTA_START       = FEATURES_START + FEATURES_DUR;
  const CTA_DUR         = Math.round(fps * 3.5);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* ── Background (always rendered) ───────────────────────── */}
      <Background
        ratio={ratio}
        primaryColor={primaryColor}
        backgroundColor={backgroundColor}
      />

      {/* ── Audio (optional) ────────────────────────────────────── */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={0.7} />}

      {/* ── Scene 1: Hero ─────────────────────────────────────── */}
      <Sequence from={HERO_START} durationInFrames={HERO_DUR} name="Hero">
        <HeroScene
          ratio={ratio}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          logoAnimationScale={logoAnimationScale}
          animationSlowdown={animationSlowdown}
        />
      </Sequence>

      {/* ── Scene 2: Puzzle Reveal ─────────────────────────────── */}
      <Sequence from={PUZZLE_START} durationInFrames={PUZZLE_DUR} name="Puzzle">
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
      </Sequence>

      {/* ── Scene 3: Dashboard Preview ─────────────────────────── */}
      <Sequence from={DASH_START} durationInFrames={DASH_DUR} name="Dashboard">
        <DashboardScene ratio={ratio} />
      </Sequence>

      {/* ── Scene 4: Streak Counter ────────────────────────────── */}
      <Sequence from={STREAK_START} durationInFrames={STREAK_DUR} name="Streak">
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
      </Sequence>

      {/* ── Scene 5: Feature Highlights ────────────────────────── */}
      <Sequence from={FEATURES_START} durationInFrames={FEATURES_DUR} name="Features">
        <FeatureScene
          ratio={ratio}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          features={features}
          animationSlowdown={animationSlowdown}
        />
      </Sequence>

      {/* ── Scene 6: Call to Action ────────────────────────────── */}
      <Sequence from={CTA_START} durationInFrames={CTA_DUR} name="CTA">
        <CTAScene
          ratio={ratio}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          ctaHeading={ctaHeading}
          ctaButtonText={ctaButtonText}
          ctaUrl={ctaUrl}
          animationSlowdown={animationSlowdown}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
