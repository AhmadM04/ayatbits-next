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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
        className="min-h-screen"
      >
        {children}
      </ConditionalMotion>
    </ConditionalAnimatePresence>
  );
}

