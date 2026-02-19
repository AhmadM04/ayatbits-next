'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConditionalMotion, ConditionalAnimatePresence, useReducedMotion } from '@/components/ConditionalMotion';
import { TutorialTooltip } from './TutorialTooltip';
import { TutorialPortal } from './TutorialPortal';

export interface TutorialStep {
  id: string;
  target: string; // CSS selector or data-tutorial attribute
  title: string;
  message: string;
  /** Optional interpolation params for the message translation key, e.g. { count: 3 } */
  params?: Record<string, string | number>;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x?: number; y?: number };
  /**
   * When true, the tutorial will never auto-advance this step even if the
   * target element cannot be found. The user must click "Next" manually.
   */
  requireManualAdvance?: boolean;
  /**
   * Optional async hook called *before* the tutorial advances to the next step.
   * Useful for side-effects like closing a mobile menu before the next step's
   * target element comes into view. The tutorial waits for the returned Promise
   * to resolve before incrementing the step counter.
   */
  onBeforeNext?: () => Promise<void>;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  isActive: boolean;
}

/**
 * Check if an element is hidden (display: none, visibility: hidden, or 0 dimensions)
 */
function isElementHidden(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.offsetWidth === 0 ||
    element.offsetHeight === 0
  );
}

/**
 * Find the first element matching `selector` that is actually visible.
 * Uses querySelectorAll so that when multiple elements share the same
 * data-tutorial attribute (e.g. a hidden desktop element AND a visible
 * mobile-menu element), we always pick the visible one.
 */
function findFirstVisibleElement(selector: string): HTMLElement | null {
  const elements = Array.from(
    document.querySelectorAll(selector)
  ) as HTMLElement[];

  for (const el of elements) {
    if (!isElementHidden(el)) {
      const rect = el.getBoundingClientRect();
      const hasValidDimensions = rect.width > 0 && rect.height > 0;
      const hasReasonablePosition = !(
        rect.top === 0 && rect.left === 0 &&
        rect.right === 0 && rect.bottom === 0
      );
      if (hasValidDimensions && hasReasonablePosition) {
        return el;
      }
    }
  }
  return null;
}

/**
 * Wait for an element to become fully visible and positioned.
 * Polls ALL elements matching the selector and returns the first visible one.
 * This handles the case where the same data-tutorial value is used on both a
 * hidden desktop element and a visible mobile-menu element.
 */
async function waitForElementVisible(
  selector: string,
  maxAttempts: number = 10,
  intervalMs: number = 100
): Promise<HTMLElement | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const element = findFirstVisibleElement(selector);
    if (element) {
      return element;
    }
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return null;
}

/**
 * Attempt to open mobile menu if tutorial target is hidden
 */
function tryOpenMobileMenu(): boolean {
  // Look for mobile burger menu button using data attribute
  const burgerButton = document.querySelector('[data-mobile-menu-toggle]') as HTMLButtonElement;
  
  if (burgerButton) {
    // Check if menu is closed
    const isMenuOpen = burgerButton.getAttribute('data-menu-open') === 'true';
    
    if (!isMenuOpen) {
      // Click to open
      burgerButton.click();
      return true;
    }
  }
  
  return false;
}

