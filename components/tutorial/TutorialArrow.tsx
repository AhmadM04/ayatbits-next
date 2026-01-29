'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export type ArrowDirection = 'curved-right' | 'curved-left' | 'curved-up' | 'curved-down';

interface TutorialArrowProps {
  direction?: ArrowDirection;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

const arrowPaths: Record<ArrowDirection, string> = {
  'curved-right': '/tutorial-arrows/arrow-curved-right.svg',
  'curved-left': '/tutorial-arrows/arrow-curved-left.svg',
  'curved-up': '/tutorial-arrows/arrow-curved-up.svg',
  'curved-down': '/tutorial-arrows/arrow-curved-down.svg',
};

export function TutorialArrow({
  direction = 'curved-down',
  className = '',
  style = {},
  color = 'white',
}: TutorialArrowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: direction.includes('down') ? [0, 5, 0] : direction.includes('up') ? [0, -5, 0] : 0,
        x: direction.includes('right') ? [0, 5, 0] : direction.includes('left') ? [0, -5, 0] : 0,
      }}
      transition={{
        duration: 0.5,
        y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
        x: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
      }}
      className={`pointer-events-none ${className}`}
      style={{ color, ...style }}
    >
      <Image
        src={arrowPaths[direction]}
        alt="Tutorial arrow"
        width={direction.includes('up') || direction.includes('down') ? 80 : 120}
        height={direction.includes('up') || direction.includes('down') ? 120 : 80}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))' }}
      />
    </motion.div>
  );
}

