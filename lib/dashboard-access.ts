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
  let dbUser = await User.findOne({ clerkId: clerkUser?.id });

  if (!dbUser) {
    dbUser = await User.create({
      clerkId: clerkUser?.id,
      email: email || '',
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName,
      name: clerkUser?.fullName,
      imageUrl: clerkUser?.imageUrl,
      isAdmin: isAdminEmail(email),
    });
  } else if (isAdminEmail(email) && !dbUser.isAdmin) {
    dbUser.isAdmin = true;
    await dbUser.save();
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