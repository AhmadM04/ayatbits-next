'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ScrollAnimationsProps {
  children: (props: { y1: MotionValue<number>; y2: MotionValue<number>; opacity: MotionValue<number> }) => React.ReactNode;
}

export default function ScrollAnimations({ children }: ScrollAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Always call hooks - React rules
  const { scrollYProgress } = useScroll({ container: containerRef });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {children({ y1, y2, opacity })}
    </div>
  );
}

