'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  getPerformanceMetrics,
  listenToBatteryChanges,
  listenToConnectionChanges,
  checkPrefersReducedMotion,
  PerformanceMetrics,
  PerformanceTier,
} from '@/lib/performance-detection';

interface MotionContextType {
  shouldReduceMotion: boolean;
  performanceTier: PerformanceTier;
  metrics: PerformanceMetrics | null;
  forceReducedMotion: (force: boolean) => void;
  refreshPerformanceCheck: () => Promise<void>;
  isLoading: boolean;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

const STORAGE_KEY = 'ayatbits-reduced-motion-override';

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Check for manual override from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setManualOverride(stored === 'true');
    }
  }, []);

  // Initial performance check
  const checkPerformance = useCallback(async () => {
    setIsLoading(true);
    try {
      const newMetrics = await getPerformanceMetrics();
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      // Fallback to safe defaults
      setMetrics({
        tier: 'medium',
        shouldReduceMotion: checkPrefersReducedMotion(),
        batteryLevel: null,
        isCharging: null,
        cpuCores: null,
        deviceMemory: null,
        connectionType: null,
        prefersReducedMotion: checkPrefersReducedMotion(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial check
  useEffect(() => {
    checkPerformance();
  }, [checkPerformance]);

  // Listen for battery changes
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const setupBatteryListener = async () => {
      cleanup = await listenToBatteryChanges((level, isCharging) => {
        // Only re-check if significant battery change
        if (metrics) {
          const prevLevel = metrics.batteryLevel || 100;
          const levelDiff = Math.abs(level - prevLevel);
          
          // Re-check if battery crosses 20% threshold or charging status changes
          if (
            (prevLevel >= 20 && level < 20) ||
            (prevLevel < 20 && level >= 20) ||
            isCharging !== metrics.isCharging ||
            levelDiff >= 10
          ) {
            checkPerformance();
          }
        }
      });
    };

    setupBatteryListener();

    return () => {
      if (cleanup) cleanup();
    };
  }, [checkPerformance, metrics]);

  // Listen for connection changes
  useEffect(() => {
    const cleanup = listenToConnectionChanges(() => {
      // Re-check performance when connection changes
      checkPerformance();
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [checkPerformance]);

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handler = () => {
      checkPerformance();
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Legacy browsers
      // @ts-ignore
      mediaQuery.addListener(handler);
      // @ts-ignore
      return () => mediaQuery.removeListener(handler);
    }
  }, [checkPerformance]);

  // Force reduced motion (manual override)
  const forceReducedMotion = useCallback((force: boolean) => {
    setManualOverride(force);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(force));
    }
  }, []);

  // Determine final shouldReduceMotion value
  const shouldReduceMotion = manualOverride !== null 
    ? manualOverride 
    : (metrics?.shouldReduceMotion ?? true); // Default to reduced motion for safety

  const performanceTier = metrics?.tier ?? 'medium';

  const value: MotionContextType = {
    shouldReduceMotion,
    performanceTier,
    metrics,
    forceReducedMotion,
    refreshPerformanceCheck: checkPerformance,
    isLoading,
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
}

