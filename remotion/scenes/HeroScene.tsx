import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONT_SIZES, fontSize, type AspectRatioKey } from '../Theme';

interface HeroSceneProps {
  ratio: AspectRatioKey;
  /** Brand accent color from schema */
  primaryColor: string;
  /** CSS font-family string from schema */
  fontFamily: string;
  /** Large title text */
  heroTitle: string;
  /** Subtitle / tagline */
  heroSubtitle: string;
  /**
   * Final icon scale multiplier.
   * 1.0 = default size, 1.3 = 30 % bigger.
   */
  logoAnimationScale: number;
  /**
   * Slows ALL springs by this factor.
   * 1 = original speed, 3 = cinematic.
   */
  animationSlowdown: number;
}

/**
 * Hero intro — icon-512.png bounces in with spring,
 * title slides up, tagline fades in.
 *
 * Slowdown: frame is divided by `animationSlowdown` before being fed
 * into every spring so the animation smoothly stretches out.
 */
export const HeroScene: React.FC<HeroSceneProps> = ({
  ratio,
  primaryColor,
  fontFamily,
  heroTitle,
  heroSubtitle,
  logoAnimationScale,
  animationSlowdown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Normalise the frame for all spring calculations
  const sf = (f: number) => f / animationSlowdown;

  // Icon entrance
  const iconSpring = spring({ frame: sf(frame), fps, config: { damping: 12, stiffness: 120, mass: 0.8 } });
  const iconScale   = interpolate(iconSpring, [0, 1], [0.3, 1 * logoAnimationScale]);
  const iconOpacity = interpolate(iconSpring, [0, 1], [0, 1]);
  const iconY       = interpolate(iconSpring, [0, 1], [80, 0]);

  // Glow pulse (frame-driven, not spring)
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.4, 0.8]);
  const glowScale = interpolate(Math.sin(frame * 0.06), [-1, 1], [1.0, 1.15]);

  // Title (delayed)
  const titleDelay  = Math.round(15 * animationSlowdown);
  const titleSpring = spring({ frame: sf(Math.max(0, frame - titleDelay)), fps, config: { damping: 14, stiffness: 100, mass: 0.6 } });
  const titleY      = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Tagline (more delayed)
  const tagDelay  = Math.round(30 * animationSlowdown);
  const tagSpring = spring({ frame: sf(Math.max(0, frame - tagDelay)), fps, config: { damping: 14, stiffness: 80, mass: 0.6 } });
  const tagY      = interpolate(tagSpring, [0, 1], [30, 0]);
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);

  const iconSize  = { vertical: 220, square: 200, horizontal: 240 }[ratio];
  const direction = ratio === 'horizontal' ? 'row' : 'column';

  // Split the title so "Bits" suffix gets the brand color
  const splitIdx = heroTitle.toLowerCase().lastIndexOf('bits');
  const titleBefore = splitIdx >= 0 ? heroTitle.slice(0, splitIdx) : heroTitle;
  const titleAfter  = splitIdx >= 0 ? heroTitle.slice(splitIdx)    : '';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: direction,
        gap: ratio === 'horizontal' ? 60 : 30,
      }}
    >
      {/* Icon + glow */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateY(${iconY}px) scale(${iconScale})`,
          opacity: iconOpacity,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: iconSize * 1.5,
            height: iconSize * 1.5,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${primaryColor}50 0%, transparent 70%)`,
            transform: `scale(${glowScale})`,
            filter: 'blur(20px)',
            opacity: glowPulse,
          }}
        />
        <Img
          src={staticFile('icon-512.png')}
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize * 0.22,
            boxShadow: `0 20px 60px ${primaryColor}40, 0 0 120px ${primaryColor}20`,
          }}
        />
      </div>

      {/* Text block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: ratio === 'horizontal' ? 'flex-start' : 'center',
          gap: 12,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily,
            fontSize: fontSize(FONT_SIZES.heroTitle, ratio),
            fontWeight: 800,
            color: COLORS.white,
            letterSpacing: '-0.02em',
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textShadow: `0 4px 30px ${primaryColor}60`,
          }}
        >
          {titleBefore}
          {titleAfter && <span style={{ color: primaryColor }}>{titleAfter}</span>}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily,
            fontSize: fontSize(FONT_SIZES.heroSubtitle, ratio),
            fontWeight: 400,
            color: COLORS.textSecondary,
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity,
            textAlign: ratio === 'horizontal' ? 'left' : 'center',
            lineHeight: 1.5,
          }}
        >
          {heroSubtitle}
        </div>

        {/* Animated underline */}
        <div
          style={{
            width: interpolate(tagSpring, [0, 1], [0, 120]),
            height: 3,
            background: `linear-gradient(90deg, ${primaryColor}, ${COLORS.emerald})`,
            borderRadius: 2,
            marginTop: 8,
            opacity: tagOpacity,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
