'use server';

import { connectDB, User, SubscriptionStatusEnum, AdminGrantLog } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/dashboard-access';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';

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

  try {
    await connectDB();

    // 2. Determine update fields based on duration
    let updateData: any = {};
    const now = new Date();

    switch (duration) {
      case 'lifetime':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'lifetime',
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
          $unset: { subscriptionPlan: 1 },
        };
        break;
      default:
        return { success: false, error: 'Invalid duration' };
    }

    // 4. Upsert by email (case-insensitive). Works even if user hasn't visited dashboard yet.
    const updatedUser = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      {
        ...updateData,
        $setOnInsert: {
          email: email.toLowerCase(),
          isAdmin: false,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 5. Log the grant for audit
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
    const signUpUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/sign-up?email=${encodeURIComponent(email)}`;
    
    securityLogger.logAdminAction(action, {
      email: updatedUser.email,
      grantDuration: duration,
      adminEmail: adminUser.email,
    });
    
    return { 
      success: true, 
      message: `Successfully ${action} ${updatedUser.email}. User will see access within 5 seconds if they're on the pricing page.`,
      signUpUrl: duration !== 'revoke' ? signUpUrl : undefined
    };
  } catch (error) {
    logger.error('Admin grant error', error as Error, {
      email,
      grantDuration: duration,
      adminEmail: adminUser?.email,
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: `Database connection failed: ${errorMessage}` 
    };
  }
}