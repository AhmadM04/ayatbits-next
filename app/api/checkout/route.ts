import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User, UserRole } from '@/lib/db';
import { checkSubscription } from '@/lib/subscription';
import { logger } from '@/lib/logger';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover' as any,
    })
  : null;

export async function POST(req: NextRequest) {
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

    // Check if user already has access (subscription or admin-granted)
    await connectDB();
    const dbUser = await User.findOne({ clerkIds: user.id });
    
    if (dbUser) {
      // Check for admin status
      if (dbUser.role === UserRole.ADMIN) {
        logger.info('Checkout blocked - user is admin', {
          userId: user.id,
          email: dbUser.email,
          route: '/api/checkout',
        });
        return NextResponse.json(
          { 
            error: 'Admins have automatic access', 
            redirect: '/dashboard' 
          },
          { status: 400 }
        );
      }

      // Only block if they have an active Stripe subscription
      // Allow users with hasDirectAccess to optionally subscribe for support or when grant expires
      if (dbUser.stripeCustomerId && checkSubscription(dbUser) && !dbUser.hasDirectAccess) {
        logger.info('Checkout blocked - user has active subscription', {
          userId: user.id,
          email: dbUser.email,
          route: '/api/checkout',
          subscriptionStatus: dbUser.subscriptionStatus,
          subscriptionPlan: dbUser.subscriptionPlan,
        });
        return NextResponse.json(
          { 
            error: 'You already have an active subscription', 
            redirect: '/dashboard' 
          },
          { status: 400 }
        );
      }
    }

    const body = await req.json();
    const { priceId, tier } = body;

    // Validate tier
    if (!tier || (tier !== 'basic' && tier !== 'pro')) {
      return NextResponse.json(
        { error: 'Invalid or missing tier. Must be "basic" or "pro"' },
        { status: 400 }
      );
    }

    // Check if it's a valid Stripe price ID (not just a placeholder)
    // Real Stripe price IDs look like: price_1A2B3C4D5E6F7G8H
    const isValidStripePriceId = priceId && priceId.startsWith('price_') && priceId.length > 20;

    // Determine plan type (monthly/yearly) from priceId
    const isYearly = priceId.includes('yearly') || priceId.includes('year');
    const plan = isYearly ? 'yearly' : 'monthly';

    // If priceId is provided and valid, use it; otherwise create a price on the fly
    let lineItems: any[];
    if (isValidStripePriceId) {
      // Use existing Stripe price
      lineItems = [{ price: priceId, quantity: 1 }];
    } else {
      // Fallback: create price on the fly (for development/when env vars not set)
      const isPro = tier === 'pro';
      
      // EUR pricing
      const prices = {
        basicMonthly: 599,  // €5.99
        basicYearly: 4999,  // €49.99
        proMonthly: 1199,   // €11.99
        proYearly: 10000,   // €100
      };

      let amount: number;
      if (isPro) {
        amount = isYearly ? prices.proYearly : prices.proMonthly;
      } else {
        amount = isYearly ? prices.basicYearly : prices.basicMonthly;
      }

      lineItems = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `AyatBits ${tier === 'pro' ? 'Pro' : 'Basic'} - ${isYearly ? 'Yearly' : 'Monthly'}`,
              description: tier === 'pro' 
                ? 'Full access with AI Tafsir and word-by-word audio'
                : 'Access to all puzzles and basic features',
            },
            unit_amount: amount,
            recurring: {
              interval: isYearly ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    // Final access check right before creating Stripe session (double-check for race conditions)
    const finalCheck = await User.findOne({ clerkIds: user.id });
    if (finalCheck) {
      // Allow users with hasDirectAccess to optionally subscribe for support or when grant expires
      // Only block admins (who always have access anyway) and users with active Stripe subscriptions
      if (finalCheck.role === UserRole.ADMIN) {
        logger.info('Checkout blocked - user is admin', {
          userId: user.id,
          route: '/api/checkout',
        });
        return NextResponse.json(
          { 
            error: 'Admins have automatic access', 
            redirect: '/dashboard' 
          },
          { status: 400 }
        );
      }
      
      // Only block if they have an active Stripe subscription (not just admin grants)
      if (finalCheck.stripeCustomerId && checkSubscription(finalCheck)) {
        logger.info('Checkout blocked - user has active Stripe subscription', {
          userId: user.id,
          route: '/api/checkout',
        });
        return NextResponse.json(
          { 
            error: 'You already have an active subscription', 
            redirect: '/dashboard' 
          },
          { status: 400 }
        );
      }
    }

    // Create Stripe Checkout Session
    const sessionParams: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: user.emailAddresses[0]?.emailAddress,
      metadata: {
        clerkId: user.id,
        tier: tier,
        plan: plan,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          clerkId: user.id,
          tier: tier,
          plan: plan,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    logger.info('Stripe checkout session created', {
      userId: user.id,
      sessionId: session.id,
      route: '/api/checkout',
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    logger.error('Stripe checkout error', error, {
      route: '/api/checkout',
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
