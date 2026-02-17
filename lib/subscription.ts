import { SubscriptionStatusEnum, type IUser } from '@/lib/models/User';
import { User } from '@/lib/db';
import { logger } from '@/lib/logger';

const DAY_IN_MS = 86_400_000;

/**
 * Finds a user by Clerk ID with fallback to email lookup.
 * This is useful when admin grants access to users who haven't signed in yet,
 * or when Clerk ID hasn't been synced properly.
 * 
 * @param clerkId - The Clerk user ID
 * @param email - Optional email address for fallback lookup
 * @returns User document or null
 */
export const findUserRobust = async (clerkId: string, email?: string): Promise<IUser | null> => {
  try {
    // 1. Try by Clerk ID first (most common case)
    let user = await User.findOne({ clerkIds: clerkId });
    
    if (user) {
      return user;
    }
    
    // 2. If not found and email provided, try by email
    if (email) {
      const emailLower = email.toLowerCase();
      user = await User.findOne({ 
        email: { $regex: new RegExp(`^${emailLower}$`, 'i') } 
      });
      
      if (user) {
        // Found by email! This means Clerk ID needs to be synced
        logger.info('User found by email but not by clerkId - syncing clerkId', {
          clerkId,
          email: emailLower,
          existingClerkIds: user.clerkIds || [],
        });
        
        // Add clerkId to user for future lookups
        if (!user.clerkIds) {
          user.clerkIds = [];
        }
        if (!user.clerkIds.includes(clerkId)) {
          user.clerkIds.push(clerkId);
          await user.save();
          logger.info('ClerkId synced successfully', {
            clerkId,
            email: emailLower,
          });
        }
        
        return user;
      }
    }
    
    return null;
  } catch (error) {
    logger.error('Error in findUserRobust', error instanceof Error ? error : undefined, {
      clerkId,
      email,
    });
    return null;
  }
};

/**
 * Checks if a user has a valid active subscription or lifetime access.
 */
export const checkSubscription = (user: IUser) => {
  // Direct Access (Admin-granted bypass)
  if (user.hasDirectAccess) {
    return true;
  }

  // Admin/Lifetime Access
  if (
    user.subscriptionPlan === 'lifetime' && 
    user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE
  ) {
    return true;
  }

  // Active Subscription (Monthly/Yearly) or Trialing
  if (
    (user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE ||
     user.subscriptionStatus === SubscriptionStatusEnum.TRIALING) &&
    user.subscriptionEndDate &&
    new Date(user.subscriptionEndDate).getTime() + DAY_IN_MS > Date.now()
  ) {
    return true;
  }

  // Trial Period
  if (
    user.trialEndsAt &&
    new Date(user.trialEndsAt).getTime() + DAY_IN_MS > Date.now()
  ) {
    return true;
  }

  return false;
};

/**
 * Alias for checkSubscription to resolve import errors in dashboard-access.ts
 */
export const checkSubscriptionAccess = checkSubscription;

/**
 * Gets the user's subscription tier.
 * Returns 'basic' | 'pro' | null
 */
export const getUserTier = (user: IUser): 'basic' | 'pro' | null => {
  // If user doesn't have active subscription, return null
  if (!checkSubscription(user)) {
    return null;
  }

  // If user has explicit tier set, return it
  if (user.subscriptionTier) {
    return user.subscriptionTier;
  }

  // Legacy users or admin-granted access default to basic
  // (can be upgraded through migration script or admin panel)
  return 'basic';
};

/**
 * Checks if a user has Pro tier access.
 * Pro tier includes word-by-word audio and AI tafsir features.
 */
export const checkProAccess = (user: IUser): boolean => {
  // User must have active subscription first
  if (!checkSubscription(user)) {
    return false;
  }

  // Check for explicit Pro tier
  if (user.subscriptionTier === 'pro') {
    return true;
  }

  // Admin-granted access (hasDirectAccess) gets Pro features
  if (user.hasDirectAccess) {
    return true;
  }

  return false;
};

