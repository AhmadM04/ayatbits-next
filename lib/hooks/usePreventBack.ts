'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook to prevent back navigation (swipe-to-back on mobile, browser back button)
 * and show a confirmation modal instead.
 * 
 * IMPORTANT: When user confirms exit, use router.push() NOT router.back()
 * to escape the history trap.
 * 
 * @example
 * ```tsx
 * const [showExitModal, setShowExitModal] = useState(false);
 * 
 * usePreventBack(true, () => setShowExitModal(true));
 * 
 * const handleConfirmExit = () => {
 *   setShowExitModal(false);
 *   router.push('/dashboard'); // ← Use push(), NOT back()
 * };
 * ```
 */
export function usePreventBack(
  shouldPrevent: boolean,
  onPrevent: () => void
) {
  const armTrap = useCallback(() => {
    // Push a dummy state to create a "history entry" we can intercept
    window.history.pushState({ trap: true }, '', window.location.href);
  }, []);

  useEffect(() => {
    if (!shouldPrevent) return;

    // STEP 1: Arm the trap on mount
    armTrap();

    // STEP 2: Intercept back navigation (swipe or button)
    const handlePopState = (e: PopStateEvent) => {
      // User tried to go back - immediately re-arm the trap
      // This keeps them on the page
      armTrap();
      
      // Show the "Are you sure?" modal
      onPrevent();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldPrevent, onPrevent, armTrap]);
}

