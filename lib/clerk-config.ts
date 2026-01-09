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
 * Configure Clerk environment to use test keys in development
 * This runs automatically when this module is imported
 */
export function configureClerkEnvironment(): void {
  // Only run on server-side
  if (typeof window === 'undefined') {
    // Prefer _TEST keys (for development), fall back to standard keys (for production)
    const secretKey = process.env.CLERK_SECRET_KEY_TEST || process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    // Set the standard env vars so Clerk SDK can find them
    if (secretKey) {
      process.env.CLERK_SECRET_KEY = secretKey;
    }
    if (publishableKey) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
    }
  }
}

// Auto-configure on import (server-side only)
configureClerkEnvironment();

