'use client';

import { motion } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface TutorialTooltipProps {
  title: string;
  message: string;
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
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  placement = 'bottom',
  showSkip = true,
}: TutorialTooltipProps) {
  const isLastStep = currentStep === totalSteps - 1;
  const { t, locale } = useI18n();
  const [dragConstraints, setDragConstraints] = useState({
    top: -100,
    bottom: 100,
    left: -100,
    right: 100,
  });

  // Update drag constraints based on viewport size to keep tooltip within bounds
  useEffect(() => {
    const updateConstraints = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      const isMobile = vw < 768;
      const tooltipWidth = isMobile ? Math.min(vw * 0.9, 340) : 384; // max-w-sm
      const tooltipHeight = 280; // estimated height with some padding
      
      // Calculate the maximum distance the tooltip can be dragged from its centered position
      // while still keeping it fully visible on screen
      const centerX = vw / 2;
      const centerY = vh / 2;
      
      // Add padding to prevent touching the edges
      const padding = 20;
      
      // Calculate max distances in each direction to keep tooltip fully visible
      // The tooltip is centered, so we need to calculate how far it can move in each direction
      
      // Left: tooltip left edge should stay at padding distance from left edge
      // centerX - tooltipWidth/2 is current left edge position
      // It can move left by: (centerX - tooltipWidth/2 - padding)
      const maxLeft = Math.max(0, centerX - (tooltipWidth / 2) - padding);
      
      // Right: tooltip right edge should stay at padding distance from right edge
      // centerX + tooltipWidth/2 is current right edge position
      // It can move right by: (vw - padding - centerX - tooltipWidth/2)
      const maxRight = Math.max(0, vw - padding - centerX - (tooltipWidth / 2));
      
      // Top: tooltip top edge should stay at padding distance from top edge
      const maxTop = Math.max(0, centerY - (tooltipHeight / 2) - padding);
      
      // Bottom: tooltip bottom edge should stay at padding distance from bottom edge
      const maxBottom = Math.max(0, vh - padding - centerY - (tooltipHeight / 2));
      
      setDragConstraints({
        top: -maxTop,
        bottom: maxBottom,
        left: -maxLeft,
        right: maxRight,
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    window.addEventListener('orientationchange', updateConstraints);
    return () => {
      window.removeEventListener('resize', updateConstraints);
      window.removeEventListener('orientationchange', updateConstraints);
    };
  }, []);

  // Translate title and message if they are translation keys (dot notation)
  const translatedTitle = title.includes('.') ? t(title) : title;
  const translatedMessage = message.includes('.') ? t(message) : message;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={dragConstraints}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-gray-900 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/30 w-[90vw] max-w-sm cursor-grab active:cursor-grabbing touch-none overflow-hidden"
      style={{ 
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.3)',
        maxHeight: 'calc(100vh - 40px)',
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

