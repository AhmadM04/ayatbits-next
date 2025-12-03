import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';

/**
 * Profile layout - allows access even without subscription
 * Users can view their profile, email, and settings before starting a trial
 */
export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  await connectDB();

  // Find or create user (same logic as dashboard layout)
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
      // New user - create without subscription
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

  // No subscription check - allow access to profile
  return <>{children}</>;
}

