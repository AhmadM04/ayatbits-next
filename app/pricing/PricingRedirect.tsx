import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';
import { checkSubscriptionAccess } from '@/lib/subscription';

export default async function PricingRedirect() {
  const user = await currentUser();
  
  if (!user) {
    return null; // Not signed in, show pricing page
  }

  await connectDB();
  
  // Check if user has subscription
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  let dbUser = await User.findOne({ clerkId: user.id });
  
  if (!dbUser) {
    dbUser = await User.findOne({ email: userEmail });
  }

  if (dbUser) {
    const access = checkSubscriptionAccess(dbUser);
    
    // If user has access (active, trialing, or bypass), redirect to dashboard
    if (access.hasAccess) {
      redirect('/dashboard');
    }
  }

  return null; // No subscription, show pricing page
}


