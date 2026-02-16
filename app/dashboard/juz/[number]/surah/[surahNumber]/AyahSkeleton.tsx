'use client';

import { motion } from 'framer-motion';

/**
 * Skeleton loader for Ayah transitions
 * Provides visual feedback during client-side navigation
 */
export default function AyahSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Arabic Text Card Skeleton */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6"
      >
        {/* Arabic Text Lines */}
        <div className="space-y-3 mb-4">
          <div className="h-12 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-lg w-full" />
          <div className="h-12 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-lg w-5/6" />
          <div className="h-12 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-lg w-4/6" />
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/5">
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-full" />
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-full" />
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-full" />
          </div>
          <div className="w-20 h-10 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-lg" />
        </div>
      </motion.div>

      {/* Translation Card Skeleton */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6"
      >
        <div className="space-y-2">
          <div className="h-5 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded w-full" />
          <div className="h-5 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded w-11/12" />
          <div className="h-5 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded w-10/12" />
          <div className="h-5 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded w-9/12" />
        </div>
      </motion.div>

      {/* Buttons Skeleton */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="space-y-4"
      >
        {/* Ayah Selector */}
        <div className="flex justify-center">
          <div className="h-10 w-32 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded-lg" />
        </div>

        {/* Start Puzzle Button */}
        <div className="h-14 bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 rounded-2xl" />

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded" />
          <div className="w-1 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 dark:from-white/10 to-gray-300 dark:to-white/5 rounded" />
        </div>
      </motion.div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center pt-2">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-emerald-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal overlay skeleton for faster perceived performance
 * Shows while keeping previous content visible
 */
export function AyahOverlaySkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-3 h-3 bg-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-3 h-3 bg-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-3 h-3 bg-emerald-500 rounded-full"
          />
        </div>
        <p className="text-sm font-medium text-[#4A3728] dark:text-white">
          Loading ayah...
        </p>
      </div>
    </motion.div>
  );
}

