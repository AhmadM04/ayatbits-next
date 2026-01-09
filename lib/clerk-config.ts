/**
 * Clerk Configuration
 * 
 * This file manages Clerk keys for both development and production environments.
 * It automatically selects the appropriate keys based on NODE_ENV.
 * 
 * Environment Variables:
 * - Production: CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 * - Development: CLERK_SECRET_KEY_TEST, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST
 * - iOS: CLERK_PUBLISHABLE_KEY, APPLE_BUNDLE_ID
 */

/**
 * Get the appropriate Clerk publishable key based on environment
 */
export function getClerkPublishableKey(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, use the standard NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
           process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST || 
           '';
  }
  
  // In development, use the _TEST version
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST || 
         'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k';
}

/**
 * Get the appropriate Clerk secret key based on environment
 * This is used server-side only
 */
export function getClerkSecretKey(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // In production, use the standard CLERK_SECRET_KEY
    return process.env.CLERK_SECRET_KEY || 
           process.env.CLERK_SECRET_KEY_TEST || 
           '';
  }
  
  // In development, use the _TEST version
  return process.env.CLERK_SECRET_KEY_TEST || '';
}

/**
 * Set the appropriate Clerk secret key in the environment
 * This ensures Clerk SDK uses the correct key
 */
export function configureClerkEnvironment(): void {
  // Only run on server-side
  if (typeof window === 'undefined') {
    const secretKey = getClerkSecretKey();
    
    // If we're in development and only have _TEST keys, set them to the standard env vars
    // so Clerk SDK can find them
    if (process.env.NODE_ENV !== 'production' && secretKey && !process.env.CLERK_SECRET_KEY) {
      process.env.CLERK_SECRET_KEY = secretKey;
    }
  }
}

// Auto-configure on import (server-side only)
configureClerkEnvironment();

