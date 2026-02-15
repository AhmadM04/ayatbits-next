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
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x?: number; y?: number };
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
      
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        console.warn(`Tutorial target not found: ${step.target}`);
      }
    };

    const handleTargetVisibility = async () => {
      const selector = step.target.startsWith('[data-tutorial') 
        ? step.target 
        : `[data-tutorial="${step.target}"]`;
      
      let element = document.querySelector(selector) as HTMLElement;
      
      // ========================================================================
      // MOBILE BURGER FIX: Auto-open menu if target is hidden
      // ========================================================================
      if (element && isElementHidden(element)) {
        // Target exists but is hidden - try opening mobile menu
        const menuOpened = tryOpenMobileMenu();
        
        if (menuOpened) {
          // Wait for menu animation to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Re-query element after menu opens
          element = document.querySelector(selector) as HTMLElement;
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
        
        // Update position after scroll completes
        setTimeout(updatePosition, 600);
      }
    };

    // Initial handling with delay to ensure DOM is ready
    setTimeout(() => {
      handleTargetVisibility();
      updatePosition();
      
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

