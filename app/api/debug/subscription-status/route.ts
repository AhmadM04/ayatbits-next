import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, UserRole } from '@/lib/db';
import { checkSubscription } from '@/lib/subscription';

/**
 * Debug endpoint to check current user's subscription status
 * GET /api/debug/subscription-status
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        authenticated: false,
      }, { status: 401 });
    }

    await connectDB();

    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const emailLower = email?.toLowerCase();

    // Try to find user by clerkId first
    let dbUser = await User.findOne({ clerkIds: clerkUser.id });

    // If not found, try by email
    if (!dbUser && emailLower) {
      dbUser = await User.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
    }

    if (!dbUser) {
      return NextResponse.json({
        authenticated: true,
        clerkUser: {
          id: clerkUser.id,
          email: email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
        dbUser: null,
        error: 'User not found in database. Sign in to the app first to create your profile.',
      });
    }

    // Admins always have access (matches requireDashboardAccess logic)
    const hasAccess = dbUser.role === UserRole.ADMIN || checkSubscription(dbUser);

    return NextResponse.json({
      authenticated: true,
      clerkUser: {
        id: clerkUser.id,
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
      dbUser: {
        _id: dbUser._id,
        clerkIds: dbUser.clerkIds,
        email: dbUser.email,
        role: dbUser.role,
        hasDirectAccess: dbUser.hasDirectAccess,
        subscriptionStatus: dbUser.subscriptionStatus,
        subscriptionPlan: dbUser.subscriptionPlan,
        subscriptionEndDate: dbUser.subscriptionEndDate,
        trialEndsAt: dbUser.trialEndsAt,
        subscriptionPlatform: dbUser.subscriptionPlatform,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      },
      accessCheck: {
        hasAccess,
        checks: {
          isAdmin: dbUser.role === UserRole.ADMIN,
          hasDirectAccess: !!dbUser.hasDirectAccess,
          isLifetime: dbUser.subscriptionPlan === 'lifetime' && dbUser.subscriptionStatus === 'active',
          hasActiveSubscription: !!(
            dbUser.subscriptionStatus === 'active' &&
            dbUser.subscriptionEndDate &&
            new Date(dbUser.subscriptionEndDate).getTime() > Date.now()
          ),
          hasActiveTrial: !!(
            dbUser.trialEndsAt &&
            new Date(dbUser.trialEndsAt).getTime() > Date.now()
          ),
        },
      },
    });
  } catch (error: any) {
    console.error('Debug subscription status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
    }, { status: 500 });
  }
}

