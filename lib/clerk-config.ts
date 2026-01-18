/**
 * Clerk Configuration
 * 
 * This file manages Clerk keys ensuring frontend and backend use the SAME instance.
 * Uses CLERK_ENVIRONMENT variable to select between test and production instances.
 * 
 * Environment Variables:
 * - CLERK_ENVIRONMENT: 'test' or 'production' (defaults to 'test')
 * - Test: CLERK_SECRET_KEY_TEST, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST
 * - Production: CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 */

import { getClerkKeys, logClerkConfig } from './clerk-environment';
import { logInstanceValidation } from './clerk-instance-validator';

/**
 * Configure Clerk environment with consistent keys
 * This runs automatically when this module is imported
 */
export function configureClerkEnvironment(): void {
  // Only run on server-side
  if (typeof window === 'undefined') {
    const keys = getClerkKeys();
    
    // Set the standard env vars so Clerk SDK can find them
    if (keys.secretKey) {
      process.env.CLERK_SECRET_KEY = keys.secretKey;
    }
    if (keys.publishableKey) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = keys.publishableKey;
    }
    
    // Log configuration in development
    if (process.env.NODE_ENV !== 'production') {
      logClerkConfig();
      logInstanceValidation();
    }
  }
}

// Auto-configure on import (server-side only)
configureClerkEnvironment();

