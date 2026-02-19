'use client';

import { motion } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect, useRef } from 'react';

interface TutorialTooltipProps {
  title: string;
  message: string;
  /** Optional interpolation params passed to the i18n t() function, e.g. { count: 3 } */
  params?: Record<string, string | number>;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showSkip?: boolean;
}

export function TutorialTooltip({
  title,
  message,
  params,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  placement = 'bottom',
  showSkip = true,
}: TutorialTooltipProps) {
  const isLastStep = currentStep === totalSteps - 1;
  const { t, locale } = useI18n();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // Update drag constraints based on actual tooltip dimensions and viewport
  useEffect(() => {
    const updateConstraints = () => {
      if (!tooltipRef.current) return;
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = tooltipRef.current.getBoundingClientRect();
      
      // Get actual tooltip dimensions
      const tooltipWidth = rect.width;
      const tooltipHeight = rect.height;
      
      // Padding from edges
      const padding = 16;
      
      // The tooltip is rendered at 50% viewport with translate(-50%, -50%)
      // So its actual position spans from:
      // - left edge: (vw/2) - (width/2)
      // - right edge: (vw/2) + (width/2)
      // - top edge: (vh/2) - (height/2)
      // - bottom edge: (vh/2) + (height/2)
      
      // Calculate the current position of edges relative to viewport
      const leftEdge = rect.left;
      const rightEdge = rect.right;
      const topEdge = rect.top;
      const bottomEdge = rect.bottom;
      
      // Calculate how far we can drag in each direction
      // Negative values mean we can drag in that direction
      // The tooltip center can move as far as needed to keep all edges within padding
      
      // How far left can we drag? (until left edge hits padding)
      const maxDragLeft = leftEdge - padding;
      
      // How far right can we drag? (until right edge hits padding) 
      const maxDragRight = vw - rightEdge - padding;
      
      // How far up can we drag? (until top edge hits padding)
      const maxDragUp = topEdge - padding;
      
      // How far down can we drag? (until bottom edge hits padding)
      const maxDragDown = vh - bottomEdge - padding;
      
      setDragConstraints({
        left: -Math.max(0, maxDragLeft),
        right: Math.max(0, maxDragRight),
        top: -Math.max(0, maxDragUp),
        bottom: Math.max(0, maxDragDown),
      });
    };

    // Update on mount and after a short delay to ensure dimensions are calculated
    const timer = setTimeout(updateConstraints, 100);
    updateConstraints();
    
    window.addEventListener('resize', updateConstraints);
    window.addEventListener('orientationchange', updateConstraints);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateConstraints);
      window.removeEventListener('orientationchange', updateConstraints);
    };
  }, [currentStep]);

  // Translate title and message if they are translation keys (dot notation)
  const translatedTitle = title.includes('.') ? t(title) : title;
  const translatedMessage = message.includes('.') ? t(message, params) : message;

  return (
    <motion.div
      ref={tooltipRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      dragTransition={{ power: 0, timeConstant: 0 }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-gray-900 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/30 w-[90vw] max-w-sm cursor-grab active:cursor-grabbing touch-none"
      style={{ 
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.3)',
        maxHeight: 'calc(100vh - 32px)',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {/* Drag handle indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-500 pointer-events-none">
        <Move size={16} className="opacity-50" />
      </div>

      {/* Close button */}
      {showSkip && (
        <button
          onClick={onSkip}
          className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-1.5 transition-colors z-10"
          aria-label="Skip tutorial"
        >
          <X size={16} />
        </button>
      )}

      <div className="p-5 pt-8">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {translatedTitle}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {translatedMessage}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-green-500'
                  : index < currentStep
                  ? 'w-1.5 bg-green-500/50'
                  : 'w-1.5 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentStep + 1} of {totalSteps}
          </span>
          <div className="flex gap-2">
            {showSkip && !isLastStep && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t('tutorial.skip')}
              </button>
            )}
            <button
              onClick={onNext}
              className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {isLastStep ? t('tutorial.gotIt') : t('tutorial.next')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

