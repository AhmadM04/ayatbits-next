import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User } from '@/lib/db';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';
import { sendWelcomeNewMemberEmail } from '@/lib/aws-ses-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-01-28.clover' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(request: NextRequest) {
  try {
    console.log('[stripe-webhook] 🔔 Webhook received');
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.log('[stripe-webhook] ❌ Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[stripe-webhook] ✅ Event verified:', event.type);
    } catch (err: any) {
      console.error('[stripe-webhook] ❌ Signature verification failed:', err.message);
      securityLogger.logWebhookSignatureFailure({
        route: '/api/webhook/stripe',
        error: err.message,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();
    console.log('[stripe-webhook] ✅ Database connected');

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('[stripe-webhook] 💳 Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        const { clerkId: userId, plan, tier } = session.metadata || {};
        const customerEmail = session.customer_details?.email || session.customer_email;
        
        console.log('[stripe-webhook] Session details:', {
          sessionId: session.id,
          userId,
          customerEmail,
          plan,
          tier,
          customer: session.customer,
          subscription: session.subscription,
          paymentStatus: session.payment_status,
        });

        if (userId && session.customer && session.subscription) {
          // Fetch the subscription details from Stripe to get the end date
          console.log('[stripe-webhook] Fetching subscription details...');
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          // @ts-ignore - Stripe SDK type definition issue with current_period_end
          const subscriptionEndDate = new Date((subscription.current_period_end as number) * 1000);

          // Determine subscription status (trialing or active)
          // @ts-ignore - Stripe SDK type definition issue
          const subscriptionStatus = subscription.status === 'trialing' ? 'trialing' : 'active';
          
          console.log('[stripe-webhook] Subscription info:', {
            subscriptionId: subscription.id,
            status: subscriptionStatus,
            endDate: subscriptionEndDate.toISOString(),
          });

          // Check if user exists - if not, create them
          let existingUser = await User.findOne({ clerkIds: userId });
          console.log('[stripe-webhook] User lookup result:', existingUser ? 'Found' : 'Not found');
          
          if (!existingUser && customerEmail) {
            // User doesn't exist yet - create them
            // This can happen if they sign up and immediately checkout before accessing dashboard
            logger.info('Creating user from Stripe checkout', {
              userId,
              email: customerEmail,
              route: '/api/webhook/stripe',
            });

            existingUser = await User.create({
              clerkIds: [userId],
              email: customerEmail.toLowerCase(),
              stripeCustomerId: session.customer as string,
              subscriptionStatus: subscriptionStatus,
              subscriptionPlan: plan || 'monthly',
              subscriptionTier: tier || 'basic',
              subscriptionPlatform: 'web',
              subscriptionEndDate: subscriptionEndDate,
            });

            logger.info('User created from Stripe checkout', {
              userId,
              email: customerEmail,
              plan: plan || 'monthly',
              tier: tier || 'basic',
              status: subscriptionStatus,
              route: '/api/webhook/stripe',
            });
          } else if (existingUser) {
            // User exists - update their subscription
            // Allow subscription for users with hasDirectAccess (they may want to support or prepare for expiry)
            if (existingUser.hasDirectAccess) {
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
            existingUser = await User.findOneAndUpdate(
              { clerkIds: userId },
              {
                stripeCustomerId: session.customer as string,
                subscriptionStatus: subscriptionStatus,
                subscriptionPlan: plan || 'monthly',
                subscriptionTier: tier || 'basic',
                subscriptionPlatform: 'web',
                subscriptionEndDate: subscriptionEndDate,
                // Note: hasDirectAccess remains unchanged if it exists
              },
              { new: true }
            );

            logger.info('Subscription activated for existing user', {
              userId,
              plan: plan || 'monthly',
              tier: tier || 'basic',
              status: subscriptionStatus,
              endDate: subscriptionEndDate.toISOString(),
              route: '/api/webhook/stripe',
            });
            console.log('[stripe-webhook] ✅ User subscription updated successfully');
          } else {
            // This should rarely happen - user not found and no email
            console.error('[stripe-webhook] ❌ Cannot create user - no email available');
            logger.error('Cannot create user - no email available', undefined, {
              userId,
              sessionId: session.id,
              route: '/api/webhook/stripe',
            });
            break;
          }

          // Send welcome email (async, don't wait)
          if (existingUser && existingUser.email) {
            console.log('[stripe-webhook] 📧 Sending welcome email to:', existingUser.email);
            sendWelcomeNewMemberEmail({
              email: existingUser.email,
              firstName: existingUser.firstName || 'there',
              subscriptionPlan: existingUser.subscriptionPlan || 'monthly',
            }).catch(err => {
              console.error('[stripe-webhook] ❌ Error sending welcome email:', err);
              logger.error('Error sending welcome member email', err);
            });
          }
          
          console.log('[stripe-webhook] ✅ Checkout session completed successfully');
        } else {
          console.log('[stripe-webhook] ⚠️ Skipping - missing required data:', {
            hasUserId: !!userId,
            hasCustomer: !!session.customer,
            hasSubscription: !!session.subscription,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Calculate subscription end date
        // @ts-ignore - Stripe SDK type definition issue with current_period_end
        const subscriptionEndDate = new Date((subscription.current_period_end as number) * 1000);
        
        // Determine subscription plan from interval
        const subscriptionPlan = subscription.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly';
        
        // Allow subscription updates for users with admin-granted access
        // They can maintain both hasDirectAccess AND a Stripe subscription
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trialing' : 'inactive',
            subscriptionEndDate: subscriptionEndDate,
            subscriptionPlan: subscriptionPlan,
          }
        );
        logger.info('Subscription status updated', {
          customerId,
          status: subscription.status,
          plan: subscriptionPlan,
          endDate: subscriptionEndDate.toISOString(),
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
