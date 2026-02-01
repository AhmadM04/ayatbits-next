/**
 * Performance Detection Utility
 * Detects device capabilities and conditions to determine if animations should be reduced
 */

export type PerformanceTier = 'high' | 'medium' | 'low';

export interface PerformanceMetrics {
  tier: PerformanceTier;
  shouldReduceMotion: boolean;
  batteryLevel: number | null;
  isCharging: boolean | null;
  cpuCores: number | null;
  deviceMemory: number | null;
  connectionType: string | null;
  prefersReducedMotion: boolean;
}

/**
 * Check if user prefers reduced motion (accessibility)
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get battery information
 */
export async function getBatteryInfo(): Promise<{ level: number | null; isCharging: boolean | null }> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return { level: null, isCharging: null };
  }

  try {
    // @ts-ignore - Battery API not fully typed
    const battery = await navigator.getBattery();
    return {
      level: battery.level * 100, // Convert to percentage
      isCharging: battery.charging,
    };
  } catch (error) {
    console.warn('Battery API not available:', error);
    return { level: null, isCharging: null };
  }
}

/**
 * Get CPU core count
 */
export function getCPUCores(): number | null {
  if (typeof navigator === 'undefined') return null;
  return navigator.hardwareConcurrency || null;
}

/**
 * Get device memory in GB
 */
export function getDeviceMemory(): number | null {
  if (typeof navigator === 'undefined') return null;
  // @ts-ignore - deviceMemory is not in standard types
  return navigator.deviceMemory || null;
}

/**
 * Get network connection type
 */
export function getConnectionType(): string | null {
  if (typeof navigator === 'undefined') return null;
  
  // @ts-ignore - connection API not fully typed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return null;
  return connection.effectiveType || connection.type || null;
}

/**
 * Detect if device is likely mobile based on screen size and user agent
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isMobileScreen = window.innerWidth < 768;
  
  return isMobileUA || isMobileScreen;
}

/**
 * Calculate performance tier based on all available metrics
 */
export function calculatePerformanceTier(metrics: {
  batteryLevel: number | null;
  isCharging: boolean | null;
  cpuCores: number | null;
  deviceMemory: number | null;
  connectionType: string | null;
  isMobile: boolean;
}): PerformanceTier {
  let score = 100; // Start with high performance assumption

  // Battery impact (most critical for mobile)
  if (metrics.isMobile && metrics.batteryLevel !== null && !metrics.isCharging) {
    if (metrics.batteryLevel < 20) {
      score -= 40; // Critical battery
    } else if (metrics.batteryLevel < 50) {
      score -= 20; // Low battery
    }
  }

  // CPU cores impact
  if (metrics.cpuCores !== null) {
    if (metrics.cpuCores <= 2) {
      score -= 25; // Very low core count
    } else if (metrics.cpuCores <= 4) {
      score -= 10; // Low core count
    }
  }

  // Device memory impact
  if (metrics.deviceMemory !== null) {
    if (metrics.deviceMemory <= 2) {
      score -= 25; // Very low memory
    } else if (metrics.deviceMemory <= 4) {
      score -= 10; // Low memory
    }
  }

  // Network connection impact
  if (metrics.connectionType) {
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      score -= 15;
    } else if (metrics.connectionType === '3g') {
      score -= 5;
    }
  }

  // Mobile devices are generally less powerful
  if (metrics.isMobile) {
    score -= 5;
  }

  // Determine tier based on score
  if (score >= 70) {
    return 'high';
  } else if (score >= 40) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get complete performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const prefersReducedMotion = checkPrefersReducedMotion();
  const { level: batteryLevel, isCharging } = await getBatteryInfo();
  const cpuCores = getCPUCores();
  const deviceMemory = getDeviceMemory();
  const connectionType = getConnectionType();
  const isMobile = isMobileDevice();

  const tier = calculatePerformanceTier({
    batteryLevel,
    isCharging,
    cpuCores,
    deviceMemory,
    connectionType,
    isMobile,
  });

  // Should reduce motion if:
  // 1. User prefers reduced motion (accessibility)
  // 2. Performance tier is low
  // 3. Mobile device with low battery (<20%)
  const shouldReduceMotion =
    prefersReducedMotion ||
    tier === 'low' ||
    (isMobile && batteryLevel !== null && batteryLevel < 20 && !isCharging);

  return {
    tier,
    shouldReduceMotion,
    batteryLevel,
    isCharging,
    cpuCores,
    deviceMemory,
    connectionType,
    prefersReducedMotion,
  };
}

/**
 * Listen for battery changes
 */
export async function listenToBatteryChanges(
  callback: (level: number, isCharging: boolean) => void
): Promise<(() => void) | null> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }

  try {
    // @ts-ignore
    const battery = await navigator.getBattery();
    
    const levelChangeHandler = () => callback(battery.level * 100, battery.charging);
    const chargingChangeHandler = () => callback(battery.level * 100, battery.charging);
    
    battery.addEventListener('levelchange', levelChangeHandler);
    battery.addEventListener('chargingchange', chargingChangeHandler);

    // Return cleanup function
    return () => {
      battery.removeEventListener('levelchange', levelChangeHandler);
      battery.removeEventListener('chargingchange', chargingChangeHandler);
    };
  } catch (error) {
    console.warn('Cannot listen to battery changes:', error);
    return null;
  }
}

/**
 * Listen for connection changes
 */
export function listenToConnectionChanges(callback: (type: string) => void): (() => void) | null {
  if (typeof navigator === 'undefined') return null;
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return null;

  const changeHandler = () => {
    const type = connection.effectiveType || connection.type;
    if (type) callback(type);
  };

  connection.addEventListener('change', changeHandler);

  return () => {
    connection.removeEventListener('change', changeHandler);
  };
}

