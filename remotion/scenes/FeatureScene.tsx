import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS, type AspectRatioKey } from '../Theme';

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────
interface FeatureSceneProps {
  ratio: AspectRatioKey;
  primaryColor: string;
  fontFamily: string;
  features: string[];
  animationSlowdown: number;
}

// ─────────────────────────────────────────────────────────────────
// SVG Icons (matching production Lucide icons)
// ─────────────────────────────────────────────────────────────────
const MenuIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#6b7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const GlobeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#6b7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#6b7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#4ade80' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#6b7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const AlertCircleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : '#6b7280'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.685-4.5 1.757A5.987 5.987 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const PlayIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#6b7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// SVG Cursor — simulated mouse pointer
// ─────────────────────────────────────────────────────────────────
const Cursor: React.FC<{
  x: number;
  y: number;
  pressing: boolean;
  opacity: number;
}> = ({ x, y, pressing, opacity }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      zIndex: 200,
      pointerEvents: 'none',
      opacity,
      transform: `scale(${pressing ? 0.88 : 1})`,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
      willChange: 'transform, left, top',
    }}
  >
    <svg width="28" height="34" viewBox="0 0 24 30" fill="none">
      <path
        d="M5.5 1.5L5.5 22.5L10.5 17.5L15.5 24.5L19.5 22.5L14.5 15.5L21.5 15.5L5.5 1.5Z"
        fill={COLORS.white}
        stroke="#333"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Translation list (exact match to production TafseerButtons.tsx)
