'use client';

import { motion } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect, useRef } from 'react';

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
      
      // Calculate centered position
      const centerX = vw / 2;
      const centerY = vh / 2;
      
      // Padding from edges
      const padding = 16;
      
      // Since the tooltip is centered with translate(-50%, -50%),
      // we need to calculate constraints from the center point
      // The tooltip can drag as far as it needs to stay within bounds
      
      // How far can we drag left before left edge hits padding?
      const maxDragLeft = centerX - (tooltipWidth / 2) - padding;
      
      // How far can we drag right before right edge hits padding?
      const maxDragRight = vw - centerX - (tooltipWidth / 2) - padding;
      
      // How far can we drag up before top edge hits padding?
      const maxDragUp = centerY - (tooltipHeight / 2) - padding;
      
      // How far can we drag down before bottom edge hits padding?
      const maxDragDown = vh - centerY - (tooltipHeight / 2) - padding;
      
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
  const translatedMessage = message.includes('.') ? t(message) : message;

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

