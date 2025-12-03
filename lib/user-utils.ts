import { User } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Find or create a user, handling cases where:
 * 1. User exists with clerkId (normal case)
 * 2. User exists with email but no clerkId (created by admin before sign-in)
 * 3. User doesn't exist (new user)
 */
export async function findOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const userEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
  
  // First, try to find by clerkId (normal case)
  let dbUser = await User.findOne({ clerkId: clerkUser.id });
  
  if (!dbUser) {
    // Check if user exists by email (created by admin before they signed in)
    dbUser = await User.findOne({ email: userEmail });
    
    if (dbUser) {
      // User was created by admin - update with Clerk ID and info
      dbUser = await User.findOneAndUpdate(
        { email: userEmail },
        {
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          name: clerkUser.fullName,
          imageUrl: clerkUser.imageUrl,
        },
        { new: true }
      );
    } else {
      // New user - create
      dbUser = await User.create({
        clerkId: clerkUser.id,
        email: userEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        subscriptionStatus: 'inactive',
      });
    }
  }
  
  return dbUser;
}

