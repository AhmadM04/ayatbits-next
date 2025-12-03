import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { connectDB, User } from '@/lib/db';
import DashboardI18nProvider from './DashboardI18nProvider';
import { checkSubscriptionAccess } from '@/lib/subscription';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
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
      // New user - create without subscription (needs to add payment first)
      dbUser = await User.create({
        clerkId: user.id,
        email: userEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
        subscriptionStatus: 'inactive', // Must subscribe to access
      });
    }
  }

  // Check subscription access
  let access = checkSubscriptionAccess(dbUser);

  // If no access, check if user just completed checkout (webhook might not have processed yet)
  if (!access.hasAccess && process.env.STRIPE_SECRET_KEY) {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });

    // Check if user has a Stripe customer/subscription that webhook hasn't processed
    try {
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
          
          // Update user immediately
          dbUser = await User.findOneAndUpdate(
            { clerkId: user.id },
            {
              subscriptionStatus: subscription.status === 'trialing' ? 'trialing' : 'active',
              subscriptionPlan: subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'monthly' : 'yearly',
              stripeCustomerId: customer.id,
              stripeSubscriptionId: subscription.id,
              trialEndsAt: trialEnd,
              currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
            },
            { new: true }
          );
          
          // Re-check access
          access = checkSubscriptionAccess(dbUser);
        }
      }
    } catch (error) {
      console.error('Error checking Stripe subscription in layout:', error);
    }
  }

  // Note: Profile page has its own layout that bypasses subscription check
  // Only check subscription for other dashboard pages
  // The profile layout will handle its own access
  if (!access.hasAccess) {
    // Try to get pathname from headers (set by middleware if available)
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    
    // Allow profile page access
    if (!pathname.includes('/dashboard/profile')) {
      redirect('/pricing?trial=true');
    }
  }

  const selectedTranslation = dbUser.selectedTranslation || 'en.sahih';

  return (
    <DashboardI18nProvider translationCode={selectedTranslation}>
      {children}
    </DashboardI18nProvider>
  );
}
