import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT_SIZES, fontSize, type AspectRatioKey } from '../Theme';

interface FeatureSceneProps {
  ratio: AspectRatioKey;
  /** Brand accent color */
  primaryColor: string;
  /** CSS font-family string */
  fontFamily: string;
  /** Array of feature strings (one card per item) */
  features: string[];
  /**
   * Slows all springs by this factor.
   * 1 = original speed, 3 = cinematic.
   */
  animationSlowdown: number;
}

const FEATURE_ICONS = ['📖', '📚', '🎧'];

/**
 * Feature Highlights Scene
 * =========================
 * Three (or more) feature cards fly in with staggered springs.
 * `animationSlowdown` stretches out the timing so the user can
 * preview smooth/slow variants directly in Remotion Studio.
 */
export const FeatureScene: React.FC<FeatureSceneProps> = ({
  ratio,
  primaryColor,
  fontFamily,
  features,
  animationSlowdown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sf = (f: number) => f / animationSlowdown;

  const isHorizontal = ratio === 'horizontal';
  const isVertical   = ratio === 'vertical';

  // Title entrance
  const titleSpring  = spring({ frame: sf(frame), fps, config: { damping: 14, stiffness: 80, mass: 0.8 } });
  const titleY       = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: isHorizontal ? 100 : 60,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isHorizontal ? 50 : 36,
          width: '100%',
          maxWidth: isHorizontal ? 1400 : 800,
        }}
      >
        {/* Section title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: fontSize(FONT_SIZES.heroSubtitle, ratio),
              fontWeight: 600,
              color: primaryColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Why AyatBits?
          </span>
          <span
            style={{
              fontFamily,
              fontSize: fontSize(FONT_SIZES.featureText, ratio) * 1.2,
              fontWeight: 800,
              color: COLORS.white,
              textAlign: 'center',
            }}
          >
            Everything you need to memorize
          </span>
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            gap: isHorizontal ? 28 : 18,
            width: '100%',
          }}
        >
          {features.map((feature, index) => {
            const baseDelay = Math.round(15 * animationSlowdown) + index * Math.round(12 * animationSlowdown);
            const cardSpring = spring({
              frame: sf(Math.max(0, frame - baseDelay)),
              fps,
              config: { damping: 12, stiffness: 120, mass: 0.6 },
            });

            const cardY      = interpolate(cardSpring, [0, 1], [60, 0]);
            const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
            const cardScale  = interpolate(cardSpring, [0, 1], [0.9, 1]);

            // Gentle floating animation
            const float = interpolate(
              Math.sin(frame * 0.04 + index * 2),
              [-1, 1],
              [-4, 4],
            );

            return (
              <div
                key={index}
                style={{
                  flex: isVertical ? undefined : 1,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: isHorizontal ? '36px 28px' : '28px 24px',
                  display: 'flex',
                  flexDirection: isVertical ? 'row' : 'column',
                  alignItems: 'center',
                  gap: isVertical ? 20 : 16,
                  transform: `translateY(${cardY + float}px) scale(${cardScale})`,
                  opacity: cardOpacity,
                  boxShadow: `0 8px 32px ${primaryColor}08`,
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: isHorizontal ? 64 : 52,
                    height: isHorizontal ? 64 : 52,
                    borderRadius: '50%',
                    background: `${primaryColor}15`,
                    border: `1px solid ${primaryColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isHorizontal ? 28 : 22,
                    flexShrink: 0,
                  }}
                >
                  {FEATURE_ICONS[index] ?? '✨'}
                </div>

                <span
                  style={{
                    fontFamily,
                    fontSize: fontSize(FONT_SIZES.body, ratio),
                    fontWeight: 600,
                    color: COLORS.white,
                    textAlign: isVertical ? 'left' : 'center',
                  }}
                >
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
