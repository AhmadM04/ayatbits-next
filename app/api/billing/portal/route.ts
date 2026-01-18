import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User } from '@/lib/db';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover' as any,
    })
  : null;

export async function POST() {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: user.id });
    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
