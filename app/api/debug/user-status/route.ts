import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, UserRole } from '@/lib/db';
import { checkSubscription } from '@/lib/subscription';

export async function GET() {
  try {
    // Get Clerk user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({
        error: 'Not authenticated',
        clerkUser: null,
      }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Get database user
    await connectDB();
    const dbUser = await User.findOne({ clerkIds: clerkUser.id });
    const dbUserByEmail = email ? await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }) : null;

    // Check subscription status
    const hasAccess = dbUser ? checkSubscription(dbUser) : false;

    return NextResponse.json({
      clerk: {
        id: clerkUser.id,
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
      database: {
        foundByClerkId: !!dbUser,
        foundByEmail: !!dbUserByEmail,
        user: dbUser ? {
          _id: dbUser._id,
          clerkIds: dbUser.clerkIds,
          email: dbUser.email,
          role: dbUser.role,
          subscriptionStatus: dbUser.subscriptionStatus,
          subscriptionPlan: dbUser.subscriptionPlan,
          subscriptionEndDate: dbUser.subscriptionEndDate,
          trialEndsAt: dbUser.trialEndsAt,
        } : null,
        userByEmail: dbUserByEmail && dbUserByEmail._id !== dbUser?._id ? {
          _id: dbUserByEmail._id,
          clerkIds: dbUserByEmail.clerkIds,
          email: dbUserByEmail.email,
          subscriptionStatus: dbUserByEmail.subscriptionStatus,
          subscriptionPlan: dbUserByEmail.subscriptionPlan,
        } : null,
      },
      access: {
        hasAccess,
        reason: !dbUser ? 'No DB user found' : 
                dbUser.role === UserRole.ADMIN ? 'Admin bypass' :
                dbUser.subscriptionPlan === 'lifetime' && dbUser.subscriptionStatus === 'active' ? 'Lifetime access' :
                dbUser.subscriptionStatus === 'active' && dbUser.subscriptionEndDate ? 'Active subscription' :
                dbUser.trialEndsAt ? 'Trial period' :
                'No valid subscription',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
        clerkPublishableKeyTest: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST?.substring(0, 20) + '...',
        usingTestKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to fetch user status',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

