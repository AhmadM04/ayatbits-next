import { useRef, useCallback } from 'react';

/**
 * Custom hook for detecting long press with scroll interference prevention
 * 
 * @param callback - Function to call when long press is detected
 * @param ms - Duration in milliseconds to wait before triggering (default: 500ms)
 * @param options - Optional configuration
 * @returns Object containing event handlers to spread onto target element
 * 
 * @example
 * ```tsx
 * const longPressHandlers = useLongPress(() => {
 *   console.log('Long press detected!');
 * }, 500);
 * 
 * return <div {...longPressHandlers}>Press and hold me</div>;
 * ```
 */
export function useLongPress(
  callback: () => void,
  ms = 500,
  options: {
    /** Distance threshold in pixels - if exceeded, cancel long press (default: 10px) */
    movementThreshold?: number;
    /** Enable haptic feedback on successful long press (default: true) */
    enableHaptics?: boolean;
    /** Custom haptic pattern [vibrate, pause, vibrate] (default: [100, 50, 100]) */
    hapticPattern?: number[];
    /** Callback when long press starts (visual feedback) */
    onStart?: () => void;
    /** Callback when long press is cancelled */
    onCancel?: () => void;
  } = {}
) {
  const {
    movementThreshold = 10,
    enableHaptics = true,
    hapticPattern = [100, 50, 100],
    onStart,
    onCancel,
  } = options;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const isScrolling = useRef(false);
  const isLongPressing = useRef(false);

  /**
   * Clear the timer and reset state
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isScrolling.current = false;
    isLongPressing.current = false;
  }, []);

  /**
   * Handle touch/mouse start - begin long press timer
   */
  const handleStart = useCallback((clientX: number, clientY: number) => {
    // Store initial position
    startPos.current = { x: clientX, y: clientY };
    isScrolling.current = false;
    isLongPressing.current = false;

    // Notify parent component (for visual feedback)
    onStart?.();

    // Start the long press timer
    timerRef.current = setTimeout(() => {
      // Only trigger if user hasn't scrolled
      if (!isScrolling.current) {
        isLongPressing.current = true;

        // Trigger haptic feedback
        if (enableHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(hapticPattern);
        }

        // Execute callback
        callback();
      }
    }, ms);
  }, [callback, ms, enableHaptics, hapticPattern, onStart]);

  /**
   * Handle touch/mouse move - check if user is scrolling
   */
  const handleMove = useCallback((clientX: number, clientY: number) => {
    // Skip if already scrolling or long press already triggered
    if (isScrolling.current || isLongPressing.current) {
      return;
    }

    // Calculate distance from start position
    const deltaX = Math.abs(clientX - startPos.current.x);
    const deltaY = Math.abs(clientY - startPos.current.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // If movement exceeds threshold, cancel the long press
    if (distance > movementThreshold) {
      isScrolling.current = true;
      clearTimer();
      onCancel?.();
    }
  }, [movementThreshold, clearTimer, onCancel]);

  /**
   * Handle touch/mouse end - clean up
   */
  const handleEnd = useCallback(() => {
    clearTimer();
    onCancel?.();
  }, [clearTimer, onCancel]);

  // ============================================================================
  // Touch Event Handlers
  // ============================================================================

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  }, [handleMove]);

  const onTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onTouchCancel = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // ============================================================================
  // Mouse Event Handlers
  // ============================================================================

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left click
    if (e.button === 0) {
      handleStart(e.clientX, e.clientY);
    }
  }, [handleStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Prevent context menu on desktop (right-click should not interfere)
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Trigger haptic feedback for context menu
    if (enableHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(hapticPattern);
    }
    
    // Execute callback immediately on right-click
    callback();
  }, [callback, enableHaptics, hapticPattern]);

  // ============================================================================
  // Return event handlers
  // ============================================================================

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onContextMenu,
  };
}

