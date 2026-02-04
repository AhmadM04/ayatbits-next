/**
 * Migration script to add subscription tiers to existing users
 * - Existing paid users get 'basic' tier
 * - Users with hasDirectAccess or admin role get 'pro' tier
 * - Inactive users remain unchanged (no tier assigned)
 * 
 * Run with: npx tsx -r dotenv/config scripts/migrate-to-two-tier.ts
 */

import { connectDB, User, UserRole, SubscriptionStatusEnum } from '../lib/db';
import { logger } from '../lib/logger';

async function migrateToTwoTier() {
  console.log('='.repeat(70));
  console.log('🔄 Starting Two-Tier Migration');
  console.log('='.repeat(70));
  console.log('');

  await connectDB();
  console.log('✅ Connected to MongoDB\n');

  // Stats tracking
  let totalUsers = 0;
  let migratedToPro = 0;
  let migratedToBasic = 0;
  let skippedInactive = 0;
  let skippedAlready = 0;
  let errors = 0;

  // Get all users
  const users = await User.find({});
  totalUsers = users.length;

  console.log(`📊 Found ${totalUsers} users to process\n`);

  for (const user of users) {
    try {
      const userIdentifier = user.email || user._id.toString();

      // Skip if already has tier
      if (user.subscriptionTier) {
        console.log(`  ⏭️  ${userIdentifier}: Already has tier '${user.subscriptionTier}' - skipping`);
        skippedAlready++;
        continue;
      }

      // Determine if user has active subscription
      const hasActiveSubscription = 
        user.subscriptionStatus === SubscriptionStatusEnum.ACTIVE &&
        (user.subscriptionPlan === 'lifetime' || 
         (user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date()) ||
         (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()));

      // Skip inactive users (no subscription)
      if (!hasActiveSubscription && !user.hasDirectAccess && user.role !== UserRole.ADMIN) {
        console.log(`  ⏭️  ${userIdentifier}: Inactive - no tier assigned`);
        skippedInactive++;
        continue;
      }

      // Determine tier
      let tier: 'basic' | 'pro';
      let reason: string;

      if (user.role === UserRole.ADMIN) {
        tier = 'pro';
        reason = 'Admin role';
        migratedToPro++;
      } else if (user.hasDirectAccess) {
        tier = 'pro';
        reason = 'Has direct access';
        migratedToPro++;
      } else if (hasActiveSubscription) {
        tier = 'basic';
        reason = 'Active paid subscription';
        migratedToBasic++;
      } else {
        console.log(`  ⚠️  ${userIdentifier}: Unexpected state - skipping`);
        skippedInactive++;
        continue;
      }

      // Update user
      await User.findByIdAndUpdate(user._id, {
        $set: { subscriptionTier: tier },
      });

      console.log(`  ✅ ${userIdentifier}: Migrated to '${tier}' (${reason})`);

      logger.info('User migrated to tier', {
        userId: user._id.toString(),
        email: user.email,
        tier,
        reason,
      });
    } catch (error: any) {
      console.error(`  ❌ Error migrating user ${user.email || user._id}:`, error.message);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Migration Summary');
  console.log('='.repeat(70));
  console.log(`Total users processed:     ${totalUsers}`);
  console.log(`Migrated to Pro:           ${migratedToPro}`);
  console.log(`Migrated to Basic:         ${migratedToBasic}`);
  console.log(`Skipped (already migrated): ${skippedAlready}`);
  console.log(`Skipped (inactive):        ${skippedInactive}`);
  console.log(`Errors:                    ${errors}`);
  console.log('='.repeat(70));

  // Verify migration
  console.log('\n🔍 Verification:');
  const proCount = await User.countDocuments({ subscriptionTier: 'pro' });
  const basicCount = await User.countDocuments({ subscriptionTier: 'basic' });
  const noTierCount = await User.countDocuments({ subscriptionTier: { $exists: false } });

  console.log(`Pro tier users:            ${proCount}`);
  console.log(`Basic tier users:          ${basicCount}`);
  console.log(`No tier assigned:          ${noTierCount}`);
  console.log('='.repeat(70));

  return {
    totalUsers,
    migratedToPro,
    migratedToBasic,
    skippedAlready,
    skippedInactive,
    errors,
  };
}

// Run migration
migrateToTwoTier()
  .then((results) => {
    if (results.errors > 0) {
      console.error(`\n⚠️  Migration completed with ${results.errors} errors`);
      process.exit(1);
    } else {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });


