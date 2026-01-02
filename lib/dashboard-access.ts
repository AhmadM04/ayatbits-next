import { redirect } from 'next/navigation';
import { connectDB, User } from '@/lib/db';
import { checkSubscription } from './subscription';
import { currentUser } from '@clerk/nextjs/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

async function ensureDbUser(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  // Validate required data exists
  if (!clerkUser?.id) {
    throw new Error('Clerk user ID is missing');
  }

  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const emailLower = email?.toLowerCase();

  // Email might not be available immediately during OAuth sign-up
  if (!emailLower) {
    // Wait a moment and retry - sometimes email takes a moment to populate
    // This handles OAuth providers that don't immediately provide email
    throw new Error('Email address is required but not yet available. Please complete your profile setup or try signing in again.');
  }

  await connectDB();

  try {
    // 1) Try by current clerkId
    let dbUser = await User.findOne({ clerkId: clerkUser.id });

    // 2) If not found, try merge by email (case-insensitive) and attach new clerkId
    if (!dbUser && emailLower) {
      dbUser = await User.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
      if (dbUser && clerkUser.id) {
        dbUser.clerkId = clerkUser.id as string;
        await dbUser.save();
      }
    }

    // 3) If still not found, create new
    if (!dbUser) {
      dbUser = await User.create({
        clerkId: clerkUser.id, // No fallback - validated above
        email: emailLower, // No fallback - validated above
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        name: clerkUser?.fullName,
        imageUrl: clerkUser?.imageUrl,
        isAdmin: isAdminEmail(emailLower),
      });
    } else {
    // 4) Keep admin flag in sync
    const shouldBeAdmin = isAdminEmail(emailLower);
    if (shouldBeAdmin && !dbUser.isAdmin) {
      dbUser.isAdmin = true;
    }
    
    // 5) Sync user profile data from Clerk (name, image, etc.)
    let hasChanges = false;
    if (clerkUser?.firstName && dbUser.firstName !== clerkUser.firstName) {
      dbUser.firstName = clerkUser.firstName;
      hasChanges = true;
    }
    if (clerkUser?.lastName && dbUser.lastName !== clerkUser.lastName) {
      dbUser.lastName = clerkUser.lastName;
      hasChanges = true;
    }
    if (clerkUser?.fullName && dbUser.name !== clerkUser.fullName) {
      dbUser.name = clerkUser.fullName;
      hasChanges = true;
    }
    if (clerkUser?.imageUrl && dbUser.imageUrl !== clerkUser.imageUrl) {
      dbUser.imageUrl = clerkUser.imageUrl;
      hasChanges = true;
    }
    
    // 6) Persist any updates (clerkId/admin flag/profile data)
    if (hasChanges || dbUser.isModified()) {
      await dbUser.save();
    }
    }

    return dbUser;
  } catch (error: any) {
    // Handle duplicate key errors (race condition - user created between check and create)
    if (error.code === 11000) {
      // User was created between our check and create - fetch it
      const existingUser = await User.findOne({ 
        $or: [
          { clerkId: clerkUser.id },
          { email: emailLower }
        ]
      });
      if (existingUser) {
        return existingUser;
      }
    }
    
    console.error('Error ensuring DB user:', error);
    throw error;
  }
}

export async function getAdminUser() {
  const user = await currentUser();
  if (!user) return null;

  try {
    await connectDB();
    const dbUser = await ensureDbUser(user);
    if (!dbUser?.isAdmin) return null;
    return dbUser;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Check if user has dashboard access and redirect if not (except admin bypass)
 */
export async function requireDashboardAccess() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  try {
    const dbUser = await ensureDbUser(user); // ensureDbUser already calls connectDB()
    
    if (!dbUser) {
      redirect('/onboarding');
    }

    // Admins always have access without subscription checks
    if (dbUser.isAdmin) {
      return dbUser;
    }

    // Use the standard checkSubscription function
    const hasAccess = checkSubscription(dbUser);

    if (!hasAccess) {
      redirect('/pricing');
    }

    return dbUser;
  } catch (error: any) {
    console.error('Dashboard access error:', error);
    
    // If email is missing, redirect to sign-in with error message
    if (error.message?.includes('Email address is required')) {
      redirect('/sign-in?error=email_required');
    }
    
    // If clerkId is missing, redirect to sign-in
    if (error.message?.includes('Clerk user ID is missing')) {
      redirect('/sign-in?error=auth_error');
    }
    
    // For other errors, redirect to sign-in with generic error
    redirect('/sign-in?error=setup_required');
  }
}

export async function requireAdminUser() {
  const dbUser = await getAdminUser();
  if (!dbUser) {
    redirect('/dashboard');
  }
  return dbUser;
}