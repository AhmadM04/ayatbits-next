import { currentUser } from '@clerk/nextjs/server';
import { connectDB } from './db';
import User from './models/User';

// Legacy admin emails (for backward compatibility)
const LEGACY_ADMIN_EMAILS = [
  'ahmad.muhhamedsin@gmail.com',
  'latifa.muhhamedsina@gmail.com',
  'nura.muhhamedsina@gmail.com',
  'iman.mahmutova@gmail.com'
];

/**
 * Check if the current user is an admin
 * Checks both legacy hardcoded emails and database isAdmin field
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;

    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    if (!userEmail) return false;

    // Check legacy hardcoded emails first (for backward compatibility)
    if (LEGACY_ADMIN_EMAILS.includes(userEmail)) {
      return true;
    }

    // Check database isAdmin field
    await connectDB();
    const dbUser = await User.findOne({ 
      $or: [
        { email: userEmail },
        { clerkId: user.id }
      ]
    });

    return dbUser?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin emails list (for display purposes)
 */
export function getAdminEmails(): string[] {
  return LEGACY_ADMIN_EMAILS;
}

