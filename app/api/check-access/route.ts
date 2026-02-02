import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB, SubscriptionStatusEnum, UserRole } from '@/lib/db';
import { findUserRobust, checkProAccess } from '@/lib/subscription';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[check-access] API called');
    const { userId } = await auth();
    console.log('[check-access] Clerk userId:', userId);
    
    if (!userId) {
      console.log('[check-access] ❌ No userId - not authenticated');
      return NextResponse.json({ hasAccess: false, error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    console.log('[check-access] ✅ Database connected');
    
    // Use robust lookup that handles admin-granted access by email
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
    console.log('[check-access] User email:', userEmail);
    
    const user = await findUserRobust(userId, userEmail);
    console.log('[check-access] User found in DB:', user ? 'Yes' : 'No');

    if (!user) {
      // User is authenticated via Clerk but not in DB yet (race condition during signup)
      console.log('[check-access] ⚠️ User setup pending');
      return NextResponse.json({ hasAccess: false, error: 'User setup pending' }, { status: 200 });
    }
    
    console.log('[check-access] User data:', {
      id: user._id,
      email: user.email,
      role: user.role,
      hasDirectAccess: user.hasDirectAccess,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionTier: user.subscriptionTier,
      subscriptionEndDate: user.subscriptionEndDate,
      stripeCustomerId: user.stripeCustomerId,
    });

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
      console.log('[check-access] ✅ User is ADMIN - granting access');
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
      console.log('[check-access] ✅ User has DIRECT ACCESS (admin-granted) - granting access');
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
      console.log('[check-access] ✅ User has LIFETIME access - granting access');
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
      console.log('[check-access] ✅ User has ACTIVE/TRIALING subscription - granting access', {
        status: user.subscriptionStatus,
        endDate: user.subscriptionEndDate,
      });
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
      console.log('[check-access] ✅ User has LEGACY TRIAL - granting access');
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

    console.log('[check-access] ❌ No valid access method found - denying access');
    return NextResponse.json({ 
      hasAccess: false, 
      hasPro: false,
      grantType: 'none',
      daysUntilExpiry: null,
      hasStripeSubscription,
    });
  } catch (error) {
    console.error('[check-access] ❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

