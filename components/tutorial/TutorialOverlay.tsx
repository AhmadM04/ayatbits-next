'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TutorialArrow, ArrowDirection } from './TutorialArrow';
import { TutorialTooltip } from './TutorialTooltip';

export interface TutorialStep {
  id: string;
  target: string; // CSS selector or data-tutorial attribute
  title: string;
  message: string;
  arrow?: ArrowDirection;
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive || !step) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const selector = step.target.startsWith('[data-tutorial') 
        ? step.target 
        : `[data-tutorial="${step.target}"]`;
      
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        console.warn(`Tutorial target not found: ${step.target}`);
      }
    };

    // Initial position with small delay to ensure DOM is ready
    setTimeout(updatePosition, 100);

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [step, isActive]);

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

  if (!mounted || !isActive || !step || !targetRect) return null;

  const placement = step.placement || 'bottom';
  const offset = step.offset || {};

  // Calculate tooltip position with viewport bounds checking
  const getTooltipPosition = () => {
    const baseOffset = 24; // Gap between target and tooltip
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 384; // max-w-sm = 24rem = 384px
    
    let left = targetRect.left + targetRect.width / 2;
    let top = targetRect.top;
    let transform = 'translate(-50%, -100%)';
    
    switch (placement) {
      case 'top':
        top = targetRect.top - baseOffset;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + baseOffset;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        left = targetRect.left - baseOffset;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        left = targetRect.right + baseOffset;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(0, -50%)';
        break;
    }
    
    // Keep tooltip within viewport bounds
    if (left < tooltipWidth / 2 + 20) {
      left = tooltipWidth / 2 + 20;
    } else if (left > viewportWidth - tooltipWidth / 2 - 20) {
      left = viewportWidth - tooltipWidth / 2 - 20;
    }
    
    if (top < 20) {
      top = 20;
      transform = transform.replace('-100%', '0');
    } else if (top > viewportHeight - 200) {
      top = viewportHeight - 200;
    }
    
    return { left, top, transform };
  };

  // Calculate arrow position
  const getArrowPosition = () => {
    const isVerticalArrow = step.arrow?.includes('down') || step.arrow?.includes('up');
    const arrowSize = isVerticalArrow ? 60 : 80;
    const arrowWidth = isVerticalArrow ? 80 : 120;
    const arrowHeight = isVerticalArrow ? 120 : 80;
    
    switch (placement) {
      case 'top':
        return {
          left: targetRect.left + targetRect.width / 2 - arrowWidth / 2,
          top: targetRect.top - arrowSize - 20,
        };
      case 'bottom':
        return {
          left: targetRect.left + targetRect.width / 2 - arrowWidth / 2,
          top: targetRect.bottom + 20,
        };
      case 'left':
        return {
          left: targetRect.left - arrowSize - 20,
          top: targetRect.top + targetRect.height / 2 - arrowHeight / 2,
        };
      case 'right':
        return {
          left: targetRect.right + 20,
          top: targetRect.top + targetRect.height / 2 - arrowHeight / 2,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();
  const arrowPosition = step.arrow ? getArrowPosition() : null;

  return (
    <AnimatePresence mode="wait">
      {/* Backdrop overlay - clickable to skip (no blur to keep highlighted element clear) */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onSkip}
        className="fixed inset-0"
        style={{ 
          zIndex: 999999,
          pointerEvents: 'auto',
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Spotlight cutout - makes highlighted element transparent and distinguishable */}
      <motion.div
        key="spotlight"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed"
        style={{
          zIndex: 1000000,
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
      
      {/* Pulsing glow effect for emphasis */}
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
          zIndex: 999999,
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
      
      {/* Clear overlay for the highlighted element - removes blur */}
      <motion.div
        key="clear-area"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bg-transparent"
        style={{
          zIndex: 1000000,
          left: targetRect.left - 12,
          top: targetRect.top - 12,
          width: targetRect.width + 24,
          height: targetRect.height + 24,
          borderRadius: '16px',
          pointerEvents: 'none',
        }}
      />

      {/* Arrow */}
      {arrowPosition && step.arrow && (
        <motion.div
          key="arrow"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed"
          style={{
            zIndex: 1000001,
            left: arrowPosition.left + (offset.x || 0),
            top: arrowPosition.top + (offset.y || 0),
            pointerEvents: 'none',
          }}
        >
          <TutorialArrow direction={step.arrow} />
        </motion.div>
      )}

      {/* Tooltip */}
      <motion.div
        key="tooltip"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed"
        style={{
          zIndex: 1000002,
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
      </motion.div>
    </AnimatePresence>
  );
}

