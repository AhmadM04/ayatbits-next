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

// ── Production-accurate mock data ────────────────────────────────
const MOCK_JUZS: Array<{
  number: number;
  completed: number;
  total: number;
  progress: number;
}> = [
  { number: 1, completed: 10, total: 148, progress: 7 },
  { number: 2, completed: 0,  total: 111, progress: 0 },
  { number: 3, completed: 1,  total: 126, progress: 1 },
  { number: 4, completed: 0,  total: 131, progress: 0 },
  { number: 5, completed: 0,  total: 106, progress: 0 },
  { number: 6, completed: 0,  total: 110, progress: 0 },
];

const MOCK_USER = {
  firstName: 'Ahmad',
};

interface DashboardSceneProps {
  ratio: AspectRatioKey;
}

// ─────────────────────────────────────────────────────────────────
// SVG Icons matching production Lucide icons
// ─────────────────────────────────────────────────────────────────
const BookOpenIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = COLORS.emeraldDark,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const HomeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const HeartIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.685-4.5 1.757A5.987 5.987 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const PlayIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const TrophyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const UserIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);

const MenuIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// JuzCard — exact match to production dark mode styling
// ─────────────────────────────────────────────────────────────────
const JuzCard: React.FC<{
  juz: (typeof MOCK_JUZS)[number];
  index: number;
  frame: number;
  fps: number;
  isActive: boolean;
}> = ({ juz, index, frame, fps, isActive }) => {
  const entranceDelay = 15 + index * 5;
  const entranceSpring = spring({
    frame: Math.max(0, frame - entranceDelay),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.5 },
  });
  const cardY = interpolate(entranceSpring, [0, 1], [30, 0]);
  const cardOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // Progress bar fill animation
  const progressDelay = entranceDelay + 8;
  const progressSpring = spring({
    frame: Math.max(0, frame - progressDelay),
    fps,
    config: { damping: 20, stiffness: 60, mass: 0.8 },
  });
  const safeProgress = Math.max(0, Math.min(100, juz.progress));
  const progressWidth = interpolate(progressSpring, [0, 1], [0, safeProgress]);

  return (
    <div
      style={{
        transform: `translateY(${cardY}px)`,
        opacity: cardOpacity,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.02)',
          border: isActive
            ? '1.5px solid rgba(5,150,105,0.5)'
            : '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: '16px 12px',
          overflow: 'hidden',
          boxShadow: isActive
            ? '0 0 12px rgba(5,150,105,0.15)'
            : '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 0 }}>
          {/* Juz Number */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: FONTS.sans,
              color: COLORS.emeraldDark,
              marginBottom: 2,
            }}
          >
            {juz.number}
          </div>

          {/* Juz label */}
          <div
            style={{
              fontSize: 11,
              fontFamily: FONTS.sans,
              color: '#6b7280',
              marginBottom: 8,
            }}
          >
            Juz {juz.number}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 9999,
              height: 5,
              marginBottom: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressWidth}%`,
                height: '100%',
                background: isActive
                  ? `linear-gradient(90deg, ${COLORS.emeraldDark}, ${COLORS.emerald})`
                  : `linear-gradient(90deg, ${COLORS.emeraldDark}, ${COLORS.emerald})`,
                borderRadius: 9999,
                minWidth: safeProgress > 0 ? 4 : 0,
              }}
            />
          </div>

          {/* Completed count */}
          <div
            style={{
              fontSize: 10,
              fontFamily: FONTS.sans,
              color: '#4b5563',
            }}
          >
            {juz.completed}/{juz.total}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// BottomNav — exact production match with SVG icons
// ─────────────────────────────────────────────────────────────────
const BottomNav: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const navSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.5 },
  });
  const navY = interpolate(navSpring, [0, 1], [72, 0]);

  const items: Array<{
    label: string;
    icon: React.ReactNode;
    active: boolean;
    isCenter?: boolean;
    subtitle?: string;
  }> = [
    {
      label: 'Home',
      icon: <HomeIcon size={20} color={COLORS.emeraldDark} />,
      active: true,
    },
    {
      label: 'Liked',
      icon: <HeartIcon size={20} color="#6b7280" />,
      active: false,
    },
    {
      label: 'Al-Fatihah',
      icon: <PlayIcon size={18} color={COLORS.white} />,
      active: false,
      isCenter: true,
    },
    {
      label: 'Awards',
      icon: <TrophyIcon size={20} color="#6b7280" />,
      active: false,
    },
    {
      label: 'Profile',
      icon: <UserIcon size={20} color="#6b7280" />,
      active: false,
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'rgba(10,10,10,0.98)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: 8,
        transform: `translateY(${navY}px)`,
      }}
    >
      {items.map((item, i) => {
        if (item.isCenter) {
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: -20,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: COLORS.emeraldDark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${COLORS.emeraldDark}4D`,
                }}
              >
                {item.icon}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: FONTS.sans,
                  color: '#6b7280',
                  marginTop: 4,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '4px 6px',
            }}
          >
            {item.icon}
            <span
              style={{
                fontSize: 9,
                fontFamily: FONTS.sans,
                fontWeight: item.active ? 600 : 400,
                color: item.active ? COLORS.emeraldDark : '#6b7280',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MushafFAB — the green "Read Mushaf" floating action button
// ─────────────────────────────────────────────────────────────────
const MushafFAB: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fabSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });
  const fabScale = interpolate(fabSpring, [0, 1], [0.6, 1]);
  const fabOpacity = interpolate(fabSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 90,
        right: 16,
        zIndex: 20,
        transform: `scale(${fabScale})`,
        opacity: fabOpacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: COLORS.emeraldDark,
          borderRadius: 50,
          padding: '10px 18px',
          boxShadow: `0 4px 20px ${COLORS.emeraldDark}60`,
        }}
      >
        <BookOpenIcon size={18} color={COLORS.white} />
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.white,
          }}
        >
          Read Mushaf
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// DashboardScene — Phone Mockup matching production dark mode
// ─────────────────────────────────────────────────────────────────
export const DashboardScene: React.FC<DashboardSceneProps> = ({ ratio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone frame entrance
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1]);
  const phoneOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);

  // Responsive sizing
  const isHorizontal = ratio === 'horizontal';
  const phoneWidth = isHorizontal ? 380 : 340;
  const phoneHeight = isHorizontal ? 760 : 720;
  const borderRadius = 44;
  const bezelWidth = 8;

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
      {/* Title text (horizontal layout) */}
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
            <span style={{ color: COLORS.emeraldDark }}>Progress</span>
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

      {/* Phone Mockup */}
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
            boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            position: 'relative',
          }}
        >
          {/* Dynamic Island */}
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
            {/* Header */}
            <div
              style={{
                padding: '52px 16px 10px',
                background: COLORS.bgDark,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.emeraldDark,
                }}
              >
                AyatBits
              </span>
              <MenuIcon size={22} color="#6b7280" />
            </div>

            {/* Welcome section */}
            <div style={{ padding: '16px 16px 8px' }}>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.white,
                  marginBottom: 4,
                }}
              >
                Welcome back, {MOCK_USER.firstName}!
              </div>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}
              >
                Continue your journey of memorizing and understanding the
                Quran
              </div>
            </div>

            {/* Verse of the Day Card - abbreviated */}
            <div style={{ padding: '12px 16px' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  padding: 16,
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: COLORS.emeraldDark }}>✦</span>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.emeraldDark,
                    }}
                  >
                    Verse of the Day
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONTS.arabic,
                    fontSize: 22,
                    color: COLORS.white,
                    textAlign: 'right',
                    direction: 'rtl',
                    lineHeight: 2,
                    marginBottom: 8,
                  }}
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              </div>
            </div>

            {/* Select a Juz heading */}
            <div style={{ padding: '4px 16px 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <BookOpenIcon size={18} color={COLORS.emeraldDark} />
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.white,
                  }}
                >
                  Select a Juz to begin
                </span>
              </div>

              {/* Juz Grid — exact 3-column layout */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {MOCK_JUZS.map((juz, index) => (
                  <JuzCard
                    key={juz.number}
                    juz={juz}
                    index={index}
                    frame={frame}
                    fps={fps}
                    isActive={juz.number === 1}
                  />
                ))}
              </div>
            </div>

            {/* Mushaf FAB */}
            <MushafFAB frame={frame} fps={fps} />

            {/* Bottom Nav */}
            <BottomNav frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default DashboardScene;
