import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONT_SIZES, fontSize, type AspectRatioKey } from '../Theme';

interface StreakSceneProps {
  ratio: AspectRatioKey;
  /** Brand accent color */
  primaryColor: string;
  /** CSS font-family string */
  fontFamily: string;
  /** Target streak number displayed large on-screen */
  streakNumber: number;
  /** Starting number for the count-up animation */
  streakFrom: number;
  /** Label text beneath the counter (e.g. "Day Streak") */
  streakLabel: string;
  /** Toggle the 🔥 fire row and sparkle particles */
  showFireEffect: boolean;
  /** Header text above the counter card */
  dailyAchievementText: string;
  /** Stat badge – completed puzzles */
  completedPuzzles: number;
  /** Stat badge – juz explored */
  juzsExplored: number;
  /**
   * Slows all springs by this factor.
   * 1 = snappy, 3 = cinematic.
   */
  animationSlowdown: number;
}

/**
 * Streak Counter Scene
 * =====================
 * Counts from `streakFrom` → `streakNumber` with a spring,
 * shows sparkle particles and a pulsing orange glow.
 * Fire effect can be toggled via `showFireEffect`.
 */
export const StreakScene: React.FC<StreakSceneProps> = ({
  ratio,
  primaryColor,
  fontFamily,
  streakNumber,
  streakFrom,
  streakLabel,
  showFireEffect,
  dailyAchievementText,
  completedPuzzles,
  juzsExplored,
  animationSlowdown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sf = (f: number) => f / animationSlowdown;

  // ── Entrance ───────────────────────────────────────────────
  const entrance      = spring({ frame: sf(frame), fps, config: { damping: 14, stiffness: 80, mass: 0.8 } });
  const entranceScale   = interpolate(entrance, [0, 1], [0.7, 1]);
  const entranceOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // ── Counter count-up ───────────────────────────────────────
  const countStart  = Math.round(20 * animationSlowdown);
  const countSpring = spring({
    frame: sf(Math.max(0, frame - countStart)),
    fps,
    config: { damping: 18, stiffness: 60, mass: 1 },
  });
  const displayedStreak = interpolate(countSpring, [0, 1], [streakFrom, streakNumber]);

  // ── Glow pulse ─────────────────────────────────────────────
  const glowIntensity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // ── Achievement text entrance ──────────────────────────────
  const achieveDelay  = Math.round(40 * animationSlowdown);
  const achieveSpring = spring({
    frame: sf(Math.max(0, frame - achieveDelay)),
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
  });
  const achieveY       = interpolate(achieveSpring, [0, 1], [30, 0]);
  const achieveOpacity = interpolate(achieveSpring, [0, 1], [0, 1]);

  // ── Fire number glow ───────────────────────────────────────
  const fireGlow = interpolate(Math.sin(frame * 0.12 + 1), [-1, 1], [0.6, 1]);

  const streakFontSize = fontSize(FONT_SIZES.streakNumber, ratio);
  const isHorizontal   = ratio === 'horizontal';

  // ── Sparkle particles (only when showFireEffect is true) ───
  const particles = React.useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => ({
      angle:  (360 / count) * i,
      speed:  0.8 + (i * 0.03),   // deterministic, no Math.random
      size:   6 + (i % 5) * 2,
      delay:  (i % 4) * 4,
      emoji:  (['✨', '⭐', '🔥', '💫'] as const)[i % 4],
    }));
  }, []);

  const particlesVisible = showFireEffect && frame > countStart + 10;

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
          gap: isHorizontal ? 40 : 30,
        }}
      >
        {/* Achievement header */}
        <div
          style={{
            fontFamily,
            fontSize: fontSize(FONT_SIZES.featureText, ratio),
            fontWeight: 600,
            color: COLORS.textSecondary,
            transform: `translateY(${achieveY}px)`,
            opacity: achieveOpacity,
            textAlign: 'center',
          }}
        >
          {dailyAchievementText}
        </div>

        {/* Counter card */}
        <div style={{ position: 'relative' }}>
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: isHorizontal ? 350 : 280,
              height: isHorizontal ? 350 : 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${COLORS.orange}${Math.round(glowIntensity * 40)
                .toString(16)
                .padStart(2, '0')} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(30px)',
            }}
          />

          <div
            style={{
              position: 'relative',
              background: COLORS.surface,
              border: `2px solid ${COLORS.orange}50`,
              borderRadius: 28,
              padding: isHorizontal ? '48px 72px' : '36px 56px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: `0 0 60px ${COLORS.orange}20, inset 0 0 30px ${COLORS.orange}08`,
            }}
          >
            {/* Sparkle particles */}
            {particlesVisible &&
              particles.map((p, i) => {
                const pFrame  = Math.max(0, frame - countStart - 10 - p.delay);
                const dist    = pFrame * p.speed * 2;
                const rad     = (p.angle * Math.PI) / 180;
                const px      = Math.cos(rad) * dist;
                const py      = Math.sin(rad) * dist;
                const pOpacity = interpolate(dist, [0, 50, 120], [0, 1, 0], { extrapolateRight: 'clamp' });

                return (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
                      fontSize: p.size,
                      opacity: pOpacity,
                      pointerEvents: 'none',
                    }}
                  >
                    {p.emoji}
                  </span>
                );
              })}

            {/* Number + label */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span
                style={{
                  fontFamily,
                  fontSize: streakFontSize,
                  fontWeight: 900,
                  color: COLORS.orange,
                  lineHeight: 1,
                  opacity: fireGlow,
                  textShadow: `0 0 40px ${COLORS.orange}60`,
                }}
              >
                {Math.round(displayedStreak)}
              </span>
              <span
                style={{
                  fontFamily,
                  fontSize: streakFontSize * 0.35,
                  fontWeight: 600,
                  color: COLORS.textSecondary,
                }}
              >
                {streakLabel}
              </span>
            </div>

            {/* Fire row (optional) */}
            {showFireEffect && (
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {(['🔥', '🔥', '🔥'] as const).map((e, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: isHorizontal ? 28 : 22,
                      opacity: interpolate(Math.sin(frame * 0.1 + i * 2), [-1, 1], [0.6, 1]),
                      transform: `translateY(${interpolate(
                        Math.sin(frame * 0.15 + i),
                        [-1, 1],
                        [3, -3],
                      )}px)`,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stat badges */}
        <div
          style={{
            display: 'flex',
            gap: isHorizontal ? 40 : 24,
            opacity: achieveOpacity,
            transform: `translateY(${achieveY}px)`,
          }}
        >
          {[
            { label: 'Puzzles',      value: completedPuzzles },
            { label: 'Juz Explored', value: juzsExplored     },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: isHorizontal ? '16px 32px' : '12px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily,
                  fontSize: isHorizontal ? 28 : 22,
                  fontWeight: 700,
                  color: primaryColor,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: isHorizontal ? 14 : 11,
                  color: COLORS.textMuted,
                  marginTop: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
