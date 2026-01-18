/**
 * Clerk Environment Selector
 * 
 * Ensures frontend and backend use keys from the SAME Clerk instance.
 * This prevents JWT kid mismatch errors.
 * 
 * Usage:
 * - Set CLERK_ENVIRONMENT=test for development
 * - Set CLERK_ENVIRONMENT=production for production
 */

export type ClerkEnvironment = 'test' | 'production';

export interface ClerkKeys {
  publishableKey: string;
  secretKey: string;
  environment: ClerkEnvironment;
}

/**
 * Get the selected Clerk environment from environment variables
 */
export function getClerkEnvironment(): ClerkEnvironment {
  const env = process.env.NEXT_PUBLIC_CLERK_ENVIRONMENT?.toLowerCase() || process.env.CLERK_ENVIRONMENT?.toLowerCase();
  
  if (env === 'production') {
    return 'production';
  }
  
  // Default to test for development
  return 'test';
}

/**
 * Get Clerk keys for the selected environment
 * Ensures both frontend and backend use matching keys
 */
export function getClerkKeys(): ClerkKeys {
  const environment = getClerkEnvironment();
  
  if (environment === 'test') {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST || '';
    const secretKey = process.env.CLERK_SECRET_KEY_TEST || '';
    
    if (!publishableKey) {
      console.warn('[Clerk] Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST for test environment');
    }
    if (!secretKey && typeof window === 'undefined') {
      console.warn('[Clerk] Missing CLERK_SECRET_KEY_TEST for test environment');
    }
    
    return {
      publishableKey,
      secretKey,
      environment: 'test',
    };
  }
  
  // Production environment
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const secretKey = process.env.CLERK_SECRET_KEY || '';
  
  if (!publishableKey) {
    console.warn('[Clerk] Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY for production environment');
  }
  if (!secretKey && typeof window === 'undefined') {
    console.warn('[Clerk] Missing CLERK_SECRET_KEY for production environment');
  }
  
  return {
    publishableKey,
    secretKey,
    environment: 'production',
  };
}

/**
 * Get publishable key for client-side usage
 */
export function getClerkPublishableKey(): string {
  return getClerkKeys().publishableKey;
}

/**
 * Get secret key for server-side usage
 */
export function getClerkSecretKey(): string {
  return getClerkKeys().secretKey;
}

/**
 * Log current Clerk configuration (development only)
 */
export function logClerkConfig(): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const keys = getClerkKeys();
  console.log('[Clerk Environment]', {
    environment: keys.environment,
    publishableKeyPrefix: keys.publishableKey.substring(0, 20) + '...',
    hasSecretKey: !!keys.secretKey,
  });
}

