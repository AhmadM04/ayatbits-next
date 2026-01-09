/**
 * Script to grant access to a user by email
 * 
 * Usage:
 * npx tsx scripts/grant-lifetime-access.ts your-email@example.com [duration]
 * 
 * Durations:
 * - lifetime (default)
 * - 1_month
 * - 3_months
 * - 6_months
 * - 1_year
 * - revoke
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { connectDB, User, SubscriptionStatusEnum } from '../lib/db';

// Load environment variables from .env.local first, then .env as fallback
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

type GrantDuration = 'lifetime' | '1_month' | '3_months' | '6_months' | '1_year' | 'revoke';

function addMonths(base: Date, months: number) {
  const copy = new Date(base);
  copy.setMonth(base.getMonth() + months);
  return copy;
}

async function grantAccess(email: string, duration: GrantDuration = 'lifetime') {
  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: npx tsx scripts/grant-lifetime-access.ts your-email@example.com [duration]');
    console.log('\nDurations: lifetime (default), 1_month, 3_months, 6_months, 1_year, revoke');
    process.exit(1);
  }

  const validDurations: GrantDuration[] = ['lifetime', '1_month', '3_months', '6_months', '1_year', 'revoke'];
  if (!validDurations.includes(duration)) {
    console.error(`❌ Error: Invalid duration "${duration}"`);
    console.log('Valid durations: lifetime, 1_month, 3_months, 6_months, 1_year, revoke');
    process.exit(1);
  }

  // Check if MONGODB_URL is loaded
  if (!process.env.MONGODB_URL) {
    console.error('❌ Error: MONGODB_URL not found in environment variables');
    console.log('💡 Make sure you have a .env.local or .env file with MONGODB_URL set');
    process.exit(1);
  }

  try {
    console.log(`🔄 Connecting to database...`);
    await connectDB();

    console.log(`🔍 Looking for user with email: ${email}`);
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\n💡 Tip: The user must sign in at least once before you can grant access.');
      process.exit(1);
    }

    console.log(`\n📋 Current user status:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Clerk ID: ${user.clerkId || 'Not set'}`);
    console.log(`   Subscription Plan: ${user.subscriptionPlan || 'None'}`);
    console.log(`   Subscription Status: ${user.subscriptionStatus || 'None'}`);
    console.log(`   Subscription End Date: ${user.subscriptionEndDate || 'None'}`);
    console.log(`   Trial Ends At: ${user.trialEndsAt || 'None'}`);
    console.log(`   Is Admin: ${user.isAdmin || false}`);

    const now = new Date();
    
    console.log(`\n✨ Granting ${duration} access...`);

    switch (duration) {
      case 'lifetime':
        user.subscriptionPlan = 'lifetime';
        user.subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
        user.subscriptionEndDate = undefined;
        user.trialEndsAt = undefined;
        user.hasDirectAccess = true;
        break;

      case '1_month':
        user.subscriptionPlan = 'monthly';
        user.subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
        user.subscriptionEndDate = addMonths(now, 1);
        user.trialEndsAt = undefined;
        user.hasDirectAccess = true;
        break;

      case '3_months':
        user.subscriptionPlan = 'monthly';
        user.subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
        user.subscriptionEndDate = addMonths(now, 3);
        user.trialEndsAt = undefined;
        user.hasDirectAccess = true;
        break;

      case '6_months':
        user.subscriptionPlan = 'monthly';
        user.subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
        user.subscriptionEndDate = addMonths(now, 6);
        user.trialEndsAt = undefined;
        user.hasDirectAccess = true;
        break;

      case '1_year':
        user.subscriptionPlan = 'yearly';
        user.subscriptionStatus = SubscriptionStatusEnum.ACTIVE;
        user.subscriptionEndDate = addMonths(now, 12);
        user.trialEndsAt = undefined;
        user.hasDirectAccess = true;
        break;

      case 'revoke':
        user.subscriptionStatus = SubscriptionStatusEnum.INACTIVE;
        user.subscriptionPlan = undefined;
        user.subscriptionEndDate = undefined;
        user.trialEndsAt = undefined;
        user.hasDirectAccess = false;
        break;
    }

    await user.save();

    console.log(`\n✅ Success! ${duration === 'revoke' ? 'Access revoked' : duration + ' access granted'} for ${user.email}`);
    console.log(`\n📋 Updated user status:`);
    console.log(`   Subscription Plan: ${user.subscriptionPlan || 'None'}`);
    console.log(`   Subscription Status: ${user.subscriptionStatus}`);
    console.log(`   Subscription End Date: ${user.subscriptionEndDate || 'None'}`);
    console.log(`   Trial Ends At: ${user.trialEndsAt || 'None'}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Get email and duration from command line args
const email = process.argv[2];
const duration = (process.argv[3] || 'lifetime') as GrantDuration;
grantAccess(email, duration);

