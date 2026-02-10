/**
 * Clerk Performance Optimizations
 * 
 * This module provides optimizations to reduce unnecessary token refresh calls
 * and improve navigation performance when using Clerk authentication.
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

/**
 * Token cache to reduce redundant getToken calls
 */
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Get cached token or fetch new one
 * This reduces the frequency of token refresh calls by caching tokens
 * until they're close to expiration (5 minutes buffer)
 */
export async function getCachedToken(
  getToken: () => Promise<string | null>,
  cacheKey: string = 'default'
): Promise<string | null> {
  const now = Date.now();
  const cached = tokenCache.get(cacheKey);
  
  // Return cached token if it's still valid (more than 5 minutes until expiry)
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.token;
  }
  
  // Fetch new token
  const token = await getToken();
  
  if (token) {
    // Cache token for 55 minutes (tokens are valid for 1 hour)
    tokenCache.set(cacheKey, {
      token,
      expiresAt: now + 55 * 60 * 1000,
    });
  }
  
  return token;
}

/**
 * Clear token cache (useful on sign out)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

/**
 * Hook to optimize auth state checks
 * Reduces unnecessary re-renders and token refresh calls
 */
export function useOptimizedAuth() {
  const auth = useAuth();
  const lastCheckRef = useRef<number>(0);
  const THROTTLE_MS = 1000; // Only check auth state once per second
  
  // Throttle auth state checks
  const shouldCheckAuth = () => {
    const now = Date.now();
    if (now - lastCheckRef.current < THROTTLE_MS) {
      return false;
    }
    lastCheckRef.current = now;
    return true;
  };
  
  // Clear token cache on sign out
  useEffect(() => {
    if (!auth.userId) {
      clearTokenCache();
    }
  }, [auth.userId]);
  
  return {
    ...auth,
    shouldCheckAuth,
  };
}

/**
 * Prefetch and cache auth token on mount
 * This ensures the token is ready when needed, reducing perceived latency
 */
export function usePrefetchToken() {
  const { getToken } = useAuth();
  const hasPrefetched = useRef(false);
  
  useEffect(() => {
    if (!hasPrefetched.current) {
      hasPrefetched.current = true;
      // Prefetch token in the background
      getCachedToken(getToken).catch(() => {
        // Silently fail - token will be fetched when needed
      });
    }
  }, [getToken]);
}

