import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB, User } from '@/lib/db';

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
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { clerkId: userId, plan } = session.metadata || {};

        if (userId && session.customer) {
          // Check if user has admin-granted access before updating
          const existingUser = await User.findOne({ clerkId: userId });
          
          if (existingUser?.hasDirectAccess) {
            console.warn(`[Stripe Webhook] ⚠️ User ${userId} (${existingUser.email}) has admin-granted access (hasDirectAccess=true). Canceling Stripe subscription to prevent billing.`);
            
            // Save customer ID for reference, but don't overwrite subscription details
            await User.findOneAndUpdate(
              { clerkId: userId },
              {
                stripeCustomerId: session.customer as string,
              }
            );

            // Cancel the Stripe subscription immediately so they're not charged
            try {
              if (session.subscription) {
                await stripe.subscriptions.cancel(session.subscription as string);
                console.log(`[Stripe Webhook] ✅ Canceled Stripe subscription ${session.subscription} for user ${userId} with admin access`);
              }
            } catch (error) {
              console.error(`[Stripe Webhook] ❌ Failed to cancel subscription for user ${userId}:`, error);
            }
            
            break;
          }

          await User.findOneAndUpdate(
            { clerkId: userId },
            {
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
              subscriptionPlan: plan || 'monthly',
              subscriptionPlatform: 'web',
            }
          );
          console.log(`[Stripe Webhook] Updated subscription for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Check if user has admin-granted access before updating
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        if (existingUser?.hasDirectAccess) {
          console.warn(`[Stripe Webhook] User with Stripe customer ${customerId} has admin-granted access (hasDirectAccess=true). Skipping subscription status update.`);
          break;
        }
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trialing' : 'inactive',
          }
        );
        console.log(`[Stripe Webhook] Updated subscription status for customer ${customerId} to ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Check if user has admin-granted access before updating
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        if (existingUser?.hasDirectAccess) {
          console.warn(`[Stripe Webhook] User with Stripe customer ${customerId} has admin-granted access (hasDirectAccess=true). Skipping subscription deletion update.`);
          break;
        }
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'canceled' }
        );
        console.log(`[Stripe Webhook] Marked subscription as canceled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Check if user has admin-granted access before updating
        const existingUser = await User.findOne({ stripeCustomerId: customerId });
        
        if (existingUser?.hasDirectAccess) {
          console.warn(`[Stripe Webhook] User with Stripe customer ${customerId} has admin-granted access (hasDirectAccess=true). Skipping payment failure update.`);
          break;
        }
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'past_due' }
        );
        console.log(`[Stripe Webhook] Marked subscription as past_due for customer ${customerId}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
