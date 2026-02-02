import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB, SubscriptionStatusEnum, UserRole } from '@/lib/db';
import { findUserRobust, checkProAccess } from '@/lib/subscription';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ hasAccess: false, error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    // Use robust lookup that handles admin-granted access by email
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
    const user = await findUserRobust(userId, userEmail);

    if (!user) {
      // User is authenticated via Clerk but not in DB yet (race condition during signup)
      return NextResponse.json({ hasAccess: false, error: 'User setup pending' }, { status: 200 });
    }

    // Check if user has Pro tier access
    const hasProTier = checkProAccess(user);
    
    // Calculate grant metadata
    const hasStripeSubscription = !!user.stripeCustomerId;
    let grantType: 'lifetime' | 'temporary' | 'none' = 'none';
    let daysUntilExpiry: number | null = null;
    
    if (user.hasDirectAccess) {
      if (user.subscriptionPlan === 'lifetime') {
        grantType = 'lifetime';
      } else if (user.subscriptionEndDate) {
        grantType = 'temporary';
        const now = new Date();
        const expiry = new Date(user.subscriptionEndDate);
        const diffTime = expiry.getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    // Admins always have access
    if (user.role === UserRole.ADMIN) {
      return NextResponse.json({ 
        hasAccess: true, 
        plan: 'admin',
        tier: 'pro', // Admins get pro tier
        hasPro: true,
        grantType: 'none',
        daysUntilExpiry: null,
        hasStripeSubscription,
      });
    }

    // Check for direct access (admin-granted)
    if (user.hasDirectAccess) {
      return NextResponse.json({ 
        hasAccess: true, 
        plan: 'granted',
        tier: user.subscriptionTier || 'pro', // Default to pro for admin-granted
        hasPro: hasProTier,
        grantType,
        daysUntilExpiry,
        hasStripeSubscription,
      });
    }

    // Check for lifetime access
    if (
      user.subscriptionPlan === 'lifetime' && 
      user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE
    ) {
      return NextResponse.json({ 
        hasAccess: true, 
        plan: 'lifetime',
        tier: user.subscriptionTier || 'basic',
        hasPro: hasProTier,
        grantType: 'none',
        daysUntilExpiry: null,
        hasStripeSubscription,
      });
    }

    // Check active or trialing subscription
    if (
      (user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE || 
       user.subscriptionStatus === SubscriptionStatusEnum.TRIALING) &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > new Date()
    ) {
      return NextResponse.json({ 
        hasAccess: true, 
        plan: user.subscriptionStatus === SubscriptionStatusEnum.TRIALING ? 'trial' : user.subscriptionPlan,
        tier: user.subscriptionTier || 'basic',
        hasPro: hasProTier,
        grantType: 'none',
        daysUntilExpiry: null,
        hasStripeSubscription,
      });
    }

    // Check legacy trial field (for backward compatibility)
    if (
      user.trialEndsAt &&
      new Date(user.trialEndsAt) > new Date()
    ) {
      return NextResponse.json({ 
        hasAccess: true, 
        plan: 'trial',
        tier: user.subscriptionTier || 'basic',
        hasPro: hasProTier,
        grantType: 'none',
        daysUntilExpiry: null,
        hasStripeSubscription,
      });
    }

    return NextResponse.json({ 
      hasAccess: false, 
      hasPro: false,
      grantType: 'none',
      daysUntilExpiry: null,
      hasStripeSubscription,
    });
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

