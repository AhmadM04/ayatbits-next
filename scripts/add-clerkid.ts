/**
 * Script to manually add a Clerk ID to a user account
 * Useful for dev/prod environment syncing
 * 
 * Usage:
 * npx tsx scripts/add-clerkid.ts your-email@example.com user_xxxxxxxxxxxxx
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { connectDB, User } from '../lib/db';

// Load environment variables from .env.local first, then .env as fallback
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function addClerkId(email: string, clerkId: string) {
  if (!email || !clerkId) {
    console.error('❌ Error: Email and Clerk ID are required');
    console.log('Usage: npx tsx scripts/add-clerkid.ts your-email@example.com user_xxxxxxxxxxxxx');
    process.exit(1);
  }

  // Basic validation for Clerk ID format
  if (!clerkId.startsWith('user_')) {
    console.error('❌ Error: Clerk ID must start with "user_"');
    console.log('Example: user_2abc123xyz456def');
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
      console.log('\n💡 Tip: The user must exist in the database first.');
      process.exit(1);
    }

    console.log(`\n📋 Current user status:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Clerk IDs: ${user.clerkIds?.join(', ') || 'None'}`);

    // Initialize clerkIds array if it doesn't exist
    if (!user.clerkIds) {
      user.clerkIds = [];
    }

    // Check if Clerk ID already exists
    if (user.clerkIds.includes(clerkId)) {
      console.log(`\n⚠️  Clerk ID "${clerkId}" is already associated with this account.`);
      console.log('No changes needed.');
    } else {
      // Add the new Clerk ID
      user.clerkIds.push(clerkId);
      await user.save();

      console.log(`\n✅ Success! Added Clerk ID "${clerkId}" to ${user.email}`);
      console.log(`\n📋 Updated Clerk IDs: ${user.clerkIds.join(', ')}`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Get email and clerkId from command line args
const email = process.argv[2];
const clerkId = process.argv[3];
addClerkId(email, clerkId);