// ─────────────────────────────────────────────────────────────────
const TRANSLATIONS = [
  { code: 'en.sahih', name: 'Sahih International' },
  { code: 'en.pickthall', name: 'Pickthall' },
  { code: 'en.yusufali', name: 'Yusuf Ali' },
  { code: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn' },
  { code: 'ar.tafseer', name: 'Tafsir Al-Muyassar' },
  { code: 'fr.hamidullah', name: 'Hamidullah (French)' },
  { code: 'es.cortes', name: 'Cortes (Spanish)' },
  { code: 'de.bubenheim', name: 'Bubenheim (German)' },
  { code: 'tr.yazir', name: 'Yazır (Turkish)' },
  { code: 'ur.maududi', name: 'Maududi (Urdu)' },
  { code: 'id.muntakhab', name: 'Muntakhab (Indonesian)' },
  { code: 'ms.basmeih', name: 'Basmeih (Malay)' },
  { code: 'bn.hoque', name: 'Hoque (Bengali)' },
  { code: 'hi.hindi', name: 'Hindi' },
  { code: 'ru.kuliev', name: 'Kuliev (Russian)' },
  { code: 'zh.chinese', name: 'Chinese' },
  { code: 'ja.japanese', name: 'Japanese' },
  { code: 'nl.dutch', name: 'Dutch' },
];

// ─────────────────────────────────────────────────────────────────
// Easing curves
// ─────────────────────────────────────────────────────────────────
const EASE_MOVE = Easing.bezier(0.25, 0.1, 0.25, 1.0);

// ─────────────────────────────────────────────────────────────────
// Mock Tafsir content (matches production AI tafsir response format)
// ─────────────────────────────────────────────────────────────────
const MOCK_AI_TAFSIR = `**Arabic Text:**
بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ

**Translation:**
In the name of Allah, the Most Gracious, the Most Merciful

**Explanation:**
This is the opening verse (Basmala) that appears at the beginning of every Surah in the Quran except Surah At-Tawbah. It is a declaration of beginning in the name of Allah, acknowledging His attributes of mercy.

The phrase contains three of Allah's names:
• **Allah** — The proper name of God
• **Ar-Rahman** — The Most Gracious (encompassing mercy)
• **Ar-Raheem** — The Most Merciful (specific mercy)

Muslims recite this before starting any significant action, seeking Allah's blessings and guidance.`;

/**
 * Features Scene — Translation & AI Tafsir Showcase
 * ===================================================
 * Showcases the app's multi-language translation switching and
 * AI Tafsir Pro feature through animated cursor interactions
 * on a production-accurate phone mockup.
 *
 * Part A: Opens burger menu → clicks "Translation" → selects Kuliev (Russian)
 * Part B: Opens burger menu again → clicks "AI Tafsir PRO" → shows modal
 *
 * All timings are scaled by `animationSlowdown`.
 */
export const FeatureScene: React.FC<FeatureSceneProps> = ({
  ratio,
  primaryColor,
  fontFamily,
  features: _features,
  animationSlowdown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = animationSlowdown;
  const sf = (f: number) => f / s;

  const isHorizontal = ratio === 'horizontal';
  const phoneWidth = isHorizontal ? 380 : 340;
  const phoneHeight = isHorizontal ? 760 : 720;
  const borderRadius = 44;
  const bezelWidth = 8;

  // ── Phase timing (scaled by animationSlowdown) ─────────────
  const t = (base: number) => Math.round(base * s);

  const PHASE_CURSOR_TO_MENU = t(25);
  const PHASE_MENU_OPEN = t(42);
  const PHASE_CLICK_TRANSLATION = t(56);
  const PHASE_TRANSLATION_MODAL = t(68);
  const PHASE_SELECT_KULIEV = t(95);
  const PHASE_MODAL_CLOSE = t(118);
  const PHASE_CARD_UPDATE = t(128);
  const PHASE_CURSOR_TO_MENU2 = t(148);
  const PHASE_MENU_OPEN2 = t(166);
  const PHASE_CLICK_AI_TAFSIR = t(182);
  const PHASE_AI_MODAL = t(198);

  // ── Phone frame entrance ───────────────────────────────────
  const phoneSpring = spring({
    frame: sf(frame),
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1]);
  const phoneOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);

  // ── State flags based on frame ──────────────────────────────
  const showMenu1 = frame >= PHASE_MENU_OPEN && frame < PHASE_TRANSLATION_MODAL;
  const showTranslationModal = frame >= PHASE_TRANSLATION_MODAL && frame < PHASE_MODAL_CLOSE;
  const showUpdatedTranslation = frame >= PHASE_CARD_UPDATE;
  const showMenu2 = frame >= PHASE_MENU_OPEN2 && frame < PHASE_AI_MODAL;
  const showAiTafsirModal = frame >= PHASE_AI_MODAL;

  // ── Menu animation ──────────────────────────────────────────
  const menu1Spring = spring({
    frame: sf(Math.max(0, frame - PHASE_MENU_OPEN)),
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.4 },
  });
  const menu2Spring = spring({
    frame: sf(Math.max(0, frame - PHASE_MENU_OPEN2)),
    fps,
    config: { damping: 15, stiffness: 200, mass: 0.4 },
  });

  // ── Translation modal animation ────────────────────────────
  const translationModalSpring = spring({
    frame: sf(Math.max(0, frame - PHASE_TRANSLATION_MODAL)),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });
  const translationModalY = interpolate(translationModalSpring, [0, 1], [300, 0]);
  const translationModalOpacity = interpolate(translationModalSpring, [0, 1], [0, 1]);

  // Modal close animation
  const modalCloseProgress = frame >= PHASE_MODAL_CLOSE
    ? interpolate(frame, [PHASE_MODAL_CLOSE, PHASE_MODAL_CLOSE + t(10)], [0, 1], { extrapolateRight: 'clamp' })
    : 0;

  // ── AI Tafsir modal animation ──────────────────────────────
  const aiModalSpring = spring({
    frame: sf(Math.max(0, frame - PHASE_AI_MODAL)),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.6 },
  });
  const aiModalY = interpolate(aiModalSpring, [0, 1], [400, 0]);
  const aiModalOpacity = interpolate(aiModalSpring, [0, 1], [0, 1]);

  // ── Cursor position ────────────────────────────────────────
  const MENU_BTN_POS = { x: phoneWidth - 36, y: 72 };
  const TRANSLATION_ITEM_POS = { x: phoneWidth / 2, y: 158 };
  const KULIEV_POS = { x: phoneWidth / 2, y: phoneHeight - 230 };
  const AI_TAFSIR_ITEM_POS = { x: phoneWidth / 2, y: 245 };
  const REST_POS = { x: phoneWidth / 2, y: phoneHeight * 0.45 };

  let cursorX = REST_POS.x;
  let cursorY = REST_POS.y;
  let cursorPressing = false;
  let cursorOpacity = 0;

  // Part A: Translation flow
  if (frame >= PHASE_CURSOR_TO_MENU && frame < PHASE_TRANSLATION_MODAL) {
    cursorOpacity = 1;
    if (frame < PHASE_MENU_OPEN) {
      const progress = EASE_MOVE(interpolate(frame, [PHASE_CURSOR_TO_MENU, PHASE_MENU_OPEN], [0, 1], { extrapolateRight: 'clamp' }));
      cursorX = interpolate(progress, [0, 1], [REST_POS.x, MENU_BTN_POS.x]);
      cursorY = interpolate(progress, [0, 1], [REST_POS.y, MENU_BTN_POS.y]);
      cursorPressing = frame > PHASE_MENU_OPEN - t(4);
    } else if (frame < PHASE_CLICK_TRANSLATION) {
      const progress = EASE_MOVE(interpolate(frame, [PHASE_MENU_OPEN + t(5), PHASE_CLICK_TRANSLATION], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
      cursorX = interpolate(progress, [0, 1], [MENU_BTN_POS.x, TRANSLATION_ITEM_POS.x]);
      cursorY = interpolate(progress, [0, 1], [MENU_BTN_POS.y, TRANSLATION_ITEM_POS.y]);
      cursorPressing = frame > PHASE_CLICK_TRANSLATION - t(3);
    } else {
      cursorX = TRANSLATION_ITEM_POS.x;
      cursorY = TRANSLATION_ITEM_POS.y;
      cursorPressing = true;
    }
  } else if (frame >= PHASE_TRANSLATION_MODAL && frame < PHASE_MODAL_CLOSE) {
    cursorOpacity = 1;
    if (frame < PHASE_SELECT_KULIEV) {
      const progress = EASE_MOVE(interpolate(frame, [PHASE_TRANSLATION_MODAL + t(5), PHASE_SELECT_KULIEV], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
      cursorX = interpolate(progress, [0, 1], [TRANSLATION_ITEM_POS.x, KULIEV_POS.x]);
      cursorY = interpolate(progress, [0, 1], [phoneHeight * 0.42, KULIEV_POS.y]);
    } else {
      cursorX = KULIEV_POS.x;
      cursorY = KULIEV_POS.y;
      cursorPressing = frame < PHASE_SELECT_KULIEV + t(5);
    }
  }
  // Part B: AI Tafsir flow
  else if (frame >= PHASE_CURSOR_TO_MENU2 && frame < PHASE_AI_MODAL) {
    cursorOpacity = 1;
    if (frame < PHASE_MENU_OPEN2) {
      const progress = EASE_MOVE(interpolate(frame, [PHASE_CURSOR_TO_MENU2, PHASE_MENU_OPEN2], [0, 1], { extrapolateRight: 'clamp' }));
      cursorX = interpolate(progress, [0, 1], [REST_POS.x, MENU_BTN_POS.x]);
      cursorY = interpolate(progress, [0, 1], [REST_POS.y, MENU_BTN_POS.y]);
      cursorPressing = frame > PHASE_MENU_OPEN2 - t(4);
    } else if (frame < PHASE_CLICK_AI_TAFSIR) {
      const progress = EASE_MOVE(interpolate(frame, [PHASE_MENU_OPEN2 + t(5), PHASE_CLICK_AI_TAFSIR], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
      cursorX = interpolate(progress, [0, 1], [MENU_BTN_POS.x, AI_TAFSIR_ITEM_POS.x]);
      cursorY = interpolate(progress, [0, 1], [MENU_BTN_POS.y, AI_TAFSIR_ITEM_POS.y]);
      cursorPressing = frame > PHASE_CLICK_AI_TAFSIR - t(3);
    } else {
      cursorX = AI_TAFSIR_ITEM_POS.x;
      cursorY = AI_TAFSIR_ITEM_POS.y;
      cursorPressing = true;
    }
  } else if (showAiTafsirModal) {
    cursorOpacity = interpolate(frame, [PHASE_AI_MODAL, PHASE_AI_MODAL + t(15)], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    cursorX = AI_TAFSIR_ITEM_POS.x;
    cursorY = AI_TAFSIR_ITEM_POS.y;
  }

  // ── Backdrop opacity ────────────────────────────────────────
  const backdropOpacity = showTranslationModal
    ? interpolate(translationModalSpring, [0, 1], [0, 0.6]) * (1 - modalCloseProgress)
    : showAiTafsirModal
    ? interpolate(aiModalSpring, [0, 1], [0, 0.6])
    : 0;

  // ── Translation modal scroll offset ─────────────────────────
  const translationScrollOffset = showTranslationModal
    ? interpolate(
        frame,
        [PHASE_TRANSLATION_MODAL + t(10), PHASE_SELECT_KULIEV - t(5)],
        [0, 320],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      )
    : 0;

  const kulievIndex = TRANSLATIONS.findIndex(tr => tr.code === 'ru.kuliev');
  const isKulievSelected = frame >= PHASE_SELECT_KULIEV;

  // ── AI Tafsir content reveal ────────────────────────────────
  const aiContentReveal = showAiTafsirModal
    ? interpolate(
        frame,
        [PHASE_AI_MODAL + t(18), PHASE_AI_MODAL + t(55)],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      )
    : 0;

  const visibleTafsirChars = Math.floor(aiContentReveal * MOCK_AI_TAFSIR.length);

  // ── Translation card update flash ───────────────────────────
  const cardUpdateFlash = showUpdatedTranslation && frame < PHASE_CARD_UPDATE + t(15)
    ? interpolate(frame, [PHASE_CARD_UPDATE, PHASE_CARD_UPDATE + t(5), PHASE_CARD_UPDATE + t(15)], [0, 0.15, 0], { extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: isHorizontal ? 80 : 30,
        padding: 40,
      }}
    >
      {/* Title text (horizontal layout only) */}
      {isHorizontal && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: 480,
            opacity: interpolate(
              spring({ frame: sf(Math.max(0, frame - 10)), fps, config: { damping: 14, stiffness: 80 } }),
              [0, 1],
              [0, 1],
            ),
          }}
        >
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 44,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.2,
            }}
          >
            <span style={{ color: COLORS.emeraldDark }}>18+</span> Translations
            <br />& AI Tafsir
          </span>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 18,
              color: COLORS.textSecondary,
              lineHeight: 1.6,
            }}
          >
            Switch between world languages instantly.
            Get AI-powered explanations with scholarly context.
          </span>
        </div>
      )}

      {/* ── Phone Mockup ──────────────────────────────────────── */}
      <div
        style={{
          transform: `scale(${phoneScale})`,
          opacity: phoneOpacity,
          position: 'relative',
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
            {/* ── Surah Header ──────────────────────────────── */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 700, color: COLORS.white }}>
                    Al-Fatihah
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.textMuted }}>
                    Ayah 1 of 7
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartIcon filled />
                <div
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    background: (showMenu1 || showMenu2) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <MenuIcon size={18} color="#9ca3af" />
                </div>
              </div>
            </div>

            {/* ── Ayah Card ─────────────────────────────────── */}
            <div style={{ padding: '16px 16px 12px' }}>
              {/* Arabic Text Card */}
              <div
                style={{
                  background: 'rgba(15,15,15,1)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  boxShadow: cardUpdateFlash > 0 ? `0 0 30px rgba(5,150,105,${cardUpdateFlash})` : 'none',
                }}
              >
                {/* Top row: memorized icon */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(34,197,94,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon size={16} color="#22c55e" />
                  </div>
                </div>

                {/* Arabic text */}
                <div
                  style={{
                    fontFamily: FONTS.arabic,
                    fontSize: 28,
                    color: COLORS.white,
                    textAlign: 'center',
                    direction: 'rtl',
                    lineHeight: 2.2,
                    marginBottom: 4,
                  }}
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              </div>

              {/* Audio Player row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  padding: '12px 0',
                }}
              >
                <PlayIcon size={18} color="#6b7280" />
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 99,
                    maxWidth: 200,
                  }}
                >
                  <div style={{ width: '30%', height: '100%', background: COLORS.emeraldDark, borderRadius: 99 }} />
                </div>
                <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.textMuted }}>
                  0:03
                </span>
              </div>

              {/* Translation text — updates after Kuliev selection */}
              <div
                style={{
                  padding: '8px 4px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <GlobeIcon size={12} color="#6b7280" />
                  <span style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {showUpdatedTranslation ? 'Kuliev (Russian)' : 'Sahih International'}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 13,
                    color: COLORS.textSecondary,
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  {showUpdatedTranslation
                    ? 'Во имя Аллаха, Милостивого, Милосердного!'
                    : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
                </div>
              </div>
            </div>

            {/* ── Hamburger Dropdown Menu (Part A — Translation) ── */}
            {showMenu1 && (
              <DropdownMenu
                spring={menu1Spring}
                highlightIndex={0}
                isHighlighted={frame >= PHASE_CLICK_TRANSLATION - t(5)}
              />
            )}

            {/* ── Hamburger Dropdown Menu (Part B — AI Tafsir) ── */}
            {showMenu2 && (
              <DropdownMenu
                spring={menu2Spring}
                highlightIndex={3}
                isHighlighted={frame >= PHASE_CLICK_AI_TAFSIR - t(5)}
              />
            )}

            {/* ── Modal backdrop ───────────────────────────── */}
            {backdropOpacity > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `rgba(0,0,0,${backdropOpacity})`,
                  backdropFilter: 'blur(2px)',
                  zIndex: 60,
                }}
              />
            )}

            {/* ── Translation Selection Modal ──────────────── */}
            {showTranslationModal && modalCloseProgress < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 20,
                  zIndex: 70,
                  transform: `translateY(${translationModalY * (1 - modalCloseProgress) + modalCloseProgress * 300}px)`,
                  opacity: translationModalOpacity * (1 - modalCloseProgress),
                }}
              >
                <div
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    maxHeight: phoneHeight * 0.65,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <GlobeIcon size={14} color="#60a5fa" />
                      <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500, color: COLORS.white }}>
                        Select Translation
                      </span>
                    </div>
                    <XIcon size={16} color="#6b7280" />
                  </div>

                  {/* Scrollable list */}
                  <div
                    style={{
                      padding: '8px 12px',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    <div style={{ transform: `translateY(-${translationScrollOffset}px)` }}>
                      {TRANSLATIONS.map((tr, i) => {
                        const isSelected = isKulievSelected && tr.code === 'ru.kuliev';
                        const isCurrent = !isKulievSelected && tr.code === 'en.sahih';

                        return (
                          <div
                            key={tr.code}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: 8,
                              marginBottom: 2,
                              background: (isSelected || isCurrent)
                                ? 'rgba(34,197,94,0.1)'
                                : (i === kulievIndex && frame >= PHASE_SELECT_KULIEV - t(8) && !isKulievSelected)
                                  ? 'rgba(255,255,255,0.05)'
                                  : 'transparent',
                              border: (isSelected || isCurrent)
                                ? '1px solid rgba(34,197,94,0.3)'
                                : '1px solid transparent',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: FONTS.sans,
                                fontSize: 13,
                                color: (isSelected || isCurrent) ? COLORS.white : '#d1d5db',
                              }}
                            >
                              {tr.name}
                            </span>
                            {(isSelected || isCurrent) && <CheckIcon size={14} color="#4ade80" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── AI Tafsir Modal ──────────────────────────── */}
            {showAiTafsirModal && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 20,
                  zIndex: 70,
                  transform: `translateY(${aiModalY}px)`,
                  opacity: aiModalOpacity,
                }}
              >
                <div
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    maxHeight: phoneHeight * 0.75,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500, color: COLORS.white }}>
                        AI Tafsir
                      </span>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: '#6b7280', marginLeft: 8 }}>
                        Surah 1, Ayah 1
                      </span>
                    </div>
                    <XIcon size={16} color="#6b7280" />
                  </div>

                  {/* Content */}
                  <div style={{ padding: 16, overflow: 'hidden', flex: 1 }}>
                    {/* AI-Generated badge row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      <SparklesIcon size={14} color="#ec4899" />
                      <span
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#ec4899',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        AI-Generated Tafsir
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #ec4899, #3b82f6)',
                          color: COLORS.white,
                        }}
                      >
                        PRO
                      </span>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: '#6b7280' }}>
                        • English
                      </span>
                    </div>

                    {/* Warning banner */}
                    <div
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        marginBottom: 14,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <AlertCircleIcon size={14} color="#f59e0b" />
                      <span
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 11,
                          color: '#fbbf24',
                          lineHeight: 1.5,
                        }}
                      >
                        ⚠️ AI-generated content. Please consult traditional scholars for authoritative guidance.
                      </span>
                    </div>

                    {/* Tafsir content (revealed progressively) */}
                    <div
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: 12,
                        color: '#d1d5db',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        maxHeight: phoneHeight * 0.38,
                      }}
                    >
                      {renderTafsirContent(MOCK_AI_TAFSIR.slice(0, visibleTafsirChars))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Cursor ───────────────────────────────────── */}
            <Cursor
              x={cursorX}
              y={cursorY}
              pressing={cursorPressing}
              opacity={cursorOpacity}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────
