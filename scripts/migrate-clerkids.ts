/**
 * Migration Script: Convert clerkId (string) to clerkIds (array)
 * 
 * This script migrates the User model from storing a single clerkId
 * to storing an array of clerkIds to support multiple Clerk environments
 * (dev and prod) using the same MongoDB database.
 * 
 * Usage:
 *   npm run db:migrate-clerkids
 * Note: Environment variables are loaded via tsx -r dotenv/config
 */

import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('❌ MONGODB_URL environment variable is not set');
  process.exit(1);
}

interface OldUserDoc {
  _id: mongoose.Types.ObjectId;
  clerkId?: string;
  clerkIds?: string[];
  email: string;
}

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL!);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const usersCollection = db.collection('users');

    // Find all users that have the old clerkId field (string)
    console.log('\n📊 Analyzing users...');
    const usersWithOldField = await usersCollection
      .find({ clerkId: { $exists: true, $type: 'string' } })
      .toArray() as unknown as OldUserDoc[];

    console.log(`Found ${usersWithOldField.length} users with old clerkId field (string)`);

    if (usersWithOldField.length === 0) {
      console.log('✅ No migration needed - all users already use clerkIds array');
      await mongoose.disconnect();
      return;
    }

    // Show sample of users to be migrated
    console.log('\n📋 Sample users to migrate:');
    usersWithOldField.slice(0, 5).forEach((user) => {
      console.log(`  - ${user.email}: clerkId="${user.clerkId}"`);
    });

    if (usersWithOldField.length > 5) {
      console.log(`  ... and ${usersWithOldField.length - 5} more`);
    }

    // Ask for confirmation
    console.log('\n⚠️  This will:');
    console.log('  1. Convert clerkId (string) to clerkIds (array)');
    console.log('  2. Preserve existing clerkId values');
    console.log('  3. Remove the old clerkId field');
    console.log('\n⏳ Starting migration in 3 seconds... (Press Ctrl+C to cancel)');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Perform migration
    console.log('\n🔄 Migrating users...');
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithOldField) {
      try {
        const updateData: any = {};

        // If user already has clerkIds array, add old clerkId to it if not present
        if (user.clerkIds && Array.isArray(user.clerkIds)) {
          if (user.clerkId && !user.clerkIds.includes(user.clerkId)) {
            updateData.$addToSet = { clerkIds: user.clerkId };
          }
        } else {
          // Create new clerkIds array from old clerkId
          updateData.$set = {
            clerkIds: user.clerkId ? [user.clerkId] : []
          };
        }

        // Remove old clerkId field
        updateData.$unset = { clerkId: '' };

        await usersCollection.updateOne(
          { _id: user._id },
          updateData
        );

        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  ✓ Migrated ${successCount}/${usersWithOldField.length} users...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Error migrating user ${user.email}:`, error);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log(`  Success: ${successCount} users`);
    if (errorCount > 0) {
      console.log(`  Errors: ${errorCount} users`);
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const remainingOldFormat = await usersCollection.countDocuments({
      clerkId: { $exists: true, $type: 'string' }
    });

    const newFormatCount = await usersCollection.countDocuments({
      clerkIds: { $exists: true, $type: 'array' }
    });

    console.log(`  Users with old format: ${remainingOldFormat}`);
    console.log(`  Users with new format: ${newFormatCount}`);

    if (remainingOldFormat === 0) {
      console.log('\n✅ All users successfully migrated to clerkIds array format!');
    } else {
      console.log('\n⚠️  Some users still have old format. Check errors above.');
    }

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
console.log('🚀 Starting clerkId → clerkIds migration\n');
migrate();

