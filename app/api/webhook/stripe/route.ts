import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User } from '@/lib/db';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';
import { sendWelcomeNewMemberEmail } from '@/lib/aws-ses-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-11-17.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      securityLogger.logWebhookSignatureFailure({
        route: '/api/webhook/stripe',
        error: err.message,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { clerkId: userId, plan, tier } = session.metadata || {};

        if (userId && session.customer) {
          // Check if user has admin-granted access
          const existingUser = await User.findOne({ clerkIds: userId });
          
          // Allow subscription for users with hasDirectAccess (they may want to support or prepare for expiry)
          if (existingUser?.hasDirectAccess) {
            logger.info('User with admin-granted access subscribed via Stripe (support/upgrade)', {
              userId,
              email: existingUser.email,
              hasDirectAccess: true,
              existingPlan: existingUser.subscriptionPlan,
              route: '/api/webhook/stripe',
              event: 'checkout.session.completed',
            });
          }

          // Update subscription details while preserving hasDirectAccess flag
          const updatedUser = await User.findOneAndUpdate(
            { clerkIds: userId },
            {
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
              subscriptionPlan: plan || 'monthly',
              subscriptionTier: tier || 'basic',
              subscriptionPlatform: 'web',
              // Note: hasDirectAccess remains unchanged if it exists
            },
            { new: true }
          );
          
          logger.info('Subscription activated', {
            userId,
            plan: plan || 'monthly',
            tier: tier || 'basic',
            route: '/api/webhook/stripe',
          });

          // Send welcome email (async, don't wait)
          if (updatedUser && updatedUser.email) {
            sendWelcomeNewMemberEmail({
              email: updatedUser.email,
              firstName: updatedUser.firstName || 'there',
              subscriptionPlan: updatedUser.subscriptionPlan || 'monthly',
            }).catch(err => 
              logger.error('Error sending welcome member email', err)
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Allow subscription updates for users with admin-granted access
        // They can maintain both hasDirectAccess AND a Stripe subscription
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trialing' : 'inactive',
          }
        );
        logger.info('Subscription status updated', {
          customerId,
          status: subscription.status,
          route: '/api/webhook/stripe',
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        // If user has hasDirectAccess, mark Stripe subscription as canceled but they keep admin-granted access
        if (existingUser?.hasDirectAccess) {
          logger.info('Stripe subscription canceled but user retains admin-granted access', {
            customerId,
            email: existingUser.email,
            hasDirectAccess: true,
            route: '/api/webhook/stripe',
            event: 'customer.subscription.deleted',
          });
        }
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'canceled' }
        );
        logger.info('Subscription canceled', {
          customerId,
          route: '/api/webhook/stripe',
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        // Mark as past_due even if they have hasDirectAccess (they're trying to pay)
        // If payment keeps failing, they'll still have admin-granted access as fallback
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'past_due' }
        );
        
        if (existingUser?.hasDirectAccess) {
          logger.warn('Payment failed but user has admin-granted access as fallback', {
            customerId,
            email: existingUser.email,
            hasDirectAccess: true,
            route: '/api/webhook/stripe',
            event: 'invoice.payment_failed',
          });
        } else {
          logger.warn('Subscription marked as past due', {
            customerId,
            route: '/api/webhook/stripe',
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', error as Error, {
      route: '/api/webhook/stripe',
    });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
