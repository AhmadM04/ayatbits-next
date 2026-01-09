import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB, User, SubscriptionStatusEnum } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ hasAccess: false, error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      // User is authenticated via Clerk but not in DB yet (race condition during signup)
      return NextResponse.json({ hasAccess: false, error: 'User setup pending' }, { status: 200 });
    }

    // Admins always have access
    if (user.isAdmin) {
      return NextResponse.json({ hasAccess: true, plan: 'admin' });
    }

    // Check for lifetime access
    if (
      user.subscriptionPlan === 'lifetime' && 
      user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE
    ) {
      return NextResponse.json({ hasAccess: true, plan: 'lifetime' });
    }

    // Check active subscription
    if (
      user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > new Date()
    ) {
      return NextResponse.json({ hasAccess: true, plan: user.subscriptionPlan });
    }

    // Check trial
    if (
      user.trialEndsAt &&
      new Date(user.trialEndsAt) > new Date()
    ) {
      return NextResponse.json({ hasAccess: true, plan: 'trial' });
    }

    return NextResponse.json({ hasAccess: false });
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

