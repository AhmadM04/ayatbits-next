import { connectDB, User, UserRole } from '@/lib/db';

/**
 * Migration script to backfill the role field from isAdmin
 * 
 * This script:
 * 1. Finds all users with isAdmin: true → sets role: 'admin'
 * 2. Finds all users with isAdmin: false or undefined → sets role: 'user'
 * 3. Verifies all users have a role field
 * 
 * Run with: npx tsx scripts/migrate-to-role-based-auth.ts
 */
async function migrateToRoleBasedAuth() {
  try {
    console.log('🔄 Starting migration to role-based authentication...\n');
    
    await connectDB();
    console.log('✓ Connected to MongoDB\n');

    // Get counts before migration
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    
    console.log('📊 Current State:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with isAdmin: true: ${adminUsers}`);
    console.log(`   Users without role field: ${usersWithoutRole}\n`);

    if (usersWithoutRole === 0) {
      console.log('✅ All users already have role field. No migration needed.');
      process.exit(0);
    }

    // Step 1: Set role='admin' for users with isAdmin=true
    console.log('🔄 Step 1: Setting role=admin for admin users...');
    const adminResult = await User.updateMany(
      { 
        isAdmin: true,
        $or: [
          { role: { $exists: false } },
          { role: null }
        ]
      },
      { 
        $set: { role: UserRole.ADMIN }
      }
    );
    console.log(`✓ Updated ${adminResult.modifiedCount} admin users\n`);

    // Step 2: Set role='user' for users with isAdmin=false or undefined
    console.log('🔄 Step 2: Setting role=user for regular users...');
    const userResult = await User.updateMany(
      { 
        $and: [
          {
            $or: [
              { isAdmin: false },
              { isAdmin: { $exists: false } },
              { isAdmin: null }
            ]
          },
          {
            $or: [
              { role: { $exists: false } },
              { role: null }
            ]
          }
        ]
      },
      { 
        $set: { role: UserRole.USER }
      }
    );
    console.log(`✓ Updated ${userResult.modifiedCount} regular users\n`);

    // Step 3: Verify all users now have a role
    console.log('🔍 Verifying migration...');
    const usersStillWithoutRole = await User.countDocuments({ role: { $exists: false } });
    const newAdminCount = await User.countDocuments({ role: UserRole.ADMIN });
    const newUserCount = await User.countDocuments({ role: UserRole.USER });

    console.log('\n📊 Post-Migration State:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with role=admin: ${newAdminCount}`);
    console.log(`   Users with role=user: ${newUserCount}`);
    console.log(`   Users without role: ${usersStillWithoutRole}\n`);

    if (usersStillWithoutRole > 0) {
      console.error('⚠️  Warning: Some users still don\'t have a role field!');
      console.log('   Fetching users without role...');
      
      const usersWithoutRoleData = await User.find(
        { role: { $exists: false } },
        { _id: 1, email: 1, isAdmin: 1, clerkIds: 1 }
      ).limit(10);
      
      console.log('\n   Sample users without role:');
      usersWithoutRoleData.forEach(u => {
        console.log(`   - ${u.email} (isAdmin: ${u.isAdmin}, clerkIds: ${u.clerkIds?.join(', ') || 'none'})`);
      });
      
      process.exit(1);
    }

    // Step 4: Verify role and isAdmin are in sync
    console.log('🔍 Checking role/isAdmin consistency...');
    const inconsistentUsers = await User.countDocuments({
      $or: [
        { role: UserRole.ADMIN, isAdmin: { $ne: true } },
        { role: UserRole.USER, isAdmin: true }
      ]
    });

    if (inconsistentUsers > 0) {
      console.warn(`⚠️  Found ${inconsistentUsers} users with inconsistent role/isAdmin values`);
      console.log('   This is expected if you\'ve been using the role field.');
      console.log('   The pre-save hook will sync them on next save.\n');
    } else {
      console.log('✓ All users have consistent role/isAdmin values\n');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test that admin access works correctly');
    console.log('   2. Test that regular user access works correctly');
    console.log('   3. Monitor logs for any issues');
    console.log('   4. After 1-2 weeks of stable operation, you can:');
    console.log('      - Remove the isAdmin field from the schema');
    console.log('      - Remove the pre-save hook for backwards compatibility');
    console.log('      - Run a cleanup migration to drop the isAdmin field\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateToRoleBasedAuth();

