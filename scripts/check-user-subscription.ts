/**
 * Debug script to check a user's subscription status
 * Usage: npx tsx scripts/check-user-subscription.ts <email>
 */

import { connectDB, User } from '../lib/db';

async function checkUser(email: string) {
  try {
    await connectDB();
    
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }

    console.log('\n✅ User Found!');
    console.log('==========================================');
    console.log('Email:', user.email);
    console.log('Clerk IDs:', user.clerkIds);
    console.log('Stripe Customer ID:', user.stripeCustomerId || 'None');
    console.log('\n📋 Subscription Details:');
    console.log('Status:', user.subscriptionStatus);
    console.log('Plan:', user.subscriptionPlan || 'None');
    console.log('Tier:', user.subscriptionTier || 'None');
    console.log('Platform:', user.subscriptionPlatform || 'None');
    console.log('End Date:', user.subscriptionEndDate || 'None');
    console.log('Trial Ends At:', user.trialEndsAt || 'None');
    console.log('\n🔐 Access:');
    console.log('Role:', user.role);
    console.log('Has Direct Access:', user.hasDirectAccess || false);
    console.log('\n📅 Dates:');
    console.log('Created:', user.createdAt);
    console.log('Updated:', user.updatedAt);
    console.log('==========================================\n');

    // Check if subscription should be active
    const now = new Date();
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const isValid = endDate > now;
      console.log(`⏰ Subscription End Date: ${endDate.toISOString()}`);
      console.log(`   Current Time: ${now.toISOString()}`);
      console.log(`   Is Valid: ${isValid ? '✅ YES' : '❌ NO (expired)'}`);
      
      if (isValid) {
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   Days Left: ${daysLeft}`);
      }
    }

    // Check subscription status
    const hasAccess = 
      user.role === 'admin' ||
      user.hasDirectAccess ||
      (user.subscriptionStatus === 'active' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) ||
      (user.subscriptionStatus === 'trialing' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now);

    console.log(`\n🎯 Should Have Access: ${hasAccess ? '✅ YES' : '❌ NO'}`);
    
    if (!hasAccess) {
      console.log('\n❗ Reasons for no access:');
      if (user.subscriptionStatus === 'inactive') {
        console.log('  - Subscription status is inactive');
      }
      if (!user.subscriptionEndDate) {
        console.log('  - No subscription end date set');
      }
      if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) <= now) {
        console.log('  - Subscription end date has passed');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx tsx scripts/check-user-subscription.ts <email>');
  process.exit(1);
}

checkUser(email);

