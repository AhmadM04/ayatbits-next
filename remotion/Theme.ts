/**
 * AyatBits Remotion Theme
 * ========================
 * "Modern Spiritual" aesthetic — forest greens, soft gradients,
 * clean typography. Colors pulled from globals.css & manifest.json.
 */

// ─── Brand Colors (from globals.css & app branding) ───────────
export const COLORS = {
  green: '#16a34a',
  greenDark: '#15803d',
  greenLight: '#22c55e',
  emerald: '#10b981',
  emeraldDark: '#059669',
  neonGreen: '#4ade80',

  bgDark: '#0a0a0a',
  surface: '#1a1a1a',
  border: '#262626',

  white: '#ffffff',
  textPrimary: '#fafafa',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  gold: '#f59e0b',
  orange: '#f97316',
  red: '#ef4444',
  blue: '#3b82f6',

  // Harakat colors (from harakat-utils.ts)
  harakatRed: '#f87171',
  harakatBlue: '#60a5fa',
  harakatGreen: '#4ade80',
  harakatGray: '#a1a1aa',
} as const;

// ─── Gradients ─────────────────────────────────────────────────
export const GRADIENTS = {
  heroBackground: `linear-gradient(135deg, ${COLORS.greenDark} 0%, ${COLORS.bgDark} 50%, ${COLORS.surface} 100%)`,
  cardOverlay: `linear-gradient(180deg, rgba(22,163,74,0.15) 0%, rgba(10,10,10,0.95) 100%)`,
  greenGlow: `radial-gradient(ellipse at center, ${COLORS.greenLight}33 0%, transparent 70%)`,
  fireGradient: `linear-gradient(180deg, ${COLORS.gold} 0%, ${COLORS.orange} 50%, ${COLORS.red} 100%)`,
  shimmer: `linear-gradient(90deg, transparent 0%, ${COLORS.greenLight}15 50%, transparent 100%)`,
} as const;

// ─── Fonts ─────────────────────────────────────────────────────
export const FONTS = {
  sans: "'Inter', 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  arabic: "'Amiri Quran', 'Scheherazade New', 'Traditional Arabic', serif",
  mono: "'Geist Mono', 'SF Mono', Monaco, monospace",
} as const;

// ─── Aspect Ratios ─────────────────────────────────────────────
export type AspectRatioKey = 'vertical' | 'square' | 'horizontal';

export interface CanvasSize {
  width: number;
  height: number;
  key: AspectRatioKey;
  label: string;
}

export const CANVAS_SIZES: Record<AspectRatioKey, CanvasSize> = {
  vertical: { width: 1080, height: 1920, key: 'vertical', label: 'TikTok / Reels (9:16)' },
  square: { width: 1080, height: 1350, key: 'square', label: 'Instagram (4:3)' },
  horizontal: { width: 1920, height: 1080, key: 'horizontal', label: 'YouTube (16:9)' },
} as const;

/** Responsive font size helper */
export function fontSize(
  sizeMap: Record<AspectRatioKey, number>,
  ratio: AspectRatioKey,
): number {
  return sizeMap[ratio];
}

/** Common font size maps */
export const FONT_SIZES = {
  heroTitle: { vertical: 64, square: 56, horizontal: 72 },
  heroSubtitle: { vertical: 24, square: 22, horizontal: 28 },
  arabicVerse: { vertical: 44, square: 38, horizontal: 50 },
  featureText: { vertical: 32, square: 28, horizontal: 36 },
  body: { vertical: 20, square: 18, horizontal: 22 },
  caption: { vertical: 16, square: 14, horizontal: 18 },
  streakNumber: { vertical: 96, square: 80, horizontal: 112 },
} as const;

// ─── Video Config (swappable content) ─────────────────────────
export interface VideoConfig {
  surahNameArabic: string;
  surahNameEnglish: string;
  /** Full Arabic verse text (will be tokenized by real puzzle-logic) */
  verseArabic: string;
  verseTranslation: string;
  /** Streak counter range */
  streakFrom: number;
  streakTo: number;
  dailyAchievementText: string;
  /** Feature bullets */
  features: string[];
  /** Mock dashboard data */
  dashboard: {
    userName: string;
    currentStreak: number;
    completedPuzzles: number;
    juzsExplored: number;
    juzs: Array<{
      number: number;
      name: string;
      progress: number;
      completedPuzzles: number;
      totalPuzzles: number;
    }>;
  };
}

export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
  surahNameArabic: 'الفاتحة',
  surahNameEnglish: 'Al-Fatiha',
  verseArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  verseTranslation: 'In the name of Allah, the Most Gracious, the Most Merciful',
  streakFrom: 10,
  streakTo: 11,
  dailyAchievementText: 'Daily Achievement Unlocked!',
  features: ['6,236 Verses', 'Built-in Tafsir', 'Audio Accompaniment'],
  dashboard: {
    userName: 'Aisha',
    currentStreak: 11,
    completedPuzzles: 47,
    juzsExplored: 3,
    juzs: [
      { number: 1, name: 'Alif Lam Mim', progress: 85, completedPuzzles: 34, totalPuzzles: 40 },
      { number: 2, name: 'Sayaqul', progress: 42, completedPuzzles: 10, totalPuzzles: 24 },
      { number: 3, name: 'Tilkal Rusul', progress: 15, completedPuzzles: 3, totalPuzzles: 20 },
      { number: 4, name: 'Lan Tanaloo', progress: 0, completedPuzzles: 0, totalPuzzles: 22 },
      { number: 5, name: 'Wal Muhsanat', progress: 0, completedPuzzles: 0, totalPuzzles: 18 },
      { number: 6, name: 'La Yuhibbullah', progress: 0, completedPuzzles: 0, totalPuzzles: 20 },
    ],
  },
};
