import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User } from '@/lib/db';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';

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
        const { clerkId: userId, plan } = session.metadata || {};

        if (userId && session.customer) {
          // Check if user has admin-granted access before updating
          const existingUser = await User.findOne({ clerkIds: userId });
          
          if (existingUser?.hasDirectAccess) {
            logger.warn('User with admin access attempted Stripe checkout', {
              userId,
              email: existingUser.email,
              route: '/api/webhook/stripe',
              event: 'checkout.session.completed',
            });
            
            // Save customer ID for reference, but don't overwrite subscription details
            await User.findOneAndUpdate(
              { clerkIds: userId },
              {
                stripeCustomerId: session.customer as string,
              }
            );

            // Cancel the Stripe subscription immediately so they're not charged
            try {
              if (session.subscription) {
                await stripe.subscriptions.cancel(session.subscription as string);
                logger.info('Canceled Stripe subscription for user with admin access', {
                  userId,
                  subscriptionId: session.subscription,
                  route: '/api/webhook/stripe',
                });
              }
            } catch (error) {
              logger.error('Failed to cancel subscription', error as Error, {
                userId,
                route: '/api/webhook/stripe',
              });
            }
            
            break;
          }

          await User.findOneAndUpdate(
            { clerkIds: userId },
            {
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
              subscriptionPlan: plan || 'monthly',
              subscriptionPlatform: 'web',
            }
          );
          logger.info('Subscription activated', {
            userId,
            plan: plan || 'monthly',
            route: '/api/webhook/stripe',
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Check if user has admin-granted access before updating
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        if (existingUser?.hasDirectAccess) {
          logger.warn('Skipping subscription update for user with admin access', {
            customerId,
            route: '/api/webhook/stripe',
            event: 'customer.subscription.updated',
          });
          break;
        }
        
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
        
        // Check if user has admin-granted access before updating
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        if (existingUser?.hasDirectAccess) {
          logger.warn('Skipping subscription deletion for user with admin access', {
            customerId,
            route: '/api/webhook/stripe',
            event: 'customer.subscription.deleted',
          });
          break;
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
        
        // Check if user has admin-granted access before updating
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        if (existingUser?.hasDirectAccess) {
          logger.warn('Skipping payment failure update for user with admin access', {
            customerId,
            route: '/api/webhook/stripe',
            event: 'invoice.payment_failed',
          });
          break;
        }
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'past_due' }
        );
        logger.warn('Subscription marked as past due', {
          customerId,
          route: '/api/webhook/stripe',
        });
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
