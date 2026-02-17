'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, ArrowRight, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

/**
 * LimitReachedModal
 * 
 * Shown when Free tier users exceed their 10 puzzles/day limit.
 * Blocks further puzzle interaction and encourages upgrade to Pro.
 * 
 * Features:
 * - Blocking overlay (can't dismiss by clicking outside)
 * - Clear messaging about daily limit
 * - Prominent "Upgrade to Pro" CTA
 * - Optional close button (returns to dashboard)
 */
export default function LimitReachedModal({ isOpen, onClose, onUpgrade }: LimitReachedModalProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop - Semi-transparent overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose} // Allow closing by clicking backdrop
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center"
            >
              <Lock className="w-8 h-8 text-orange-500" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-3 text-[#4A3728] dark:text-white"
          >
            {t('puzzle.limitReached') || 'Daily Limit Reached'}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center text-[#8E7F71] dark:text-gray-400 mb-6 leading-relaxed"
          >
            {t('puzzle.limitReachedMessage') || 
              "You've completed your 10 free puzzles for today! Upgrade to Pro for unlimited access to all puzzles, features, and more."}
          </motion.p>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 space-y-2"
          >
            <div className="flex items-start gap-3 text-sm">
              <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#4A3728] dark:text-gray-300">
                {t('puzzle.unlimitedPuzzles') || 'Unlimited puzzles every day'}
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#4A3728] dark:text-gray-300">
                {t('puzzle.aiTafsir') || 'AI-powered Tafsir explanations'}
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#4A3728] dark:text-gray-300">
                {t('puzzle.wordByWord') || 'Word-by-word audio recitation'}
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {/* Primary CTA - Upgrade */}
            <button
              onClick={onUpgrade}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              {t('puzzle.upgradeToPro') || 'Upgrade to Pro'}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Secondary CTA - Return to Dashboard */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-[#4A3728] dark:text-white font-medium rounded-xl transition-colors"
            >
              {t('puzzle.returnToDashboard') || 'Return to Dashboard'}
            </button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-[#8E7F71] dark:text-gray-500 mt-4"
          >
            {t('puzzle.limitResetsDaily') || 'Your free limit resets every 24 hours'}
          </motion.p>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

