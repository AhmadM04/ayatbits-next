import { IUser } from './models/User';

export type SubscriptionAccess = {
  hasAccess: boolean;
  status: 'trialing' | 'active' | 'expired' | 'past_due' | 'canceled' | 'inactive' | 'needs_subscription' | 'bypass';
  trialDaysLeft?: number;
  message?: string;
};

export function checkSubscriptionAccess(user: IUser): SubscriptionAccess {
  // Check for admin bypass first
  if (user.hasBypass) {
    return { hasAccess: true, status: 'bypass' };
  }

  // Check for lifetime plan
  if (user.subscriptionPlan === 'lifetime' || user.subscriptionStatus === 'lifetime') {
    return { hasAccess: true, status: 'active' };
  }

  const now = new Date();
  const status = user.subscriptionStatus || 'inactive';

  // Active subscription
  if (status === 'active') {
    return { hasAccess: true, status: 'active' };
  }

  // Trialing (free trial - may or may not have payment method)
  if (status === 'trialing') {
    const trialEndsAt = user.trialEndDate;
    if (trialEndsAt && new Date(trialEndsAt) > now) {
      const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      // Check if user has payment method (Stripe customer ID) - if not, it's a limited trial
      const hasPaymentMethod = !!user.stripeCustomerId;
      return { 
        hasAccess: true, 
        status: 'trialing',
        trialDaysLeft: daysLeft,
        message: hasPaymentMethod 
          ? undefined 
          : 'Your free trial is active. Add a payment method to continue after the trial ends.',
      };
    } else {
      // Trial expired
      if (user.stripeCustomerId) {
        // Had payment method but trial expired - should have been converted to active by Stripe
        return { 
          hasAccess: false, 
          status: 'expired',
          message: 'Your trial has ended. Please check your subscription status.',
        };
      } else {
        // No payment method and trial expired - needs to subscribe
        return { 
          hasAccess: false, 
          status: 'needs_subscription',
          message: 'Your free trial has ended. Start your 7-day free trial with a payment method to continue.',
        };
      }
    }
  }

  // Past due - payment failed
  if (status === 'past_due') {
    return { 
      hasAccess: false, 
      status: 'past_due',
      message: 'Your payment failed. Please update your payment method to continue.',
    };
  }

  // Canceled
  if (status === 'canceled') {
    return { 
      hasAccess: false, 
      status: 'canceled',
      message: 'Your subscription has ended. Subscribe again to continue learning.',
    };
  }

  // Inactive - needs to subscribe and add payment method
  return { 
    hasAccess: false, 
    status: 'needs_subscription',
    message: 'Start your 7-day free trial to access all features.',
  };
}

export function getTrialDaysRemaining(trialEndsAt: Date | string | undefined | null): number {
  if (!trialEndsAt) return 0;
  try {
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    if (isNaN(endDate.getTime())) return 0;
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}
