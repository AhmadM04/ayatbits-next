import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, VoucherRedemption, Voucher } from '@/lib/db';
import { checkSubscription, checkProAccess } from '@/lib/subscription';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Debug endpoint to check why a user doesn't have access after voucher redemption
 * Usage: GET /api/debug/voucher-access?email=user@example.com (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const emailParam = request.nextUrl.searchParams.get('email');
    
    // Get current Clerk user
    const clerkUser = await currentUser();
    
    if (!clerkUser && !emailParam) {
      return NextResponse.json(
        { error: 'Not authenticated and no email provided' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user - either by Clerk ID or email
    let dbUser;
    if (emailParam) {
      dbUser = await User.findOne({ 
        email: { $regex: new RegExp(`^${emailParam}$`, 'i') } 
      });
    } else if (clerkUser) {
      // Try Clerk ID first
      dbUser = await User.findOne({ clerkIds: clerkUser.id });
      
      // Fallback to email
      if (!dbUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (email) {
          dbUser = await User.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') } 
          });
        }
      }
    }

    if (!dbUser) {
      return NextResponse.json({
        error: 'User not found in database',
        clerkUser: clerkUser ? {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
        } : null,
      });
    }

    // Get voucher redemptions for this user
    const redemptions = await VoucherRedemption.find({ 
      userId: dbUser._id 
    }).populate('voucherId').lean();

    // Check access
    const hasBasicAccess = checkSubscription(dbUser);
    const hasProAccess = checkProAccess(dbUser);

    // Calculate expiry
    let daysUntilExpiry = null;
    if (dbUser.subscriptionEndDate) {
      const now = new Date();
      const expiry = new Date(dbUser.subscriptionEndDate);
      const diffTime = expiry.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      success: true,
      debug: {
        // User identity
        identity: {
          clerkId: clerkUser?.id,
          dbUserId: dbUser._id.toString(),
          email: dbUser.email,
          clerkIdsInDb: dbUser.clerkIds || [],
          clerkIdMatches: dbUser.clerkIds?.includes(clerkUser?.id || '') || false,
        },
        
        // Subscription details
        subscription: {
          status: dbUser.subscriptionStatus,
          plan: dbUser.subscriptionPlan,
          tier: dbUser.subscriptionTier,
          endDate: dbUser.subscriptionEndDate,
          isEndDateFuture: dbUser.subscriptionEndDate 
            ? new Date(dbUser.subscriptionEndDate) > new Date()
            : false,
          daysUntilExpiry,
          hasDirectAccess: dbUser.hasDirectAccess,
          trialEndsAt: dbUser.trialEndsAt,
          stripeCustomerId: dbUser.stripeCustomerId,
        },
        
        // Access results
        access: {
          hasBasicAccess,
          hasProAccess,
          isAdmin: dbUser.role === 'admin',
        },
        
        // Voucher redemptions
        vouchers: {
          totalRedeemed: redemptions.length,
          redemptions: redemptions.map((r: any) => ({
            code: r.voucherId?.code,
            tier: r.grantedTier,
            duration: r.grantedDuration,
            redeemedAt: r.redeemedAt,
            wasActive: r.voucherId?.isActive,
          })),
        },
        
        // Diagnosis
        diagnosis: {
          hasUser: true,
          userHasClerkId: (dbUser.clerkIds?.length || 0) > 0,
          clerkIdSynced: dbUser.clerkIds?.includes(clerkUser?.id || '') || false,
          hasSubscriptionData: !!dbUser.subscriptionStatus,
          subscriptionIsActive: dbUser.subscriptionStatus === 'active',
          hasEndDate: !!dbUser.subscriptionEndDate,
          endDateIsValid: dbUser.subscriptionEndDate 
            ? new Date(dbUser.subscriptionEndDate) > new Date()
            : false,
          hasRedeemedVouchers: redemptions.length > 0,
          recommendation: !hasBasicAccess 
            ? 'User has no active subscription. Check if voucher redemption succeeded.'
            : hasBasicAccess && !hasProAccess
            ? 'User has basic access but not pro. Check subscription tier.'
            : 'User has access. Frontend might be caching old state.',
        },
      },
    });
  } catch (error: any) {
    console.error('[debug/voucher-access] Error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

