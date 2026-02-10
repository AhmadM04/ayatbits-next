'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ConditionalMotion, ConditionalAnimatePresence } from '@/components/ConditionalMotion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Heavy routes that should skip exit animations for better performance
const HEAVY_ROUTES = [
  '/wordpuzzle',
  '/quran',
  '/dashboard/mushaf',
  '/puzzle',
];

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // Check if the current route is a heavy route
  const isHeavyRoute = HEAVY_ROUTES.some(route => pathname.startsWith(route));

  return (
    <ConditionalAnimatePresence mode="wait">
      <ConditionalMotion
        as="div"
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // Disable exit animations for heavy routes to ensure instant unmounting
        exit={isHeavyRoute ? undefined : { opacity: 0 }}
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

