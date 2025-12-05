import { SubscriptionStatusEnum, type IUser } from '@/lib/models/User';

const DAY_IN_MS = 86_400_000;

export const checkSubscription = (user: IUser) => {
  // Admin/Lifetime Access
  // We check if the plan is 'lifetime' AND status is active.
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
  // Check if status is TRIALING or if we are just checking the trialEndsAt date
  if (
    user.trialEndsAt &&
    new Date(user.trialEndsAt).getTime() + DAY_IN_MS > Date.now()
  ) {
    return true;
  }

  return false;
};

export const getDaysLeft = (user: IUser) => {
  if (
    user.subscriptionPlan === 'lifetime' && 
    user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE
  ) {
    return Infinity;
  }

  if (user.subscriptionEndDate) {
    const diff = new Date(user.subscriptionEndDate).getTime() - Date.now();
    return Math.ceil(diff / DAY_IN_MS);
  }

  if (user.trialEndsAt) {
    const diff = new Date(user.trialEndsAt).getTime() - Date.now();
    return Math.ceil(diff / DAY_IN_MS);
  }

  return 0;
};