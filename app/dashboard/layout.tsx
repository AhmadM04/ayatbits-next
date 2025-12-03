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
  // Parallelize user fetch and DB connection for faster loading
  const [user, dbConnection] = await Promise.all([
    currentUser(),
    connectDB().catch(() => null), // Don't block if DB fails
  ]);

  if (!user) {
    redirect('/sign-in');
  }

  // If DB connection failed, try once more with timeout
  if (!dbConnection) {
    try {
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(null), 1000); // 1 second timeout
      });
      await Promise.race([connectDB(), timeoutPromise]);
    } catch (error) {
      // Continue anyway - some pages might work without DB
      console.error('DB connection failed:', error);
    }
  }

  // Find or create user - use lean() for faster queries
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  let dbUser = await User.findOne({ clerkId: user.id }).lean() as any;
  
  if (!dbUser) {
    // Check if user exists by email (created by admin before they signed in)
    dbUser = await User.findOne({ email: userEmail }).lean() as any;
    
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
        { new: true, lean: true }
      ) as any;
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
      dbUser = dbUser.toObject(); // Convert to plain object
    }
  }

  // Check subscription access
  let access = checkSubscriptionAccess(dbUser);

  // Only check Stripe if user doesn't have access AND doesn't have a stripeCustomerId
  // This avoids slow Stripe API calls on every page load
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!access.hasAccess && !dbUser.stripeCustomerId && stripeSecretKey) {
    // Use Promise.race with timeout to prevent hanging on slow networks
    const stripeCheck = async () => {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey, {
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
            const updatedUser = await User.findOneAndUpdate(
              { clerkId: user.id },
              {
                subscriptionStatus: subscription.status === 'trialing' ? 'trialing' : subscription.status === 'active' ? 'active' : 'inactive',
                subscriptionPlan: subscription.items.data[0]?.price?.recurring?.interval === 'month' ? 'monthly' : 'yearly',
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                trialEndsAt: trialEnd,
                currentPeriodEnd,
              },
              { new: true, lean: true }
            ) as any;
            
            // Update outer scope variables
            Object.assign(dbUser, updatedUser);
            access = checkSubscriptionAccess(dbUser);
          }
        }
      } catch (error) {
        console.error('Error checking Stripe subscription in layout:', error);
      }
    };

    // Timeout after 1.5 seconds to prevent hanging on mobile
    const timeout = new Promise(resolve => setTimeout(resolve, 1500));
    await Promise.race([stripeCheck(), timeout]);
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
