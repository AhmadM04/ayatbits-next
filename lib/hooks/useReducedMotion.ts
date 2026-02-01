'use client';

import { useMotion } from '@/lib/contexts/motion-context';

/**
 * Hook to check if animations should be reduced
 * Returns true if:
 * - User prefers reduced motion (accessibility)
 * - Device performance is low
 * - Battery is low (<20%) and not charging
 * - Manual override is enabled
 */
export function useReducedMotion(): boolean {
  const { shouldReduceMotion } = useMotion();
  return shouldReduceMotion;
}

/**
 * Hook to get performance tier
 */
export function usePerformanceTier() {
  const { performanceTier } = useMotion();
  return performanceTier;
}

/**
 * Hook to get full motion context
 */
export function useMotionContext() {
  return useMotion();
}

