'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { type HarakatDefinition } from '@/lib/harakat-utils';
import { useI18n } from '@/lib/i18n';
import { getHarakatSound, getHarakatDescription } from '@/lib/harakat-i18n';

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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl 
                       w-full max-w-sm overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 
                         transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Header with large harakat display */}
            <div 
              className="pt-8 pb-6 px-6 text-center border-b border-white/5"
              style={{ background: `linear-gradient(135deg, ${definition.color}10, transparent)` }}
            >
              {/* Large harakat character */}
              <div 
                className="text-7xl font-arabic mb-3"
                style={{ color: definition.color }}
                dir="rtl"
              >
                {definition.example}
              </div>

              {/* Names */}
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: definition.color }}
              >
                {definition.nameEnglish}
              </h2>
              <p className="text-xl text-gray-300 font-arabic" dir="rtl">
                {definition.nameArabic}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Transliteration */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {t('harakat.transliteration').toUpperCase()}
                </span>
                <span className="text-lg font-mono text-white">
                  {definition.transliteration}
                </span>
              </div>

              {/* Sound */}
              <div className="flex items-start justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {t('harakat.sound').toUpperCase()}
                </span>
                <span className="text-base text-gray-200 text-right max-w-[60%]">
                  {getHarakatSound(definition.character, locale) || definition.sound}
                </span>
              </div>

              {/* Description */}
              <div className="py-2 border-b border-white/5">
                <span className="text-sm text-gray-500 uppercase tracking-wider block mb-2">
                  {t('harakat.description').toUpperCase()}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {getHarakatDescription(definition.character, locale) || definition.description}
                </p>
              </div>

              {/* Example Word */}
              <div className="py-2">
                <span className="text-sm text-gray-500 uppercase tracking-wider block mb-2">
                  {t('harakat.examples').toUpperCase()}
                </span>
                <p 
                  className="text-lg text-white font-arabic text-right"
                  dir="rtl"
                >
                  {definition.exampleWord}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 
                           rounded-xl text-white font-medium transition-colors"
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

