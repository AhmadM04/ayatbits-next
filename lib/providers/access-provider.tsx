'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// ============================================================================
// PERFORMANCE OPTIMIZATION: Centralized Access Control
// ============================================================================
// This provider ensures /api/check-access is called ONLY ONCE per session
// instead of multiple times across different components (3+ redundant calls).
// 
// Benefits:
// - Single source of truth for access status
// - Eliminates redundant API calls
// - Reduces load on backend
// - Faster page loads
// ============================================================================

interface AccessContextValue {
  /** Whether user has dashboard/pro access (null = loading) */
  hasAccess: boolean | null;
  /** Whether access check is in progress */
  isLoading: boolean;
  /** Error message if access check failed */
  error: string | null;
  /** Refetch access status (useful after subscription changes) */
  refetch: () => Promise<void>;
}

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

interface AccessProviderProps {
  children: React.ReactNode;
}

export function AccessProvider({ children }: AccessProviderProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // DEDUPLICATION: Prevent multiple simultaneous requests
  const fetchInProgressRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchAccess = async () => {
    // Prevent duplicate fetches if one is already in progress
    if (fetchInProgressRef.current) {
      console.log('[AccessProvider] Fetch already in progress, skipping...');
      return;
    }

    fetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AccessProvider] Fetching access status...');
      
      const response = await fetch('/api/check-access', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[AccessProvider] Access status:', data.hasAccess);
        setHasAccess(data.hasAccess);
        hasFetchedRef.current = true;
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[AccessProvider] Access check failed:', data.error);
        setError(data.error || 'Failed to check access');
        setHasAccess(false);
      }
    } catch (err) {
      console.error('[AccessProvider] Network error:', err);
      setError('Network error');
      setHasAccess(false);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  // Initial fetch on mount - ONLY ONCE
  useEffect(() => {
    // Skip if already fetched (prevents double-fetch in Strict Mode)
    if (hasFetchedRef.current) {
      console.log('[AccessProvider] Already fetched, skipping...');
      return;
    }

    fetchAccess();
  }, []); // Empty dependency array = run once on mount

  const value: AccessContextValue = {
    hasAccess,
    isLoading,
    error,
    refetch: fetchAccess,
  };

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

/**
 * Hook to access the access control context
 * @throws Error if used outside AccessProvider
 * @returns Access control state and refetch function
 * 
 * @example
 * ```tsx
 * const { hasAccess, isLoading, error, refetch } = useAccess();
 * 
 * if (isLoading) return <Spinner />;
 * if (!hasAccess) return <UpgradePrompt />;
 * return <ProFeature />;
 * ```
 */
export function useAccess(): AccessContextValue {
  const context = useContext(AccessContext);
  
  if (!context) {
    throw new Error('useAccess must be used within AccessProvider');
  }
  
  return context;
}

