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

interface CTASceneProps {
  ratio: AspectRatioKey;
  /** Brand accent color */
  primaryColor: string;
  /** CSS font-family string */
  fontFamily: string;
  /** Large headline above the button */
  ctaHeading: string;
  /** Button label text */
  ctaButtonText: string;
  /** URL / domain shown as social proof beneath the button */
  ctaUrl: string;
  /**
   * Slows all springs by this factor.
   * 1 = snappy, 3 = cinematic.
   */
  animationSlowdown: number;
}

/**
 * Call to Action (closing scene)
 * ===============================
 * Logo re-appears, CTA headline, configurable button text,
 * and a URL beneath for social proof.
 */
export const CTAScene: React.FC<CTASceneProps> = ({
  ratio,
  primaryColor,
  fontFamily,
  ctaHeading,
  ctaButtonText,
  ctaUrl,
  animationSlowdown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sf = (f: number) => f / animationSlowdown;

  const isHorizontal = ratio === 'horizontal';

  // Entrance
  const entranceSpring  = spring({ frame: sf(frame), fps, config: { damping: 14, stiffness: 80, mass: 0.8 } });
  const entranceScale   = interpolate(entranceSpring, [0, 1], [0.85, 1]);
  const entranceOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // Logo bounce
  const logoSpring = spring({
    frame: sf(Math.max(0, frame - Math.round(5 * animationSlowdown))),
    fps,
    config: { damping: 10, stiffness: 150, mass: 0.5 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);

  // Button pulse
  const buttonGlow = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.5, 1]);

  // Headline entrance
  const headlineSpring = spring({
    frame: sf(Math.max(0, frame - Math.round(15 * animationSlowdown))),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });

  // Button entrance
  const buttonSpring = spring({
    frame: sf(Math.max(0, frame - Math.round(30 * animationSlowdown))),
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.5 },
  });

  const iconSize = isHorizontal ? 100 : 80;

  // Derive a slightly darker shade of primaryColor for gradient start
  const emeraldDark = COLORS.emeraldDark;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${entranceScale})`,
        opacity: entranceOpacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isHorizontal ? 40 : 28,
          maxWidth: isHorizontal ? 900 : 600,
          textAlign: 'center',
        }}
      >
        {/* App icon */}
        <Img
          src={staticFile('icon-512.png')}
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize * 0.22,
            transform: `scale(${logoScale})`,
            boxShadow: `0 10px 40px ${primaryColor}40`,
          }}
        />

        {/* Headline */}
        <div
          style={{
            opacity: interpolate(headlineSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headlineSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: fontSize(FONT_SIZES.heroTitle, ratio) * 0.85,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            {ctaHeading}
          </div>
          <div
            style={{
              fontFamily,
              fontSize: fontSize(FONT_SIZES.body, ratio),
              color: COLORS.textSecondary,
              lineHeight: 1.6,
            }}
          >
            Make memorization a joy — verse by verse.
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: interpolate(buttonSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(buttonSpring, [0, 1], [20, 0])}px) scale(${interpolate(buttonSpring, [0, 1], [0.9, 1])})`,
            position: 'relative',
          }}
        >
          {/* Glow halo */}
          <div
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: 22,
              background: `${primaryColor}${Math.round(buttonGlow * 30).toString(16).padStart(2, '0')}`,
              filter: 'blur(20px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              background: `linear-gradient(135deg, ${emeraldDark}, ${primaryColor})`,
              borderRadius: 16,
              padding: isHorizontal ? '20px 56px' : '16px 44px',
              boxShadow: `0 8px 32px ${primaryColor}40`,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize: isHorizontal ? 24 : 20,
                fontWeight: 700,
                color: COLORS.white,
                letterSpacing: '0.02em',
              }}
            >
              {ctaButtonText} →
            </span>
          </div>
        </div>

        {/* URL / social proof */}
        <div
          style={{
            fontFamily,
            fontSize: fontSize(FONT_SIZES.caption, ratio),
            color: COLORS.textMuted,
            opacity: interpolate(buttonSpring, [0, 1], [0, 0.7]),
            marginTop: 4,
            letterSpacing: '0.05em',
          }}
        >
          {ctaUrl}
        </div>
      </div>
    </AbsoluteFill>
  );
};
