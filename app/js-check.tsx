'use client';

import { useEffect } from 'react';

export default function JSCheck() {
  useEffect(() => {
    // This confirms JavaScript is working
    console.log('✅ JavaScript is enabled and working');
    
    // Log performance metrics
    if (typeof window !== 'undefined' && window.performance) {
      const perf = window.performance;
      const nav = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (nav) {
        console.log('Performance metrics:', {
          'DOM Content Loaded': `${Math.round(nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart)}ms`,
          'Page Load': `${Math.round(nav.loadEventEnd - nav.loadEventStart)}ms`,
          'Total Load Time': `${Math.round(nav.loadEventEnd - nav.fetchStart)}ms`,
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything
}

