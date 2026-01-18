import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { SubscriptionStatusEnum } from '@/lib/models/User';

/**
 * POST /api/subscriptions/sync
 * Syncs iOS (StoreKit) subscription status to MongoDB
 * Called by iOS app after successful purchase or subscription update
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      platform, 
      productId, 
      transactionId, 
      expirationDate,
      isInTrial 
    } = body;

    // Validate required fields
    if (!platform || !productId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, productId, transactionId' },
        { status: 400 }
      );
    }

    // Only accept iOS platform
    if (platform !== 'ios') {
      return NextResponse.json(
        { error: 'Invalid platform. Only "ios" is supported.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Determine subscription plan from productId
    let subscriptionPlan: 'monthly' | 'yearly' | 'lifetime' = 'monthly';
    if (productId.includes('yearly') || productId === '15') {
      subscriptionPlan = 'yearly';
    } else if (productId.includes('lifetime')) {
      subscriptionPlan = 'lifetime';
    }

    // Parse expiration date if provided
    let parsedExpirationDate: Date | undefined;
    if (expirationDate) {
      parsedExpirationDate = new Date(expirationDate);
      // Validate date
      if (isNaN(parsedExpirationDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expirationDate format' },
          { status: 400 }
        );
      }
    }

    // Check if user has admin-granted access before syncing iOS subscription
    const existingUser = await User.findOne({ clerkIds: user.id });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // If user has admin-granted access, don't overwrite with iOS subscription
    if (existingUser.hasDirectAccess) {
      console.warn(`⚠️ User ${user.id} has admin-granted access (hasDirectAccess=true). Skipping iOS subscription sync to preserve admin access.`);
      
      return NextResponse.json({ 
        success: true,
        message: 'Admin-granted access is active. iOS subscription not required.',
        subscription: {
          status: existingUser.subscriptionStatus,
          plan: existingUser.subscriptionPlan,
          endDate: existingUser.subscriptionEndDate,
          platform: existingUser.subscriptionPlatform,
          hasDirectAccess: true
        }
      });
    }

    // Update user subscription in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { clerkIds: user.id },
      {
        subscriptionStatus: isInTrial 
          ? SubscriptionStatusEnum.TRIALING 
          : SubscriptionStatusEnum.ACTIVE,
        subscriptionPlan,
        subscriptionEndDate: parsedExpirationDate,
        subscriptionPlatform: 'ios',
        iosTransactionId: transactionId,
      },
      { 
        new: true,
        upsert: false // Don't create if user doesn't exist
      }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    console.log(`✅ Synced iOS subscription for user ${user.id}:`, {
      plan: subscriptionPlan,
      status: isInTrial ? 'trialing' : 'active',
      expirationDate: parsedExpirationDate?.toISOString(),
      transactionId
    });

    return NextResponse.json({ 
      success: true,
      subscription: {
        status: updatedUser.subscriptionStatus,
        plan: updatedUser.subscriptionPlan,
        endDate: updatedUser.subscriptionEndDate,
        platform: updatedUser.subscriptionPlatform
      }
    });
  } catch (error: any) {
    console.error('❌ iOS subscription sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions/sync
 * Check current subscription status from backend
 * Called by iOS app on launch to check for web subscriptions
 */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: user.id });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if subscription is still valid
    const hasActiveSubscription = 
      dbUser.subscriptionStatus === SubscriptionStatusEnum.ACTIVE &&
      (!dbUser.subscriptionEndDate || new Date(dbUser.subscriptionEndDate) > new Date());

    const hasActiveTrial = 
      dbUser.trialEndsAt && new Date(dbUser.trialEndsAt) > new Date();

    return NextResponse.json({
      hasActiveSubscription,
      hasActiveTrial,
      subscription: {
        status: dbUser.subscriptionStatus,
        plan: dbUser.subscriptionPlan,
        endDate: dbUser.subscriptionEndDate,
        platform: dbUser.subscriptionPlatform,
        isInTrial: dbUser.subscriptionStatus === SubscriptionStatusEnum.TRIALING
      },
      trial: {
        endsAt: dbUser.trialEndsAt
      }
    });
  } catch (error: any) {
    console.error('❌ Subscription check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
