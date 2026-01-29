import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, UserRole } from '@/lib/db';
import { logger } from '@/lib/logger';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * User Sync Endpoint
 * 
 * This endpoint ensures that a Clerk user exists in the MongoDB database.
 * It's called on dashboard load as a backup to the Clerk webhook.
 * 
 * Why this exists:
 * - Clerk webhooks might fail or not be configured
 * - Users who signed up before webhook was configured need to be synced
 * - Provides a reliable fallback to ensure users are always in the database
 */
export async function POST() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase();
    
    if (!email) {
      logger.warn('User sync attempted without email', {
        userId: clerkUser.id,
        route: '/api/user/sync',
      });
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await connectDB();

    // Check if user exists (by clerkId or email)
    let dbUser = await User.findOne({
      $or: [
        { clerkIds: clerkUser.id },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    });

    if (!dbUser) {
      // Create user if doesn't exist
      const role = isAdminEmail(email) ? UserRole.ADMIN : UserRole.USER;
      
      dbUser = await User.create({
        clerkIds: [clerkUser.id],
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        role,
      });

      logger.info('User created via sync endpoint', {
        userId: clerkUser.id,
        email,
        role,
        route: '/api/user/sync',
      });

      return NextResponse.json({ 
        success: true, 
        synced: true, 
        created: true,
        message: 'User created in database' 
      });
    } else if (!dbUser.clerkIds?.includes(clerkUser.id)) {
      // Merge clerkId if user exists by email but missing this clerkId
      if (!dbUser.clerkIds) {
        dbUser.clerkIds = [];
      }
      dbUser.clerkIds.push(clerkUser.id);
      await dbUser.save();

      logger.info('Added clerkId to existing user via sync', {
        userId: clerkUser.id,
        email,
        existingClerkIds: dbUser.clerkIds.length,
        route: '/api/user/sync',
      });

      return NextResponse.json({ 
        success: true, 
        synced: true, 
        merged: true,
        message: 'ClerkId added to existing user' 
      });
    }

    // User already exists and is up to date
    return NextResponse.json({ 
      success: true, 
      synced: true,
      alreadyExists: true,
      message: 'User already synced' 
    });
  } catch (error) {
    logger.error('User sync error', error as Error, {
      route: '/api/user/sync',
    });
    return NextResponse.json(
      { error: 'Sync failed', success: false },
      { status: 500 }
    );
  }
}

