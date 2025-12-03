import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { checkSubscriptionAccess } from '@/lib/subscription';
import { getAppUrl } from '@/lib/get-app-url';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      // Not signed in - redirect to sign-in
      const appUrl = await getAppUrl();
      return NextResponse.redirect(new URL('/sign-in', appUrl));
    }

    await connectDB();

    // Find or create user
    let dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      dbUser = await User.create({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
        subscriptionStatus: 'inactive',
      });
    }

    // Check subscription access
    const access = checkSubscriptionAccess(dbUser);
    const appUrl = await getAppUrl();

    if (access.hasAccess) {
      // Has access (bypass, active, or trialing) - go to dashboard
      return NextResponse.redirect(new URL('/dashboard', appUrl));
    } else {
      // No access - go to pricing/trial page
      return NextResponse.redirect(new URL('/pricing?trial=true', appUrl));
    }
  } catch (error: any) {
    console.error('Check access error:', error);
    // On error, redirect to pricing as fallback
    const appUrl = await getAppUrl();
    return NextResponse.redirect(new URL('/pricing?trial=true', appUrl));
  }
}


