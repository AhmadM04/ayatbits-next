import { headers } from 'next/headers';

/**
 * Get the app URL dynamically from request headers or environment variable
 * Works in both development and production
 */
export async function getAppUrl(): Promise<string> {
  // First, try environment variable (for explicit configuration)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Otherwise, get from request headers (works automatically in production)
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 
                     (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (error) {
    // Fallback if headers are not available (shouldn't happen in API routes)
    console.warn('Could not get URL from headers:', error);
  }

  // Final fallback (development only)
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Get the app URL synchronously (for client-side or when headers aren't available)
 */
export function getAppUrlSync(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }

  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

