import { redirect } from 'next/navigation';
import { connectDB, User, UserRole } from '@/lib/db';
import { checkSubscription } from './subscription';
import { currentUser } from '@clerk/nextjs/server';
import { logger } from './logger';

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
    // 1) Try by current clerkId (MongoDB automatically searches arrays)
    let dbUser = await User.findOne({ clerkIds: clerkUser.id });

    // 2) If not found, try merge by email (case-insensitive) and add new clerkId
    if (!dbUser && emailLower) {
      logger.debug('User not found by clerkId, searching by email', { email: emailLower });
      dbUser = await User.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
      if (dbUser) {
        logger.info('Merging existing user account', {
          userId: clerkUser.id,
          email: emailLower,
          existingClerkIds: dbUser.clerkIds || [],
        });
        // Add the new clerkId to the array if not already present
        if (!dbUser.clerkIds) {
          dbUser.clerkIds = [];
        }
        if (!dbUser.clerkIds.includes(clerkUser.id)) {
          dbUser.clerkIds.push(clerkUser.id);
          logger.info('Added new clerkId to user account', { 
            userId: clerkUser.id, 
            email: emailLower,
            totalClerkIds: dbUser.clerkIds.length 
          });
        }
        await dbUser.save();
        logger.info('Account merged successfully', { userId: clerkUser.id, email: emailLower });
      } else {
        logger.debug('No existing user found, will create new', { email: emailLower });
      }
    }

    // 3) If still not found, create new
    if (!dbUser) {
      const role = isAdminEmail(emailLower) ? UserRole.ADMIN : UserRole.USER;
      dbUser = await User.create({
        clerkIds: [clerkUser.id], // Store as array
        email: emailLower, // No fallback - validated above
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        name: clerkUser?.fullName,
        imageUrl: clerkUser?.imageUrl,
        role,
      });
    } else {
    // 4) Keep admin role in sync
    const shouldBeAdmin = isAdminEmail(emailLower);
    if (shouldBeAdmin && dbUser.role !== UserRole.ADMIN) {
      dbUser.role = UserRole.ADMIN;
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
          { clerkIds: clerkUser.id },
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
    if (dbUser?.role !== UserRole.ADMIN) return null;
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
      console.log('[requireDashboardAccess] No DB user found, redirecting to onboarding');
      redirect('/onboarding');
    }

    console.log('[requireDashboardAccess] DB User found:', {
      email: dbUser.email,
      clerkIds: dbUser.clerkIds,
      role: dbUser.role,
      hasDirectAccess: dbUser.hasDirectAccess,
      subscriptionPlan: dbUser.subscriptionPlan,
      subscriptionStatus: dbUser.subscriptionStatus,
      subscriptionEndDate: dbUser.subscriptionEndDate,
      trialEndsAt: dbUser.trialEndsAt,
    });

    // Admins always have access without subscription checks
    if (dbUser.role === UserRole.ADMIN) {
      console.log('[requireDashboardAccess] Admin user - access granted');
      return dbUser;
    }

    // ========================================================================
    // LOOP BREAKER FIX: Allow all authenticated users to access dashboard
    // ========================================================================
    // Free tier users (without subscriptions) can access dashboard with limited features
    // DO NOT redirect to pricing - just let them through
    // The dashboard will show upgrade prompts for limited features
    // ========================================================================
    console.log('[requireDashboardAccess] Authenticated user - access granted (includes Free tier)');
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