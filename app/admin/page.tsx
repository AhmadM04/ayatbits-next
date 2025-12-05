'use server';

import connectDB from '@/lib/mongodb';
import User, { SubscriptionStatusEnum } from '@/lib/models/User';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export type GrantDuration = 'lifetime' | '1_month' | '1_year' | 'revoke';

export async function grantPremiumAccess(email: string, duration: GrantDuration) {
  // 1. Security Check
  const user = await currentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Replace with your actual admin emails or env variable
  const ADMIN_EMAILS = [
    'ahmad@ayatbits.com', 
    'admin@ayatbits.com',
    process.env.ADMIN_EMAIL // Ensure this is set in your .env.local
  ].filter(Boolean); // Remove undefined if env var is missing

  const userEmail = user.emailAddresses[0]?.emailAddress;

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    console.warn(`Unauthorized admin attempt by ${userEmail}`);
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
        // Lifetime access: Active status, Lifetime plan, No end date
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'lifetime',
            subscriptionEndDate: null, 
            trialEndsAt: null, // Clear any trial data
          }
        };
        break;

      case '1_month':
        // 1 Month access: Active status, Monthly plan, End date = Now + 1 Month
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'monthly',
            subscriptionEndDate: nextMonth,
            trialEndsAt: null,
          }
        };
        break;

      case '1_year':
        // 1 Year access: Active status, Yearly plan, End date = Now + 1 Year
        const nextYear = new Date(now);
        nextYear.setFullYear(now.getFullYear() + 1);

        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
            subscriptionPlan: 'yearly',
            subscriptionEndDate: nextYear,
            trialEndsAt: null,
          }
        };
        break;

      case 'revoke':
        // Revoke access: Inactive status, Remove Plan, Remove End Date
        // This forces the user to the "Select a Plan" state in your app logic
        updateData = {
          $set: {
            subscriptionStatus: SubscriptionStatusEnum.INACTIVE,
            subscriptionEndDate: null,
            trialEndsAt: null,
          },
          $unset: { subscriptionPlan: 1 } // Remove the plan field entirely
        };
        break;
    }

    // 3. Find and update the user
    // Case-insensitive email search to be safe
    const updatedUser = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return { success: false, error: 'User not found. Ask them to sign up first.' };
    }

    revalidatePath('/admin');
    
    const action = duration === 'revoke' ? 'Revoked access for' : `Granted ${duration} access to`;
    return { success: true, message: `Successfully ${action} ${updatedUser.email}` };

  } catch (error) {
    console.error('Admin grant error:', error);
    return { success: false, error: 'Database connection failed' };
  }
}