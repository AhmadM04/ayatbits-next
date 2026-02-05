'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ConfirmExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmExitModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmExitModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                {t('puzzle.exitPuzzleTitle')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 leading-relaxed">
              {t('puzzle.exitPuzzleMessage')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors whitespace-nowrap"
            >
              {t('puzzle.exitPuzzleCancel')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors border border-red-500/20 whitespace-nowrap"
            >
              {t('puzzle.exitPuzzleConfirm')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

