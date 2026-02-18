import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { type AspectRatioKey } from '../Theme';

interface BackgroundProps {
  ratio: AspectRatioKey;
  /** Brand accent color (from schema) */
  primaryColor: string;
  /** Canvas background color (from schema) */
  backgroundColor: string;
}

/**
 * Animated background — pulsing orbs, shimmer sweep, vignette.
 * Fully driven by `primaryColor` and `backgroundColor` from the schema.
 */
export const Background: React.FC<BackgroundProps> = ({
  ratio,
  primaryColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const shimmerX = interpolate(frame % 90, [0, 90], [-40, 140], {
    extrapolateRight: 'clamp',
  });

  const orbPulse1 = interpolate(Math.sin(frame * 0.04),       [-1, 1], [0.12, 0.25]);
  const orbPulse2 = interpolate(Math.sin(frame * 0.03 + 1),   [-1, 1], [0.08, 0.18]);
  const orbPulse3 = interpolate(Math.sin(frame * 0.05 + 2),   [-1, 1], [0.06, 0.14]);

  const bgRotation = interpolate(frame, [0, durationInFrames], [0, 15]);

  // Derive a slightly lighter shade of primaryColor for the shimmer
  const shimmerColor = `${primaryColor}12`;
  const glowColor    = `${primaryColor}40`;

  const orbConfigs = {
    vertical: [
      { top: '5%',  left: '-10%',  size: 500 },
      { top: '45%', right: '-15%', size: 600 },
      { top: '75%', left:  '20%',  size: 450 },
    ],
    square: [
      { top: '0%',  left: '-10%',  size: 450 },
      { top: '40%', right: '-15%', size: 500 },
      { top: '70%', left:  '15%',  size: 400 },
    ],
    horizontal: [
      { top: '-5%', left: '-5%',   size: 550 },
      { top: '30%', right: '-10%', size: 650 },
      { top: '60%', left:  '30%',  size: 500 },
    ],
  }[ratio];

  const opacities = [orbPulse1, orbPulse2, orbPulse3];

  // Derive a dark variant of primaryColor for the gradient stop
  const darkGreen = '#15803d';

  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${darkGreen} 0%, ${backgroundColor} 50%, #1a1a1a 100%)`,
          transform: `rotate(${bgRotation}deg) scale(1.3)`,
          transformOrigin: 'center',
        }}
      />

      {/* Pulsing orbs */}
      {orbConfigs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: orb.top,
            left: 'left' in orb ? (orb as any).left : undefined,
            right: 'right' in orb ? (orb as any).right : undefined,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: `blur(${orb.size * 0.3}px)`,
            opacity: opacities[i],
          }}
        />
      ))}

      {/* Shimmer sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent ${shimmerX - 10}%, ${shimmerColor} ${shimmerX}%, transparent ${shimmerX + 10}%)`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
