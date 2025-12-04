import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';
import { checkSubscriptionAccess } from './subscription';

/**
 * Check if user has dashboard access and redirect if not (except admin bypass)
 * Returns the user object if access is granted
 */
export async function requireDashboardAccess(clerkId: string) {
  await connectDB();
  
  let dbUser = await User.findOne({ clerkId });
  
  if (!dbUser) {
    // New user - create as INACTIVE and redirect to pricing
    dbUser = await User.create({
      clerkId,
      email: '', // Will be populated by calling page if needed
      subscriptionStatus: 'inactive', // No automatic trial
    });
    redirect('/pricing?reason=needs_subscription');
  }

  // Check subscription access
  const access = checkSubscriptionAccess(dbUser);
  
  // Allow access if:
  // 1. User has access (trialing, active, etc.)
  // 2. User has admin bypass
  if (!access.hasAccess && !dbUser.hasBypass) {
    redirect(`/pricing?reason=${access.status}`);
  }

  return dbUser;
}

