/**
 * Diagnostic script to check user access status
 * 
 * Usage:
 *   npx tsx scripts/check-user-access.ts user@example.com
 * 
 * This helps diagnose why users might not see pro features.
 */

import { connectDB, User } from '../lib/db';
import { checkSubscription, checkProAccess } from '../lib/subscription';

async function checkUserAccess(email: string) {
  console.log('\n=== User Access Diagnostic ===\n');
  console.log(`Checking access for: ${email}\n`);

  try {
    await connectDB();

    // Search by email (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (!user) {
      console.log('❌ User not found in database');
      console.log('\nPossible reasons:');
      console.log('  1. User has not signed up yet');
      console.log('  2. Email address is incorrect');
      console.log('\nNext steps:');
      console.log('  - Verify the email address is correct');
      console.log('  - Ask the user to sign up at your app');
      process.exit(1);
    }

    console.log('✅ User found in database\n');
    console.log('User Details:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Clerk IDs: ${user.clerkIds?.length ? user.clerkIds.join(', ') : 'None (⚠️  User needs to sign in)'}`);
    console.log(`  Name: ${user.name || 'Not set'}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log(`  Role: ${user.role || 'user'}`);

    console.log('\nSubscription Status:');
    console.log(`  Plan: ${user.subscriptionPlan || 'None'}`);
    console.log(`  Tier: ${user.subscriptionTier || 'None'}`);
    console.log(`  Status: ${user.subscriptionStatus || 'inactive'}`);
    console.log(`  End Date: ${user.subscriptionEndDate || 'N/A'}`);
    console.log(`  Trial Ends: ${user.trialEndsAt || 'N/A'}`);
    console.log(`  Direct Access: ${user.hasDirectAccess ? '✅ Yes (Admin granted)' : '❌ No'}`);

    console.log('\nAccess Checks:');
    const hasBasicAccess = checkSubscription(user);
    const hasProAccess = checkProAccess(user);
    
    console.log(`  Basic Access: ${hasBasicAccess ? '✅ Yes' : '❌ No'}`);
    console.log(`  Pro Access: ${hasProAccess ? '✅ Yes' : '❌ No'}`);

    if (!user.clerkIds || user.clerkIds.length === 0) {
      console.log('\n⚠️  WARNING: User has no Clerk IDs');
      console.log('This means:');
      console.log('  - User was created by admin grant but hasn\'t signed in yet');
      console.log('  - When they sign in, their Clerk ID will be automatically synced');
      console.log('\nNext steps:');
      console.log('  1. Ask the user to sign in at your app');
      console.log('  2. After sign in, their access will work automatically');
      console.log('  3. Make sure they use the same email address: ' + user.email);
    } else if (hasBasicAccess && !hasProAccess) {
      console.log('\n⚠️  User has basic access but NOT pro access');
      console.log('Reasons:');
      console.log(`  - subscriptionTier is: ${user.subscriptionTier || 'not set'} (needs to be "pro")`);
      console.log(`  - hasDirectAccess is: ${user.hasDirectAccess || false} (needs to be true for admin-granted pro)`);
      console.log('\nTo grant Pro access:');
      console.log('  1. Go to /admin on your app');
      console.log('  2. Grant access again with any duration (lifetime/1 month/etc.)');
      console.log('  3. This will set subscriptionTier to "pro"');
    } else if (!hasBasicAccess) {
      console.log('\n❌ User has NO access');
      console.log('To grant access:');
      console.log('  1. Go to /admin on your app');
      console.log('  2. Enter user email: ' + user.email);
      console.log('  3. Select duration and grant access');
    } else {
      console.log('\n✅ User has full Pro access - everything looks good!');
    }

    console.log('\n=== End Diagnostic ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/check-user-access.ts user@example.com');
  process.exit(1);
}

checkUserAccess(email);

