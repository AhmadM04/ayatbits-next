'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  /** Duration in milliseconds before the splash screen fades out */
  duration?: number;
  /** Callback when splash screen finishes */
  onFinish?: () => void;
}

/**
 * SplashScreen Component
 * 
 * Displays a branded splash screen during initial app load.
 * Mimics the PWA splash screen for a seamless user experience.
 * 
 * Features:
 * - Brand green background matching the PWA splash
 * - Animated AyatBits logo with fade-in and scale effects
 * - Automatic dismissal after specified duration
 * - Smooth fade-out transition
 */
export default function SplashScreen({ duration = 2000, onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        // Wait for fade-out animation to complete
        setTimeout(onFinish, 500);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          }}
        >
          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.6, 
              ease: 'easeOut',
              delay: 0.2 
            }}
            className="flex flex-col items-center gap-6"
          >
            {/* Main Icon */}
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: 'easeOut',
                delay: 0.4 
              }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20">
                <span className="text-7xl font-bold text-white" style={{ fontFamily: 'Arial' }}>
                  أ
                </span>
              </div>
            </motion.div>

            {/* Logo Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                ease: 'easeOut',
                delay: 0.6 
              }}
            >
              <Image
                src="/ayatbits-logo.svg"
                alt="AyatBits"
                width={180}
                height={48}
                priority
                className="drop-shadow-lg"
                style={{ filter: 'brightness(0) invert(1)' }} // Make logo white
              />
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.8 
              }}
              className="flex gap-2 mt-4"
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-white/60 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

