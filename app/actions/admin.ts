'use server';

import { connectDB, User } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';

// Admin email(s) - you can make this an environment variable
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function grantPremiumAccess(email: string) {
  // 1. Security Check - verify admin
  const user = await currentUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized - not signed in' };
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return { success: false, error: 'Unauthorized - admin access required' };
  }

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  try {
    await connectDB();
    
    // 2. Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } }, // Case insensitive search
      { 
        subscriptionStatus: 'active',
        subscriptionPlan: 'lifetime',
        hasBypass: true, // Also grant bypass access
      },
      { new: true }
    );

    if (!updatedUser) {
      return { success: false, error: 'User not found. Ask them to sign up first.' };
    }

    revalidatePath('/admin');
    return { success: true, message: `Successfully granted Lifetime Premium access to ${updatedUser.email}` };
  } catch (error: any) {
    console.error('Admin grant access error:', error);
    return { success: false, error: error.message || 'Database error' };
  }
}

export async function revokePremiumAccess(email: string) {
  // 1. Security Check - verify admin
  const user = await currentUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized - not signed in' };
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return { success: false, error: 'Unauthorized - admin access required' };
  }

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  try {
    await connectDB();
    
    // 2. Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      { 
        subscriptionStatus: 'inactive',
        subscriptionPlan: undefined,
        hasBypass: false,
      },
      { new: true }
    );

    if (!updatedUser) {
      return { success: false, error: 'User not found.' };
    }

    revalidatePath('/admin');
    return { success: true, message: `Successfully revoked Premium access from ${updatedUser.email}` };
  } catch (error: any) {
    console.error('Admin revoke access error:', error);
    return { success: false, error: error.message || 'Database error' };
  }
}