/**
 * Calculates total days left in the current plan (subscription or trial).
 * Returns Infinity for lifetime.
 */
export const getDaysLeft = (user: IUser) => {
  if (
    user.subscriptionPlan === 'lifetime' && 
    user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE
  ) {
    return Infinity;
  }

  if (user.subscriptionEndDate) {
    const diff = new Date(user.subscriptionEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / DAY_IN_MS));
  }

  if (user.trialEndsAt) {
    const diff = new Date(user.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / DAY_IN_MS));
  }

  return 0;
};

/**
 * Calculates specifically the remaining trial days.
 * Returns 0 if no trial is active or if it has expired.
 */
export const getTrialDaysRemaining = (user: IUser) => {
  if (user.trialEndsAt) {
    const diff = new Date(user.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / DAY_IN_MS));
  }
  return 0;
};

/**
 * Gets the current effective plan for a user.
 * Returns: 'free' | 'basic' | 'pro'
 * 
 * Logic:
 * 1. If user has active Stripe subscription -> return subscriptionTier
 * 2. If user has admin access -> return 'pro'
 * 3. If user has active trial -> return trialPlan
 * 4. Otherwise -> return 'free' (10 puzzle/day limit)
 */
export const getCurrentPlan = (user: IUser): 'free' | 'basic' | 'pro' => {
  // Admin or Direct Access gets Pro
  if (user.hasDirectAccess || user.role === 'admin') {
    return 'pro';
  }

  // Active Stripe Subscription
  if (
    user.stripeCustomerId &&
    (user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE ||
     user.subscriptionStatus === SubscriptionStatusEnum.TRIALING) &&
    user.subscriptionEndDate &&
    new Date(user.subscriptionEndDate).getTime() > Date.now()
  ) {
    return user.subscriptionTier || 'basic';
  }

  // Lifetime subscription
  if (
    user.subscriptionPlan === 'lifetime' &&
    user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE
  ) {
    return user.subscriptionTier || 'pro';
  }

  // Active Trial (Stripe-managed trials)
  // Note: With Stripe-managed trials, hasUsedTrial is set to true immediately when trial starts
  // So we check subscriptionStatus for 'trialing' instead of hasUsedTrial
  if (
    user.trialStartedAt &&
    user.trialPlan &&
    user.subscriptionStatus === SubscriptionStatusEnum.TRIALING
  ) {
    const trialStart = new Date(user.trialStartedAt).getTime();
    const trialEnd = trialStart + (7 * DAY_IN_MS);
    
    if (Date.now() < trialEnd) {
      return user.trialPlan; // Return 'basic' or 'pro'
    }
  }

  // Legacy trial check (trialEndsAt)
  if (
    user.trialEndsAt &&
    new Date(user.trialEndsAt).getTime() > Date.now()
  ) {
    return user.subscriptionTier || 'basic';
  }

  // Default: Free tier (10 puzzles/day limit + unlimited Mushaf)
  return 'free';
};

/**
 * Check if user's trial is currently active.
 */
export const isTrialActive = (user: IUser): boolean => {
  if (!user.trialStartedAt || !user.trialPlan) {
    return false;
  }

  const trialStart = new Date(user.trialStartedAt).getTime();
  const trialEnd = trialStart + (7 * DAY_IN_MS);
  
  return Date.now() < trialEnd;
};

/**
 * Get days remaining in trial.
 * Returns 0 if no trial is active.
 */
export const getTrialDaysLeft = (user: IUser): number => {
  if (!user.trialStartedAt || !user.trialPlan) {
    return 0;
  }

  const trialStart = new Date(user.trialStartedAt).getTime();
  const trialEnd = trialStart + (7 * DAY_IN_MS);
  const now = Date.now();

  if (now >= trialEnd) {
    return 0;
  }

  return Math.ceil((trialEnd - now) / DAY_IN_MS);
};