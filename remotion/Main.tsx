import React from 'react';
import { Composition } from 'remotion';
import { compositionSchema, type CompositionProps } from './Schema';
import { AyatBitsShowcase } from './AyatBitsShowcase';
import { CANVAS_SIZES } from './Theme';

const FPS = 30;
const DURATION_SECONDS = 22;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

// ── Shared default props (ratio is overridden per composition) ───────
const BASE_DEFAULTS: CompositionProps = compositionSchema.parse({});

/**
 * RemotionRoot
 * =============
 * Three compositions — one per social-media aspect ratio.
 *
 * The `schema` prop wires up `compositionSchema` so every field is
 * exposed as a live-editable sidebar control in Remotion Studio.
 *
 * zColor() fields → color pickers
 * z.boolean() fields → toggle switches
 * z.number() fields  → numeric sliders
 * z.string() fields  → text inputs
 * z.array()  fields  → array editors
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── TikTok / Reels (9:16 Vertical) ──────────────────── */}
      <Composition
        id="AyatBits-Vertical-9x16"
        component={AyatBitsShowcase}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={CANVAS_SIZES.vertical.width}
        height={CANVAS_SIZES.vertical.height}
        schema={compositionSchema}
        defaultProps={{ ...BASE_DEFAULTS, ratio: 'vertical' as const }}
      />

      {/* ── Instagram (4:3 Square) ───────────────────────────── */}
      <Composition
        id="AyatBits-Square-4x3"
        component={AyatBitsShowcase}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={CANVAS_SIZES.square.width}
        height={CANVAS_SIZES.square.height}
        schema={compositionSchema}
        defaultProps={{ ...BASE_DEFAULTS, ratio: 'square' as const }}
      />

      {/* ── YouTube (16:9 Horizontal) ────────────────────────── */}
      <Composition
        id="AyatBits-Horizontal-16x9"
        component={AyatBitsShowcase}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={CANVAS_SIZES.horizontal.width}
        height={CANVAS_SIZES.horizontal.height}
        schema={compositionSchema}
        defaultProps={{ ...BASE_DEFAULTS, ratio: 'horizontal' as const }}
      />
    </>
  );
};
