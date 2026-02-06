import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, UserRole } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Manually sync current Clerk user to database
 * Useful for users who registered before webhook was fixed
 */
export async function POST() {
  try {
    // Get current Clerk user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: 'No email address found' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    await connectDB();

    // Check if user already exists
    let dbUser = await User.findOne({ clerkIds: clerkUser.id });

    if (dbUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists in database',
        user: {
          id: dbUser._id,
          email: dbUser.email,
          clerkIds: dbUser.clerkIds,
        },
      });
    }

    // Try to find by email (maybe created via admin grant)
    dbUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${emailLower}$`, 'i') } 
    });

    if (dbUser) {
      // User exists by email, just add Clerk ID
      if (!dbUser.clerkIds) {
        dbUser.clerkIds = [];
      }
      if (!dbUser.clerkIds.includes(clerkUser.id)) {
        dbUser.clerkIds.push(clerkUser.id);
        await dbUser.save();
        
        logger.info('Added Clerk ID to existing user', {
          userId: clerkUser.id,
          email: emailLower,
          dbUserId: dbUser._id.toString(),
        });

        return NextResponse.json({
          success: true,
          message: 'Clerk ID added to existing user',
          action: 'merged',
          user: {
            id: dbUser._id,
            email: dbUser.email,
            clerkIds: dbUser.clerkIds,
            hadPreviousAccess: !!dbUser.subscriptionStatus,
          },
        });
      }
    }

    // User doesn't exist at all - create new
    const role = isAdminEmail(emailLower) ? UserRole.ADMIN : UserRole.USER;
    
    dbUser = await User.create({
      clerkIds: [clerkUser.id],
      email: emailLower,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      name: clerkUser.fullName,
      imageUrl: clerkUser.imageUrl,
      role,
    });

    logger.info('User created via manual sync', {
      userId: clerkUser.id,
      email: emailLower,
      role,
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      action: 'created',
      user: {
        id: dbUser._id,
        email: dbUser.email,
        clerkIds: dbUser.clerkIds,
        role: dbUser.role,
      },
    });
  } catch (error: any) {
    console.error('[sync-from-clerk] Error:', error);
    logger.error('User sync from Clerk failed', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

