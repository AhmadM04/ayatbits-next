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

        if (userId) {
          await User.findOneAndUpdate(
            { clerkId: userId },
            {
              subscriptionStatus: 'trialing',
              subscriptionPlan: plan,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
          );
          console.log(`User ${userId} started trial for ${plan} plan`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const status = subscription.status;
          let subscriptionStatus = 'inactive';
          
          if (status === 'active') subscriptionStatus = 'active';
          else if (status === 'trialing') subscriptionStatus = 'trialing';
          else if (status === 'past_due') subscriptionStatus = 'past_due';
          else if (status === 'canceled') subscriptionStatus = 'canceled';

          // Get current period end from the subscription object
          const periodEnd = (subscription as any).current_period_end;
          
          await User.findOneAndUpdate(
            { clerkId: userId },
            {
              subscriptionStatus,
              ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
            }
          );
          console.log(`User ${userId} subscription updated: ${subscriptionStatus}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await User.findOneAndUpdate(
            { clerkId: userId },
            {
              subscriptionStatus: 'canceled',
              subscriptionPlan: null,
            }
          );
          console.log(`User ${userId} subscription canceled`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;
          const periodEnd = (subscription as any).current_period_end;

          if (userId) {
            await User.findOneAndUpdate(
              { clerkId: userId },
              {
                subscriptionStatus: 'active',
                ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
              }
            );
            console.log(`User ${userId} payment succeeded`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            await User.findOneAndUpdate(
              { clerkId: userId },
              { subscriptionStatus: 'past_due' }
            );
            console.log(`User ${userId} payment failed`);
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

