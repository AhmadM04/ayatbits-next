'use client';

import { useEffect, useRef } from 'react';

interface UsePreventBackOptions {
  /**
   * Callback to show the exit confirmation modal
   */
  onBackAttempt: () => void;
  
  /**
   * Optional: State key to identify the guard state in history
   * @default 'guardState'
   */
  stateKey?: string;
}

/**
 * Hook to prevent back navigation (swipe-to-back on mobile, browser back button)
 * and show a confirmation modal instead.
 * 
 * @example
 * ```tsx
 * const [showExitModal, setShowExitModal] = useState(false);
 * const isIntentionalExit = usePreventBack({
 *   onBackAttempt: () => setShowExitModal(true)
 * });
 * 
 * const handleConfirmExit = () => {
 *   isIntentionalExit.current = true;
 *   router.push('/dashboard');
 * };
 * ```
 */
export function usePreventBack({ 
  onBackAttempt, 
  stateKey = 'guardState' 
}: UsePreventBackOptions) {
  // Track if exit is intentional (e.g., user confirmed or navigated to next puzzle)
  const isIntentionalExit = useRef(false);

  useEffect(() => {
    // STEP 1: Push a "guard" state onto history stack
    // This creates a dummy entry that we can intercept
    window.history.pushState({ [stateKey]: true }, '', window.location.href);
    
    const handlePopState = (event: PopStateEvent) => {
      // Don't intercept if user has confirmed they want to leave
      if (isIntentionalExit.current) {
        return;
      }
      
      // Check if this is our guard state being popped
      if (event.state?.[stateKey]) {
        // STEP 2: Prevent navigation by preventing default
        event.preventDefault();
        
        // STEP 3: Re-arm the trap by pushing the state again
        window.history.pushState({ [stateKey]: true }, '', window.location.href);
        
        // STEP 4: Show the exit confirmation modal
        onBackAttempt();
      }
    };

    // Listen for popstate events (triggered by back button / swipe gestures)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Clean up: Remove the guard state when component unmounts
      // Only do this if the exit wasn't intentional
      if (!isIntentionalExit.current && window.history.state?.[stateKey]) {
        window.history.back();
      }
    };
  }, [onBackAttempt, stateKey]);

  // Return the ref so caller can mark intentional exits
  return isIntentionalExit;
}

