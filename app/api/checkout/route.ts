import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAppUrl } from '@/lib/get-app-url';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

const PLANS = {
  monthly: {
    name: 'AyatBits Pro Monthly',
    description: 'Unlimited access to all puzzles and features',
    amount: 599, // $5.99
    interval: 'month' as const,
  },
  yearly: {
    name: 'AyatBits Pro Yearly',
    description: 'Unlimited access with 33% savings',
    amount: 4799, // $47.99
    interval: 'year' as const,
  },
};

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const planId = body.plan as keyof typeof PLANS;
    
    if (!planId || !PLANS[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const plan = PLANS[planId];
    // Get URL from request headers or environment
    const headersList = request.headers;
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 
                     (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (host ? `${protocol}://${host}` : 'http://localhost:3000');

    // Create Stripe Checkout Session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: user.id,
          plan: planId,
        },
      },
      success_url: `${appUrl}/dashboard?success=true&plan=${planId}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      customer_email: user.emailAddresses[0]?.emailAddress,
      metadata: {
        userId: user.id,
        plan: planId,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
