'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConditionalMotion, ConditionalAnimatePresence, useReducedMotion } from '@/components/ConditionalMotion';
import { TutorialTooltip } from './TutorialTooltip';

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

    const scrollToElement = () => {
      const selector = step.target.startsWith('[data-tutorial') 
        ? step.target 
        : `[data-tutorial="${step.target}"]`;
      
      const element = document.querySelector(selector);
      if (element) {
        // Scroll element into view with smooth animation
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        
        // Update position after scroll completes
        setTimeout(updatePosition, 600);
      }
    };

    // Initial scroll and position with small delay to ensure DOM is ready
    setTimeout(() => {
      scrollToElement();
      updatePosition();
    }, 100);

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
    <ConditionalAnimatePresence mode="wait">
      {/* Backdrop overlay - clickable to skip, allows scrolling */}
      <ConditionalMotion
        as="div"
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
          overflow: 'auto',
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
        className="fixed"
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
        key="tooltip"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed"
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
  );
}

