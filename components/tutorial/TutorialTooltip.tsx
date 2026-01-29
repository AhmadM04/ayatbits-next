'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-gray-900 backdrop-blur-md rounded-2xl shadow-2xl border border-green-500/30 max-w-sm"
      style={{ 
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.3)',
      }}
    >
      {/* Close button */}
      {showSkip && (
        <button
          onClick={onSkip}
          className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-1.5 transition-colors"
          aria-label="Skip tutorial"
        >
          <X size={16} />
        </button>
      )}

      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {message}
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
                Skip
              </button>
            )}
            <button
              onClick={onNext}
              className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {isLastStep ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

