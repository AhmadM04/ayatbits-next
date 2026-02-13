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

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      onClose();
    }
  }, [onClose]);

  if (!definition) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop - Lighter for day mode */}
          <motion.div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content - LIGHT THEME */}
          <motion.div
            className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl 
                       w-full max-w-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Close button - Dark on light */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 
                         transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Header with large harakat display */}
            <div 
              className="pt-12 pb-6 px-6 text-center border-b border-gray-100"
              style={{ background: `linear-gradient(135deg, ${definition.color}08, transparent)` }}
            >
              {/* Large harakat character */}
              <div 
                className="text-7xl font-arabic mb-6"
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
              <p className="text-xl text-gray-600 font-arabic" dir="rtl">
                {definition.nameArabic}
              </p>
            </div>

            {/* Content - LIGHT THEME */}
            <div className="p-6 space-y-4">
              {/* Transliteration */}
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {t('harakat.transliteration').toUpperCase()}
                </span>
                <span className="text-lg font-mono text-gray-900">
                  {definition.transliteration}
                </span>
              </div>

              {/* Sound */}
              <div className="flex items-start justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {t('harakat.sound').toUpperCase()}
                </span>
                <span className="text-base text-gray-800 text-right max-w-[60%]">
                  {getHarakatSound(definition.character, locale) || definition.sound}
                </span>
              </div>

              {/* Description */}
              <div className="py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500 uppercase tracking-wider block mb-2">
                  {t('harakat.description').toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getHarakatDescription(definition.character, locale) || definition.description}
                </p>
              </div>

              {/* Example Word */}
              <div className="py-2">
                <span className="text-sm text-gray-500 uppercase tracking-wider block mb-2">
                  {t('harakat.examples').toUpperCase()}
                </span>
                <p 
                  className="text-lg text-gray-900 font-arabic text-right"
                  dir="rtl"
                >
                  {getHarakatExampleWord(definition.character, locale) || definition.exampleWord}
                </p>
              </div>
            </div>

            {/* Footer - LIGHT THEME */}
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 
                           rounded-xl text-gray-900 font-medium transition-colors"
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

