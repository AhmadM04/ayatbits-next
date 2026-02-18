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
import { COLORS, FONTS, type AspectRatioKey } from '../Theme';

// ── Hardcoded mock data for the Dashboard preview ───────────────
const MOCK_DASHBOARD = {
  userName: 'Aisha',
  currentStreak: 11,
  juzs: [
    { number: 1,  name: 'Alif Lam Mim',    progress: 85, completedPuzzles: 34, totalPuzzles: 40 },
    { number: 2,  name: 'Sayaqul',          progress: 42, completedPuzzles: 10, totalPuzzles: 24 },
    { number: 3,  name: 'Tilkal Rusul',     progress: 15, completedPuzzles:  3, totalPuzzles: 20 },
    { number: 4,  name: 'Lan Tanaloo',      progress:  0, completedPuzzles:  0, totalPuzzles: 22 },
    { number: 5,  name: 'Wal Muhsanat',     progress:  0, completedPuzzles:  0, totalPuzzles: 18 },
    { number: 6,  name: 'La Yuhibbullah',   progress:  0, completedPuzzles:  0, totalPuzzles: 20 },
  ],
};

interface DashboardSceneProps {
  ratio: AspectRatioKey;
}

/**
 * Dashboard Scene
 * ================
 * Renders a phone-mockup replica of the real DashboardContent layout
 * using hardcoded mock data.  The Juz grid progress bars fill in with
 * staggered springs, mirroring the app's framer-motion animations.
 */
export const DashboardScene: React.FC<DashboardSceneProps> = ({ ratio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dashboard = MOCK_DASHBOARD;

  // ── Phone frame entrance ───────────────────────────────────
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1]);
  const phoneOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);

  // ── Responsive sizing ──────────────────────────────────────
  const isHorizontal = ratio === 'horizontal';
  const phoneWidth = isHorizontal ? 420 : 360;
  const phoneHeight = isHorizontal ? 780 : ratio === 'square' ? 680 : 740;
  const borderRadius = 44;
  const bezelWidth = 10;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: isHorizontal ? 80 : 40,
        padding: 40,
      }}
    >
      {/* Title text (outside phone on horizontal) */}
      {isHorizontal && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: 500,
            opacity: interpolate(
              spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 14, stiffness: 80 } }),
              [0, 1],
              [0, 1],
            ),
          }}
        >
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.2,
            }}
          >
            Your{' '}
            <span style={{ color: COLORS.green }}>Progress</span>
            <br />
            Dashboard
          </span>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 20,
              color: COLORS.textSecondary,
              lineHeight: 1.6,
            }}
          >
            Track your Quran memorization journey with real-time progress
            across all 30 Juz.
          </span>
        </div>
      )}

      {/* ── Phone Mockup ────────────────────────────────────── */}
      <div
        style={{
          transform: `scale(${phoneScale})`,
          opacity: phoneOpacity,
        }}
      >
        <div
          style={{
            width: phoneWidth + bezelWidth * 2,
            height: phoneHeight + bezelWidth * 2,
            borderRadius: borderRadius + bezelWidth,
            background: '#1c1c1e',
            padding: bezelWidth,
            boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
            position: 'relative',
          }}
        >
          {/* Dynamic Island notch */}
          <div
            style={{
              position: 'absolute',
              top: bezelWidth + 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 32,
              borderRadius: 20,
              background: '#000',
              zIndex: 10,
            }}
          />

          {/* Screen content */}
          <div
            style={{
              width: phoneWidth,
              height: phoneHeight,
              borderRadius,
              overflow: 'hidden',
              background: COLORS.bgDark,
              position: 'relative',
            }}
          >
            {/* ── Header bar ─────────────────────────────────── */}
            <div
              style={{
                padding: '52px 16px 10px',
                background: `${COLORS.bgDark}F0`,
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${COLORS.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Img
                src={staticFile('ayatbits-logo.svg')}
                style={{ height: 26, width: 'auto' }}
              />
              {/* Streak badge (real dashboard element) */}
              {dashboard.currentStreak > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: `${COLORS.orange}15`,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.orange,
                    }}
                  >
                    {dashboard.currentStreak}
                  </span>
                </div>
              )}
            </div>

            {/* ── Welcome section ────────────────────────────── */}
            <div style={{ padding: '16px 16px 8px' }}>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 16,
                  fontWeight: 700,
                  color: COLORS.white,
                  marginBottom: 4,
                }}
              >
                Welcome back, {dashboard.userName}! 👋
              </div>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 12,
                  color: COLORS.textMuted,
                }}
              >
                Continue your Quran journey
              </div>
            </div>

            {/* ── Juz grid ───────────────────────────────────── */}
            <div style={{ padding: '8px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 14 }}>📖</span>
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.white,
                  }}
                >
                  Select a Juz
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {dashboard.juzs.map((juz, index) => {
                  // Staggered entrance (like real dashboard with framer-motion)
                  const juzDelay = 15 + index * 4;
                  const juzSpring = spring({
                    frame: Math.max(0, frame - juzDelay),
                    fps,
                    config: { damping: 14, stiffness: 100, mass: 0.5 },
                  });
                  const juzY = interpolate(juzSpring, [0, 1], [20, 0]);
                  const juzOpacity = interpolate(juzSpring, [0, 1], [0, 1]);

                  // Progress bar fills (delayed more)
                  const progressDelay = 30 + index * 5;
                  const progressSpring = spring({
                    frame: Math.max(0, frame - progressDelay),
                    fps,
                    config: { damping: 20, stiffness: 60, mass: 0.8 },
                  });
                  const progressWidth = interpolate(progressSpring, [0, 1], [0, juz.progress]);

                  const isCompleted = juz.progress >= 100;

                  return (
                    <div
                      key={juz.number}
                      style={{
                        background: `${COLORS.white}02`,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 16,
                        padding: 14,
                        textAlign: 'center',
                        transform: `translateY(${juzY}px)`,
                        opacity: juzOpacity,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Completed sparkle */}
                      {isCompleted && juzOpacity > 0.9 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            fontSize: 18,
                          }}
                        >
                          ✨
                        </span>
                      )}

                      <div
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 18,
                          fontWeight: 700,
                          color: COLORS.emeraldDark,
                          marginBottom: 4,
                        }}
                      >
                        {juz.number}
                      </div>
                      <div
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 9,
                          color: COLORS.textMuted,
                          marginBottom: 8,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {juz.name}
                      </div>

                      {/* Progress bar (matches real dashboard) */}
                      <div
                        style={{
                          width: '100%',
                          height: 6,
                          background: `${COLORS.white}05`,
                          borderRadius: 3,
                          overflow: 'hidden',
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${progressWidth}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${COLORS.emeraldDark}, ${COLORS.emerald})`,
                            borderRadius: 3,
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 9,
                          color: COLORS.textMuted,
                        }}
                      >
                        {juz.completedPuzzles}/{juz.totalPuzzles}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Bottom Nav bar ──────────────────────────────── */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 64,
                background: `${COLORS.bgDark}F5`,
                backdropFilter: 'blur(10px)',
                borderTop: `1px solid ${COLORS.border}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0 20px',
              }}
            >
              {['🏠', '🔍', '🏆', '👤'].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    opacity: i === 0 ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div
                    style={{
                      width: i === 0 ? 4 : 0,
                      height: 4,
                      borderRadius: 2,
                      background: COLORS.emeraldDark,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

