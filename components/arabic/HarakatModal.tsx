'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { type HarakatDefinition } from '@/lib/harakat-utils';
import { useI18n } from '@/lib/i18n';
import { getHarakatName, getHarakatSound, getHarakatDescription, getHarakatExampleWord } from '@/lib/harakat-i18n';

interface HarakatModalProps {
  definition: HarakatDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HarakatModal({ definition, isOpen, onClose }: HarakatModalProps) {
  const { t, locale } = useI18n();

  // INSTANT CLOSE: Reset state immediately on close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!definition) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-100 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          />

          {/* Modal Content - Theme-aware */}
          <motion.div
            className="relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl 
                       w-full max-w-sm overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.08, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 
                         transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Header with large harakat display */}
            <div 
              className="pt-12 pb-6 px-6 text-center border-b border-gray-100 dark:border-white/10"
              style={{ background: `linear-gradient(135deg, ${definition.color}08, transparent)` }}
            >
              {/* Large harakat character - Centered */}
              <div 
                className="text-7xl font-arabic mb-6 flex items-center justify-center"
                style={{ 
                  color: definition.color,
                  lineHeight: '1.4',
                  paddingBottom: '0.5rem'
                }}
                dir="rtl"
              >
                {definition.example}
              </div>

              {/* Names */}
              <h2 
                className="text-2xl font-bold mb-1 mt-2"
                style={{ color: definition.color }}
              >
                {getHarakatName(definition.character, locale) || definition.nameEnglish}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-arabic flex items-center justify-center" dir="rtl">
                {definition.nameArabic}
              </p>
            </div>

            {/* Content - Theme-aware */}
            <div className="p-6 space-y-4">
              {/* Transliteration */}
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('harakat.transliteration').toUpperCase()}
                </span>
                <span className="text-lg font-mono text-gray-900 dark:text-white">
                  {definition.transliteration}
                </span>
              </div>

              {/* Sound */}
              <div className="flex items-start justify-between py-2 border-b border-gray-200 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('harakat.sound').toUpperCase()}
                </span>
                <span className="text-base text-gray-800 dark:text-gray-200 text-right max-w-[60%]">
                  {getHarakatSound(definition.character, locale) || definition.sound}
                </span>
              </div>

              {/* Description */}
              <div className="py-2 border-b border-gray-200 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  {t('harakat.description').toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {getHarakatDescription(definition.character, locale) || definition.description}
                </p>
              </div>

              {/* Example Word */}
              <div className="py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  {t('harakat.examples').toUpperCase()}
                </span>
                <p 
                  className="text-lg text-gray-900 dark:text-white font-arabic text-right"
                  dir="rtl"
                >
                  {getHarakatExampleWord(definition.character, locale) || definition.exampleWord}
                </p>
              </div>
            </div>

            {/* Footer - Theme-aware */}
            <div className="px-6 pb-6">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 
                           border border-gray-200 dark:border-white/10 rounded-xl 
                           text-gray-900 dark:text-white font-medium transition-colors"
              >
                {t('common.gotIt')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

