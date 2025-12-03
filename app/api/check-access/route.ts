import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { checkSubscriptionAccess } from '@/lib/subscription';
import { getAppUrl } from '@/lib/get-app-url';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      // Not signed in - redirect to sign-in
      const appUrl = await getAppUrl();
      return NextResponse.redirect(new URL('/sign-in', appUrl));
    }

    await connectDB();

    // Find or create user
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
    let dbUser = await User.findOne({ clerkId: user.id });
    
    if (!dbUser) {
      // Check if user exists by email (created by admin before they signed in)
      dbUser = await User.findOne({ email: userEmail });
      
      if (dbUser) {
        // User was created by admin - update with Clerk ID and info
        dbUser = await User.findOneAndUpdate(
          { email: userEmail },
          {
            clerkId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.fullName,
            imageUrl: user.imageUrl,
          },
          { new: true }
        );
      } else {
        // New user - create
        dbUser = await User.create({
          clerkId: user.id,
          email: userEmail,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.fullName,
          imageUrl: user.imageUrl,
          subscriptionStatus: 'inactive',
        });
      }
    }

    // Check subscription access
    let access = checkSubscriptionAccess(dbUser);

    // Only check Stripe if user doesn't have access AND doesn't have a stripeCustomerId
    // This avoids slow Stripe API calls on every request
    if (!access.hasAccess && !dbUser.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      // Use Promise.race with timeout to prevent hanging on slow networks
      const stripeCheck = (async () => {
        try {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover',
          });

          // Check if user has a Stripe customer/subscription that webhook hasn't processed
          const customers = await stripe.customers.list({
            email: user.emailAddresses[0]?.emailAddress,
            limit: 1,
          });
          
          if (customers.data.length > 0) {
            const customer = customers.data[0];
            const subscriptions = await stripe.subscriptions.list({
              customer: customer.id,
              status: 'all',
              limit: 1,
            });
            
            if (subscriptions.data.length > 0) {
              const subscription = subscriptions.data[0];
              const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              // Safely access current_period_end (exists at runtime but TypeScript types may not include it)
              const currentPeriodEnd = (subscription as any).current_period_end 
                ? new Date((subscription as any).current_period_end * 1000) 
                : undefined;
              
              // Update user immediately
              dbUser = await User.findOneAndUpdate(
                { clerkId: user.id },
                {
                  subscriptionStatus: subscription.status === 'trialing' ? 'trialing' : subscription.status === 'active' ? 'active' : 'inactive',
                  subscriptionPlan: subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'monthly' : 'yearly',
                  stripeCustomerId: customer.id,
                  stripeSubscriptionId: subscription.id,
                  trialEndsAt: trialEnd,
                  currentPeriodEnd,
                },
                { new: true }
              );
              
              // Re-check access
              access = checkSubscriptionAccess(dbUser);
            }
          }
        } catch (error) {
          console.error('Error checking Stripe subscription in check-access:', error);
        }
      })();

      // Timeout after 3 seconds to prevent hanging
      const timeout = new Promise(resolve => setTimeout(resolve, 3000));
      await Promise.race([stripeCheck, timeout]);
    }

    const appUrl = await getAppUrl();

    if (access.hasAccess) {
      // Has access (bypass, active, or trialing) - go to dashboard
      return NextResponse.redirect(new URL('/dashboard', appUrl));
    } else {
      // No access - go to pricing/trial page
      return NextResponse.redirect(new URL('/pricing?trial=true', appUrl));
    }
  } catch (error: any) {
    console.error('Check access error:', error);
    // On error, redirect to pricing as fallback
    const appUrl = await getAppUrl();
    return NextResponse.redirect(new URL('/pricing?trial=true', appUrl));
  }
}


