import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getAdminUser } from '@/lib/dashboard-access';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover' as any,
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    logger.info('Admin subscription sync initiated', {
      adminEmail: adminUser.email,
      route: '/api/admin/sync-subscriptions',
    });

    // Find users with active/trialing status but no subscriptionEndDate
    const usersToFix = await User.find({
      subscriptionStatus: { $in: ['active', 'trialing'] },
      stripeCustomerId: { $exists: true, $ne: null },
      $or: [
        { subscriptionEndDate: { $exists: false } },
        { subscriptionEndDate: null }
      ]
    });

    const results = {
      total: usersToFix.length,
      fixed: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const user of usersToFix) {
      try {
        // Get their subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId!,
          status: 'all',
          limit: 10
        });

        if (subscriptions.data.length === 0) {
          results.errors++;
          results.details.push({
            email: user.email,
            status: 'error',
            message: 'No Stripe subscription found'
          });
          continue;
        }

        // Find active or trialing subscription
        const activeSubscription = subscriptions.data.find(
          sub => sub.status === 'active' || sub.status === 'trialing'
        );

        if (!activeSubscription) {
          results.errors++;
          results.details.push({
            email: user.email,
            status: 'error',
            message: 'No active/trialing subscription in Stripe'
          });
          continue;
        }

        // @ts-ignore - Stripe SDK type issue
        const endDate = new Date((activeSubscription.current_period_end as number) * 1000);
        
        // @ts-ignore - Stripe SDK type issue
        const status = activeSubscription.status === 'trialing' ? 'trialing' : 'active';
        
        const interval = activeSubscription.items.data[0]?.plan?.interval;
        const plan = interval === 'year' ? 'yearly' : 'monthly';

        await User.findByIdAndUpdate(user._id, {
          subscriptionEndDate: endDate,
          subscriptionStatus: status,
          subscriptionPlan: plan
        });

        results.fixed++;
        results.details.push({
          email: user.email,
          status: 'fixed',
          subscriptionStatus: status,
          subscriptionPlan: plan,
          subscriptionEndDate: endDate.toISOString()
        });

        logger.info('Subscription synced for user', {
          email: user.email,
          status,
          plan,
          endDate: endDate.toISOString()
        });
      } catch (error: any) {
        results.errors++;
        results.details.push({
          email: user.email,
          status: 'error',
          message: error.message
        });
        
        logger.error('Error syncing subscription for user', error, {
          email: user.email
        });
      }
    }

    logger.info('Admin subscription sync completed', {
      adminEmail: adminUser.email,
      results,
      route: '/api/admin/sync-subscriptions',
    });

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    logger.error('Admin subscription sync failed', error, {
      route: '/api/admin/sync-subscriptions',
    });
    
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscriptions' },
      { status: 500 }
    );
  }
}

