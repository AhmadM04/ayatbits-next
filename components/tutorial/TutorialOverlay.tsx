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
  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    // Initial position
    updatePosition();

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

  if (!isActive || !step || !targetRect) return null;

  const placement = step.placement || 'bottom';
  const offset = step.offset || {};

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const baseOffset = 20; // Gap between target and tooltip
    
    switch (placement) {
      case 'top':
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.top - baseOffset,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.bottom + baseOffset,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          left: targetRect.left - baseOffset,
          top: targetRect.top + targetRect.height / 2,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: targetRect.right + baseOffset,
          top: targetRect.top + targetRect.height / 2,
          transform: 'translate(0, -50%)',
        };
    }
  };

  // Calculate arrow position
  const getArrowPosition = () => {
    const arrowOffset = step.arrow?.includes('down') || step.arrow?.includes('up') ? 60 : 80;
    
    switch (placement) {
      case 'top':
        return {
          left: targetRect.left + targetRect.width / 2 - 40,
          top: targetRect.top - arrowOffset,
        };
      case 'bottom':
        return {
          left: targetRect.left + targetRect.width / 2 - 40,
          top: targetRect.bottom + 10,
        };
      case 'left':
        return {
          left: targetRect.left - arrowOffset,
          top: targetRect.top + targetRect.height / 2 - 40,
        };
      case 'right':
        return {
          left: targetRect.right + 10,
          top: targetRect.top + targetRect.height / 2 - 40,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();
  const arrowPosition = step.arrow ? getArrowPosition() : null;

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onSkip}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 9999 }}
      />

      {/* Spotlight effect */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 10000,
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          transition: 'all 0.3s ease-out',
        }}
      />

      {/* Arrow */}
      {arrowPosition && step.arrow && (
        <div
          className="fixed"
          style={{
            zIndex: 10001,
            left: arrowPosition.left + (offset.x || 0),
            top: arrowPosition.top + (offset.y || 0),
          }}
        >
          <TutorialArrow direction={step.arrow} />
        </div>
      )}

      {/* Tooltip */}
      <div
        className="fixed"
        style={{
          zIndex: 10001,
          left: tooltipPosition.left + (offset.x || 0),
          top: tooltipPosition.top + (offset.y || 0),
          transform: tooltipPosition.transform,
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
      </div>
    </AnimatePresence>
  );
}