// DropdownMenu — reusable hamburger dropdown (used twice)
// ─────────────────────────────────────────────────────────────────
const DropdownMenu: React.FC<{
  spring: number;
  highlightIndex: number;
  isHighlighted: boolean;
}> = ({ spring: springVal, highlightIndex, isHighlighted }) => {
  const items = [
    {
      icon: <GlobeIcon size={16} color="#9ca3af" />,
      label: 'Translation',
      badge: null,
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
        </svg>
      ),
      label: 'Transliteration',
      badge: null,
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h6" /><path d="M8 11h8" />
        </svg>
      ),
      label: 'Tafsir',
      badge: null,
    },
    {
      icon: <SparklesIcon size={16} color={isHighlighted && highlightIndex === 3 ? '#ec4899' : '#9ca3af'} />,
      label: 'AI Tafsir',
      badge: (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 5px',
            borderRadius: 4,
            background: 'linear-gradient(90deg, #ec4899, #3b82f6)',
            color: COLORS.white,
            marginLeft: 4,
          }}
        >
          PRO
        </span>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 92,
        right: 16,
        width: 200,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 50,
        opacity: interpolate(springVal, [0, 1], [0, 1]),
        transform: `scale(${interpolate(springVal, [0, 1], [0.95, 1])}) translateY(${interpolate(springVal, [0, 1], [-8, 0])}px)`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            background: isHighlighted && i === highlightIndex ? 'rgba(255,255,255,0.05)' : 'transparent',
          }}
        >
          {item.icon}
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 13,
              color: isHighlighted && i === highlightIndex
                ? (i === 3 ? '#f9a8d4' : COLORS.white)
                : '#d1d5db',
            }}
          >
            {item.label}
            {item.badge}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Renders tafsir text with **bold** markers converted to styled spans.
 */
function renderTafsirContent(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} style={{ fontWeight: 700, color: COLORS.white }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default FeatureScene;
