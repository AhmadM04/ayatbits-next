import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB, User, SubscriptionStatusEnum } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ hasAccess: false }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ hasAccess: false });
    }

    // Check for lifetime access
    // Fix: Check subscriptionPlan, not subscriptionStatus, for 'lifetime' string
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
    // Fix: Use trialEndsAt instead of trialEndDate
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