export function TutorialOverlay({
  steps,
  currentStep,
  onNext,
  onSkip,
  isActive,
}: TutorialOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const step = steps[currentStep];
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ============================================================================
  // SCROLL LOCK: Prevent user from scrolling away during tutorial
  // ============================================================================
  useEffect(() => {
    if (isActive) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original overflow
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !step) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const selector = step.target.startsWith('[data-tutorial') 
        ? step.target 
        : `[data-tutorial="${step.target}"]`;

      // Use findFirstVisibleElement so we always pick the visible copy when
      // the same data-tutorial value exists on both a hidden desktop element
      // and a visible mobile-menu element.
      const element = findFirstVisibleElement(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        
        // Only update if the element has valid dimensions and position
        // This prevents the flash at 0,0 during animations
        const hasValidDimensions = rect.width > 0 && rect.height > 0;
        const hasReasonablePosition = !(rect.top === 0 && rect.left === 0 && rect.right === 0 && rect.bottom === 0);
        
        if (hasValidDimensions && hasReasonablePosition) {
          setTargetRect(rect);
        } else {
          console.log(`Skipping invalid position for: ${step.target}`, rect);
        }
      } else {
        console.warn(`Tutorial target not found or hidden: ${step.target}`);
      }
    };

    const handleTargetVisibility = async () => {
      const selector = step.target.startsWith('[data-tutorial') 
        ? step.target 
        : `[data-tutorial="${step.target}"]`;
      
      // Check if any visible copy of the target already exists
      let element = findFirstVisibleElement(selector);
      
      // ========================================================================
      // MOBILE BURGER FIX: Auto-open menu if target is hidden
      // ========================================================================
      if (!element) {
        // No visible target found - try opening mobile menu
        const menuOpened = tryOpenMobileMenu();
        
        if (menuOpened) {
          console.log(`Opened mobile menu for tutorial target: ${step.target}`);
          
          // Brief wait (200ms) so the Framer Motion menu animation completes
          // and React has re-rendered the menu children before we start polling.
          await new Promise(resolve => setTimeout(resolve, 200));

          // Wait for the element to become fully visible using polling.
          // This accounts for:
          // - Menu animation (150ms as per motion.div transition)
          // - React re-render and DOM updates
          // - CSS transitions and animations
          // - Browser reflow and repaint
          element = await waitForElementVisible(selector, 20, 100);
          
          // If element still not accessible after waiting, only auto-skip when
          // the step does NOT require manual advancement.
          if (!element) {
            console.warn(`Tutorial target still not accessible after opening menu: ${step.target}`);
            if (!step.requireManualAdvance) {
              setTimeout(() => onNext(), 500);
            }
            return;
          }
          
          console.log(`Element now visible: ${step.target}`);
        } else {
          console.warn(`Tutorial target not found and menu not opened: ${step.target}`);
          // Only auto-skip when the step allows it
          if (!step.requireManualAdvance) {
            setTimeout(() => onNext(), 500);
          }
          return;
        }
      }
      
      // ========================================================================
      // AUTO-SCROLL: Scroll target into view
      // ========================================================================
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        
        // Wait for scroll to complete before updating position
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Now update position after element is visible and scrolled into view
        updatePosition();
      } else {
        console.warn(`Tutorial target not found: ${step.target}`);
        // Only auto-skip when the step allows it
        if (!step.requireManualAdvance) {
          setTimeout(() => onNext(), 500);
        }
      }
    };

    // Initial handling with delay to ensure DOM is ready
    setTimeout(() => {
      // Don't call updatePosition() here - let handleTargetVisibility do it
      // after ensuring the element is visible
      handleTargetVisibility();
      
      // Force positioning recalculation by dispatching resize event
      window.dispatchEvent(new Event('resize'));
    }, 100);

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('orientationchange', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [step, isActive, currentStep]);

  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isActive, onSkip, onNext]);

  // Force re-render when step changes to recalculate positioning
  useEffect(() => {
    if (!isActive || !step) return;
    
    // Dispatch resize event to force positioning engine to recalculate
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
    
    return () => clearTimeout(timer);
  }, [currentStep, isActive, step]);

  if (!mounted || !isActive || !step || !targetRect) return null;

  const placement = step.placement || 'bottom';
  const offset = step.offset || {};

  // Calculate tooltip position - centered on screen for better mobile experience
  const getTooltipPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Center the tooltip on screen both horizontally and vertically
    const left = viewportWidth / 2;
    const top = viewportHeight / 2;
    const transform = 'translate(-50%, -50%)';
    
    return { left, top, transform };
  };

  const tooltipPosition = getTooltipPosition();
  const shouldReduceMotion = useReducedMotion();

  return (
    <TutorialPortal>
      <ConditionalAnimatePresence mode="wait">
        {/* Backdrop overlay - clickable to skip, prevents scrolling */}
        <ConditionalMotion
          as="div"
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onSkip}
          className="fixed inset-0 tour-backdrop"
          style={{ 
            zIndex: 999999,
            pointerEvents: 'auto',
            background: 'rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}
        />

        {/* Spotlight cutout - makes highlighted element transparent and distinguishable */}
        <ConditionalMotion
          as="div"
          key="spotlight"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed tour-spotlight"
          style={{
            zIndex: 1000001,
            left: targetRect.left - 12,
            top: targetRect.top - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            boxShadow: `
              0 0 0 9999px rgba(0, 0, 0, 0.85),
              inset 0 0 0 4px rgba(16, 185, 129, 0.8),
              0 0 50px 15px rgba(16, 185, 129, 0.6),
              0 0 100px 25px rgba(16, 185, 129, 0.3),
              0 15px 60px rgba(0, 0, 0, 0.6)
            `,
            borderRadius: '16px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            background: 'transparent',
          }}
        />
        
        {/* Pulsing glow effect for emphasis - skip when reduced motion */}
        {!shouldReduceMotion && (
          <motion.div
            key="pulse-glow"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="fixed"
            style={{
              zIndex: 1000001,
              left: targetRect.left - 16,
              top: targetRect.top - 16,
              width: targetRect.width + 32,
              height: targetRect.height + 32,
              borderRadius: '18px',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              boxShadow: '0 0 40px 10px rgba(16, 185, 129, 0.4)',
              pointerEvents: 'none',
            }}
          />
        )}
        
        {/* Clear overlay for the highlighted element - ensures it's visible and clickable */}
        <ConditionalMotion
          as="div"
          key="clear-area"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bg-transparent"
          style={{
            zIndex: 1000002,
            left: targetRect.left - 12,
            top: targetRect.top - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            borderRadius: '16px',
            pointerEvents: 'none',
          }}
        />

        {/* Tooltip */}
        <ConditionalMotion
          as="div"
          key={`tooltip-${currentStep}`}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed tour-tooltip-container"
          style={{
            zIndex: 1000004,
            left: tooltipPosition.left + (offset.x || 0),
            top: tooltipPosition.top + (offset.y || 0),
            transform: tooltipPosition.transform,
            pointerEvents: 'auto',
          }}
        >
          <TutorialTooltip
            title={step.title}
            message={step.message}
            params={step.params}
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={onNext}
            onSkip={onSkip}
          />
        </ConditionalMotion>
      </ConditionalAnimatePresence>
    </TutorialPortal>
  );
}

