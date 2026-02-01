'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ConditionalMotion, ConditionalAnimatePresence } from '@/components/ConditionalMotion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <ConditionalAnimatePresence mode="wait">
      <ConditionalMotion
        as="div"
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1], // Custom easing for smooth feel
        }}
        className="min-h-screen"
      >
        {children}
      </ConditionalMotion>
    </ConditionalAnimatePresence>
  );
}

