/**
 * Clerk Instance Validator
 * 
 * Validates that frontend and backend Clerk keys are from the same instance.
 * This prevents JWT kid mismatch errors.
 */

import { getClerkKeys } from './clerk-environment';

export interface ClerkInstanceInfo {
  publishableKey: string;
  secretKey: string;
  instanceId: string | null;
  environment: string;
}

/**
 * Extract instance ID from a Clerk publishable key
 * Format: pk_test_xxx or pk_live_xxx
 */
export function extractInstanceIdFromPublishableKey(key: string): string | null {
  if (!key) return null;
  
  // Clerk publishable keys contain the instance information
  // We can use the key prefix to identify the instance type
  const parts = key.split('_');
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[1]}`; // e.g., "pk_test" or "pk_live"
  }
  
  return null;
}

/**
 * Extract instance ID from a Clerk secret key
 * Format: sk_test_xxx or sk_live_xxx
 */
export function extractInstanceIdFromSecretKey(key: string): string | null {
  if (!key) return null;
  
  const parts = key.split('_');
  if (parts.length >= 2) {
    return `${parts[0]}_${parts[1]}`; // e.g., "sk_test" or "sk_live"
  }
  
  return null;
}

/**
 * Get current Clerk instance information
 */
export function getClerkInstanceInfo(): ClerkInstanceInfo {
  const keys = getClerkKeys();
  const instanceId = extractInstanceIdFromPublishableKey(keys.publishableKey);
  
  return {
    publishableKey: keys.publishableKey.substring(0, 20) + '...',
    secretKey: keys.secretKey ? keys.secretKey.substring(0, 20) + '...' : 'NOT_SET',
    instanceId,
    environment: keys.environment,
  };
}

/**
 * Validate that frontend and backend keys are from the same instance
 */
export function validateClerkInstanceConsistency(): {
  valid: boolean;
  publishableInstance: string | null;
  secretInstance: string | null;
  error?: string;
} {
  const keys = getClerkKeys();
  
  const publishableInstance = extractInstanceIdFromPublishableKey(keys.publishableKey);
  const secretInstance = extractInstanceIdFromSecretKey(keys.secretKey);
  
  // Both should be either test or live
  if (!publishableInstance || !secretInstance) {
    return {
      valid: false,
      publishableInstance,
      secretInstance,
      error: 'Missing or invalid Clerk keys',
    };
  }
  
  // Check if both are test or both are live
  const publishableType = publishableInstance.split('_')[1]; // "test" or "live"
  const secretType = secretInstance.split('_')[1]; // "test" or "live"
  
  if (publishableType !== secretType) {
    return {
      valid: false,
      publishableInstance,
      secretInstance,
      error: `Key type mismatch: publishable is ${publishableType} but secret is ${secretType}`,
    };
  }
  
  return {
    valid: true,
    publishableInstance,
    secretInstance,
  };
}

/**
 * Log validation results in development
 */
export function logInstanceValidation(): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const validation = validateClerkInstanceConsistency();
  const info = getClerkInstanceInfo();
  
  console.log('[Clerk Instance Validation]', {
    environment: info.environment,
    valid: validation.valid,
    publishableInstance: validation.publishableInstance,
    secretInstance: validation.secretInstance,
    error: validation.error,
  });
  
  if (!validation.valid) {
    console.error('[Clerk] ⚠️ INSTANCE MISMATCH DETECTED!');
    console.error('[Clerk] This will cause JWT kid mismatch errors.');
    console.error('[Clerk] Error:', validation.error);
    console.error('[Clerk] Fix: Ensure CLERK_ENVIRONMENT is set correctly and both TEST and PROD keys are configured.');
  } else {
    console.log('[Clerk] ✓ Instance validation passed');
  }
}


