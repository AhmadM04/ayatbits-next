import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get subscription details to get trial end date and current period end
        let trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
        let currentPeriodEnd: Date | undefined = undefined;
        
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            if (subscription.trial_end) {
              trialEndsAt = new Date(subscription.trial_end * 1000);
            }
            // Get current period end
            const periodEnd = (subscription as any).current_period_end;
            if (periodEnd) {
              currentPeriodEnd = new Date(periodEnd * 1000);
            }
          } catch (error) {
            console.error('Error retrieving subscription:', error);
          }
        }

        // Try multiple ways to find the user
        let dbUser: any = null;
        
        // 1. Try by clerkId from metadata
        if (userId) {
          dbUser = await User.findOne({ clerkId: userId });
        }
        
        // 2. Try by email from session
        if (!dbUser) {
          const customerEmail = session.customer_email || session.customer_details?.email;
          if (customerEmail) {
            dbUser = await User.findOne({ email: customerEmail.toLowerCase() });
          }
        }
        
        // 3. Try by Stripe customer ID (in case user was created elsewhere)
        if (!dbUser && customerId) {
          dbUser = await User.findOne({ stripeCustomerId: customerId });
        }

        // Get customer email if we have customer ID
        let customerEmail = session.customer_email || session.customer_details?.email;
        if (!customerEmail && customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              customerEmail = (customer as Stripe.Customer).email || undefined;
            }
          } catch (error) {
            console.error('Error retrieving customer:', error);
          }
        }

        if (dbUser) {
          // Update existing user
          await User.findOneAndUpdate(
            { _id: dbUser._id },
            {
              subscriptionStatus: 'trialing',
              subscriptionPlan: plan || 'monthly',
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              trialEndsAt,
              currentPeriodEnd,
            }
          );
          console.log(`User ${dbUser.clerkId || dbUser.email} started trial for ${plan || 'monthly'} plan`);
        } else if (userId && customerEmail) {
          // User doesn't exist - create them
          console.warn(`User ${userId} not found in database during webhook. Creating user.`);
          await User.create({
            clerkId: userId,
            email: customerEmail.toLowerCase(),
            subscriptionStatus: 'trialing',
            subscriptionPlan: plan || 'monthly',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            trialEndsAt,
            currentPeriodEnd,
          });
        } else {
          console.error('Cannot process checkout.session.completed: missing userId or customerEmail', {
            userId,
            customerEmail,
            customerId,
            subscriptionId,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const customerId = subscription.customer as string;

        const status = subscription.status;
        let subscriptionStatus = 'inactive';
        
        if (status === 'active') subscriptionStatus = 'active';
        else if (status === 'trialing') subscriptionStatus = 'trialing';
        else if (status === 'past_due') subscriptionStatus = 'past_due';
        else if (status === 'canceled') subscriptionStatus = 'canceled';

        // Get current period end and trial end from the subscription object
        const periodEnd = (subscription as any).current_period_end;
        const trialEnd = subscription.trial_end;
        const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : undefined;
        const trialEndsAt = trialEnd ? new Date(trialEnd * 1000) : undefined;

        // Try to find user by multiple methods
        let dbUser = null;
        if (userId) {
          dbUser = await User.findOne({ clerkId: userId });
        }
        if (!dbUser && customerId) {
          dbUser = await User.findOne({ stripeCustomerId: customerId });
        }
        if (!dbUser && subscription.id) {
          dbUser = await User.findOne({ stripeSubscriptionId: subscription.id });
        }

        if (dbUser) {
          await User.findOneAndUpdate(
            { _id: dbUser._id },
            {
              subscriptionStatus,
              ...(currentPeriodEnd && { currentPeriodEnd }),
              ...(trialEndsAt && { trialEndsAt }),
              // Update subscription plan if available
              ...(subscription.items.data[0]?.price?.recurring?.interval && {
                subscriptionPlan: subscription.items.data[0].price.recurring.interval === 'month' ? 'monthly' : 'yearly',
              }),
            }
          );
          console.log(`User ${dbUser.clerkId || dbUser.email} subscription updated: ${subscriptionStatus}`);
        } else {
          console.warn(`Subscription updated but user not found: ${userId || customerId || subscription.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const customerId = subscription.customer as string;

        // Try to find user by multiple methods
        let dbUser = null;
        if (userId) {
          dbUser = await User.findOne({ clerkId: userId });
        }
        if (!dbUser && customerId) {
          dbUser = await User.findOne({ stripeCustomerId: customerId });
        }
        if (!dbUser && subscription.id) {
          dbUser = await User.findOne({ stripeSubscriptionId: subscription.id });
        }

        if (dbUser) {
          // Get current period end before canceling (user should have access until period ends)
          const periodEnd = (subscription as any).current_period_end;
          const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : undefined;

          await User.findOneAndUpdate(
            { _id: dbUser._id },
            {
              subscriptionStatus: 'canceled',
              subscriptionPlan: null,
              ...(currentPeriodEnd && { currentPeriodEnd }),
            }
          );
          console.log(`User ${dbUser.clerkId || dbUser.email} subscription canceled`);
        } else {
          console.warn(`Subscription deleted but user not found: ${userId || customerId || subscription.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        const customerId = invoice.customer as string;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const userId = subscription.metadata?.userId;
            const periodEnd = (subscription as any).current_period_end;
            const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : undefined;

            // Try to find user by multiple methods
            let dbUser = null;
            if (userId) {
              dbUser = await User.findOne({ clerkId: userId });
            }
            if (!dbUser && customerId) {
              dbUser = await User.findOne({ stripeCustomerId: customerId });
            }
            if (!dbUser && subscriptionId) {
              dbUser = await User.findOne({ stripeSubscriptionId: subscriptionId });
            }

            if (dbUser) {
              await User.findOneAndUpdate(
                { _id: dbUser._id },
                {
                  subscriptionStatus: 'active',
                  ...(currentPeriodEnd && { currentPeriodEnd }),
                }
              );
              console.log(`User ${dbUser.clerkId || dbUser.email} payment succeeded`);
            } else {
              console.warn(`Payment succeeded but user not found: ${userId || customerId || subscriptionId}`);
            }
          } catch (error) {
            console.error('Error processing invoice.payment_succeeded:', error);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        const customerId = invoice.customer as string;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const userId = subscription.metadata?.userId;

            // Try to find user by multiple methods
            let dbUser = null;
            if (userId) {
              dbUser = await User.findOne({ clerkId: userId });
            }
            if (!dbUser && customerId) {
              dbUser = await User.findOne({ stripeCustomerId: customerId });
            }
            if (!dbUser && subscriptionId) {
              dbUser = await User.findOne({ stripeSubscriptionId: subscriptionId });
            }

            if (dbUser) {
              await User.findOneAndUpdate(
                { _id: dbUser._id },
                { subscriptionStatus: 'past_due' }
              );
              console.log(`User ${dbUser.clerkId || dbUser.email} payment failed`);
            } else {
              console.warn(`Payment failed but user not found: ${userId || customerId || subscriptionId}`);
            }
          } catch (error) {
            console.error('Error processing invoice.payment_failed:', error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

