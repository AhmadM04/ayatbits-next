'use server';

import { connectDB, User, SubscriptionStatusEnum, AdminGrantLog, UserRole } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/dashboard-access';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export type GrantDuration =
  | 'lifetime'
  | '1_month'
  | '3_months'
  | '6_months'
  | '1_year'
  | 'revoke';

function addMonths(base: Date, months: number) {
  const copy = new Date(base);
  copy.setMonth(base.getMonth() + months);
  return copy;
}

async function sendGrantEmail(to: string, duration: GrantDuration) {
  // Stub for email notification; replace with real provider (e.g., SendGrid, SES)
  logger.debug('Grant email sent', { to, grantDuration: duration });
}

export async function grantPremiumAccess(email: string, duration: GrantDuration) {
  // 1. Security Check
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return { success: false, error: 'Forbidden: You are not an admin.' };
  }

  if (!email) return { success: false, error: 'User email is required' };

  // 2. Normalize email input (lowercase and trim)
  const normalizedEmail = email.toLowerCase().trim();

  try {
    await connectDB();

    // 3. Find existing user first to verify they exist
    let existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });

    if (!existingUser) {
      // User doesn't exist in database yet
      logger.warn('User not found in database, will create placeholder', {
        email: normalizedEmail,
        adminEmail: adminUser.email,
      });
      
      if (duration === 'revoke') {
        return { 
          success: false, 
          error: `No user found with email "${normalizedEmail}". Cannot revoke access for non-existent user.`
        };
      }
      
      // Create a placeholder user that will be merged when they sign in
      // This allows admins to grant access before the user has signed up/in
      const role = isAdminEmail(normalizedEmail) ? UserRole.ADMIN : UserRole.USER;
      
      try {
        existingUser = await User.create({
          email: normalizedEmail,
          clerkIds: [], // Empty - will be populated when user signs in via webhook or sync
          role,
          subscriptionStatus: SubscriptionStatusEnum.INACTIVE, // Will be updated below
        });
        
        logger.info('Created placeholder user for admin grant', {
          email: normalizedEmail,
          userId: existingUser._id.toString(),
          role,
          adminEmail: adminUser.email,
        });
      } catch (createError: any) {
        // Handle duplicate key error (race condition)
        if (createError.code === 11000) {
          // User was created between our check and create - fetch it
          existingUser = await User.findOne({ 
            email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
          });
          if (!existingUser) {
            return { 
              success: false, 
              error: `Failed to create or find user with email "${normalizedEmail}".`
            };
          }
        } else {
          throw createError;
        }
      }
    }

    // Log before update (existingUser is guaranteed to exist here)
    logger.info('Granting access to existing user', {
      email: normalizedEmail,
      userId: existingUser._id.toString(),
      clerkIds: existingUser.clerkIds || [],
      currentStatus: existingUser.subscriptionStatus,
      currentPlan: existingUser.subscriptionPlan,
      hasDirectAccess: existingUser.hasDirectAccess,
      grantDuration: duration,
    });

    // 4. Determine update fields based on duration
    let updateData: any = {};
    const now = new Date();

    switch (duration) {
      case 'lifetime':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'lifetime',
            subscriptionTier: 'pro',
            subscriptionEndDate: null, 
            trialEndsAt: null,
            hasDirectAccess: true,
          },
        };
        break;

      case '1_month':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'monthly',
            subscriptionTier: 'pro',
            subscriptionEndDate: addMonths(now, 1),
            trialEndsAt: null,
            hasDirectAccess: true,
          },
        };
        break;

      case '3_months':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'monthly',
            subscriptionTier: 'pro',
            subscriptionEndDate: addMonths(now, 3),
            trialEndsAt: null,
            hasDirectAccess: true,
          },
        };
        break;

      case '6_months':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'monthly',
            subscriptionTier: 'pro',
            subscriptionEndDate: addMonths(now, 6),
            trialEndsAt: null,
            hasDirectAccess: true,
          },
        };
        break;

      case '1_year':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'yearly',
            subscriptionTier: 'pro',
            subscriptionEndDate: addMonths(now, 12),
            trialEndsAt: null,
            hasDirectAccess: true,
          },
        };
        break;

      case 'revoke':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.INACTIVE,
            subscriptionEndDate: null,
            trialEndsAt: null,
            hasDirectAccess: false,
          },
          $unset: { subscriptionPlan: 1, subscriptionTier: 1 },
        };
        break;
      default:
        return { success: false, error: 'Invalid duration' };
    }

    // 5. Update by _id to ensure we update the exact user (no duplicates)
    const updatedUser = await User.findOneAndUpdate(
      { _id: existingUser._id },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      logger.error('Failed to update user after finding them', undefined, {
        email: normalizedEmail,
        userId: existingUser._id.toString(),
      });
      return {
        success: false,
        error: 'Failed to update user. Please try again.',
      };
    }

    // Log after update
    logger.info('Successfully granted access', {
      email: updatedUser.email,
      userId: updatedUser._id.toString(),
      clerkIds: updatedUser.clerkIds || [],
      newStatus: updatedUser.subscriptionStatus,
      newPlan: updatedUser.subscriptionPlan,
      hasDirectAccess: updatedUser.hasDirectAccess,
      grantDuration: duration,
    });

    // 6. Log the grant for audit
    await AdminGrantLog.create({
      adminId: adminUser.clerkIds?.[0] || 'unknown',
      adminEmail: adminUser.email,
      targetEmail: updatedUser.email,
      duration,
    });

    await sendGrantEmail(updatedUser.email, duration);
    
    // Revalidate all relevant paths to clear cache
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/pricing');
    revalidatePath('/api/check-access');
    
    const action = duration === 'revoke' ? 'Revoked access for' : `Granted ${duration} access to`;
    const signUpUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/sign-up?email=${encodeURIComponent(normalizedEmail)}`;
    
    securityLogger.logAdminAction(action, {
      email: updatedUser.email,
      userId: updatedUser._id.toString(),
      clerkIds: updatedUser.clerkIds || [],
      grantDuration: duration,
      adminEmail: adminUser.email,
    });
    
    const clerkIdInfo = updatedUser.clerkIds && updatedUser.clerkIds.length > 0 
      ? ` (User has ${updatedUser.clerkIds.length} Clerk ID(s))`
      : ' (Warning: User has no Clerk IDs yet)';
    
    return { 
      success: true, 
      message: `Successfully ${action} ${updatedUser.email}${clerkIdInfo}. Changes take effect immediately.`,
      signUpUrl: duration !== 'revoke' ? signUpUrl : undefined
    };
  } catch (error) {
    logger.error('Admin grant error', error instanceof Error ? error : undefined, {
      email: normalizedEmail,
      grantDuration: duration,
      adminEmail: adminUser?.email,
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: `Failed to grant access: ${errorMessage}` 
    };
  }
}