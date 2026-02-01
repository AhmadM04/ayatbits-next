import { SubscriptionStatusEnum, type IUser } from '@/lib/models/User';

const DAY_IN_MS = 86_400_000;

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

  // Active Subscription (Monthly/Yearly)
  if (
    user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE &&
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