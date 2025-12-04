import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ hasAccess: false, reason: 'Not authenticated' });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      return NextResponse.json({ hasAccess: true, reason: 'New user - trial active' });
    }

    // Check subscription status
    const status = dbUser.subscriptionStatus;
    
    if (status === 'active' || status === 'lifetime') {
      return NextResponse.json({ hasAccess: true, reason: 'Active subscription' });
    }

    if (status === 'trialing') {
      const trialEnd = dbUser.trialEndDate;
      if (trialEnd && new Date(trialEnd) > new Date()) {
        const daysLeft = Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return NextResponse.json({ hasAccess: true, reason: 'Trial active', daysLeft });
      }
    }

    return NextResponse.json({ hasAccess: false, reason: 'Subscription required' });
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json({ hasAccess: false, reason: 'Error checking access' }, { status: 500 });
  }
}
