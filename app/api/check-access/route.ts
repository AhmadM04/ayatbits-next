import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { checkSubscriptionAccess } from '@/lib/subscription';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      // Not signed in - redirect to sign-in
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
    return NextResponse.redirect(new URL('/pricing?trial=true', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}

