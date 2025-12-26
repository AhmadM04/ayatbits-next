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
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const emailLower = email?.toLowerCase();

  // 1) Try by current clerkId
  let dbUser = await User.findOne({ clerkId: clerkUser?.id });

  // 2) If not found, try merge by email (case-insensitive) and attach new clerkId
  if (!dbUser && emailLower) {
    dbUser = await User.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
    if (dbUser && clerkUser?.id) {
      dbUser.clerkId = clerkUser.id as string;
    }
  }

  // 3) If still not found, create new
  if (!dbUser) {
    dbUser = await User.create({
      clerkId: clerkUser?.id ?? '',
      email: emailLower || '',
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
}

export async function getAdminUser() {
  const user = await currentUser();
  if (!user) return null;

  await connectDB();
  const dbUser = await ensureDbUser(user);
  if (!dbUser?.isAdmin) return null;
  return dbUser;
}

/**
 * Check if user has dashboard access and redirect if not (except admin bypass)
 */
export async function requireDashboardAccess() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  await connectDB();
  
  const dbUser = await ensureDbUser(user);
  
  if (!dbUser) {
    redirect('/onboarding'); // Or wherever new users go
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
}

export async function requireAdminUser() {
  const dbUser = await getAdminUser();
  if (!dbUser) {
    redirect('/dashboard');
  }
  return dbUser;
}