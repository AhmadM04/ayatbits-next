'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * UserSyncProvider
 * 
 * Ensures that Clerk users are synced to the MongoDB database.
 * This component runs on dashboard load as a backup to the Clerk webhook.
 * 
 * Why this is needed:
 * - Clerk webhooks might not be configured or could fail
 * - Users who signed up before webhook was configured need to be synced
 * - Provides a reliable fallback to ensure users are always in the database
 * 
 * This solves the issue where users exist in Clerk but not in the database,
 * causing "No user found" errors when admins try to grant access.
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      // Trigger user sync on dashboard load
      // This is a fire-and-forget operation - we don't wait for it
      fetch('/api/user/sync', { 
        method: 'POST',
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            console.warn('User sync failed:', response.status);
          }
        })
        .catch(err => {
          console.error('Failed to sync user:', err);
        });
    }
  }, [userId, isLoaded]);

  return <>{children}</>;
}

