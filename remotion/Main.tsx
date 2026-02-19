import React from 'react';
import { Composition } from 'remotion';
import {
  compositionSchema,
  type CompositionProps,
  calculateTotalFrames,
} from './Schema';
import { AyatBitsShowcase } from './AyatBitsShowcase';
import { CANVAS_SIZES } from './Theme';

const FPS = 30;

// ── Shared default props (ratio is overridden per composition) ───────
const BASE_DEFAULTS: CompositionProps = compositionSchema.parse({});

/**
 * calculateMetadata
 * =================
 * Called by Remotion whenever input props change in the Studio sidebar.
 * Returns the updated `durationInFrames` so the timeline automatically
 * stretches / shrinks when you tweak any scene duration slider.
 */
const calculateMetadata = ({ props }: { props: CompositionProps }) => {
  return {
    durationInFrames: calculateTotalFrames(props, FPS),
  };
};

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
 *
 * `calculateMetadata` dynamically recomputes `durationInFrames`
 * from the per-scene duration props — no manual total needed.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── TikTok / Reels (9:16 Vertical) ──────────────────── */}
      <Composition
        id="AyatBits-Vertical-9x16"
        component={AyatBitsShowcase}
        durationInFrames={calculateTotalFrames(BASE_DEFAULTS, FPS)}
        fps={FPS}
        width={CANVAS_SIZES.vertical.width}
        height={CANVAS_SIZES.vertical.height}
        schema={compositionSchema}
        defaultProps={{ ...BASE_DEFAULTS, ratio: 'vertical' as const }}
        calculateMetadata={calculateMetadata}
      />

      {/* ── Instagram (4:3 Square) ───────────────────────────── */}
      <Composition
        id="AyatBits-Square-4x3"
        component={AyatBitsShowcase}
        durationInFrames={calculateTotalFrames(BASE_DEFAULTS, FPS)}
        fps={FPS}
        width={CANVAS_SIZES.square.width}
        height={CANVAS_SIZES.square.height}
        schema={compositionSchema}
        defaultProps={{ ...BASE_DEFAULTS, ratio: 'square' as const }}
        calculateMetadata={calculateMetadata}
      />

      {/* ── YouTube (16:9 Horizontal) ────────────────────────── */}
      <Composition
        id="AyatBits-Horizontal-16x9"
        component={AyatBitsShowcase}
        durationInFrames={calculateTotalFrames(BASE_DEFAULTS, FPS)}
        fps={FPS}
        width={CANVAS_SIZES.horizontal.width}
        height={CANVAS_SIZES.horizontal.height}
        schema={compositionSchema}
        defaultProps={{ ...BASE_DEFAULTS, ratio: 'horizontal' as const }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
