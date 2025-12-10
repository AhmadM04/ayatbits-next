'use server';

import { connectDB, User, SubscriptionStatusEnum } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/dashboard-access';
import AdminGrantLog from '@/lib/models/AdminGrantLog';

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
  console.log(`[grantPremiumAccess] Email to ${to} for ${duration}`);
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

    // 2. Resolve target user by email (must already exist + have clerkId)
    const targetUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!targetUser) {
      return { success: false, error: 'User not found. Ask them to sign up with Clerk first.' };
    }
    if (!targetUser.clerkId) {
      return { success: false, error: 'User record exists without a Clerk ID. Ask them to re-sign in.' };
    }

    // 3. Determine update fields based on duration
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
          },
        };
        break;

      case 'revoke':
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.INACTIVE,
            subscriptionEndDate: null,
            trialEndsAt: null,
          },
          $unset: { subscriptionPlan: 1 },
        };
        break;
      default:
        return { success: false, error: 'Invalid duration' };
    }

    // 4. Update by clerkId only (no upsert)
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: targetUser.clerkId },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return { success: false, error: 'Failed to update user by Clerk ID.' };
    }

    // 5. Log the grant for audit
    await AdminGrantLog.create({
      adminId: adminUser.clerkId,
      adminEmail: adminUser.email,
      targetEmail: updatedUser.email,
      duration,
    });

    await sendGrantEmail(updatedUser.email, duration);
    revalidatePath('/admin');

    const action = duration === 'revoke' ? 'Revoked access for' : `Granted ${duration} access to`;
    return { success: true, message: `Successfully ${action} ${updatedUser.email}` };
  } catch (error) {
    console.error('Admin grant error:', error);
    return { success: false, error: 'Database connection failed' };
  }
}