/**
 * Script to create a user with a Clerk ID
 * Useful when webhook didn't fire or for manual user creation
 * 
 * Usage:
 * npx tsx -r dotenv/config scripts/create-user-with-clerkid.ts your-email@example.com user_xxxxxxxxxxxxx
 */

import mongoose from 'mongoose';
import { connectDB, User, UserRole } from '../lib/db';

async function createUserWithClerkId(email: string, clerkId: string) {
  if (!email || !clerkId) {
    console.error('❌ Error: Email and Clerk ID are required');
    console.log('Usage: npx tsx -r dotenv/config scripts/create-user-with-clerkid.ts your-email@example.com user_xxxxxxxxxxxxx');
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

    const emailLower = email.toLowerCase();

    console.log(`🔍 Checking if user already exists...`);
    const existingUser = await User.findOne({ 
      $or: [
        { clerkIds: clerkId },
        { email: { $regex: new RegExp(`^${emailLower}$`, 'i') } }
      ]
    });

    if (existingUser) {
      console.log(`\n⚠️  User already exists!`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Clerk IDs: ${existingUser.clerkIds?.join(', ') || 'None'}`);
      
      // Check if we need to add the Clerk ID
      if (!existingUser.clerkIds?.includes(clerkId)) {
        if (!existingUser.clerkIds) {
          existingUser.clerkIds = [];
        }
        existingUser.clerkIds.push(clerkId);
        await existingUser.save();
        console.log(`\n✅ Added Clerk ID "${clerkId}" to existing user`);
      } else {
        console.log(`\n✅ User already has this Clerk ID. No changes needed.`);
      }
      return;
    }

    // Create new user
    console.log(`\n📝 Creating new user...`);
    const newUser = await User.create({
      clerkIds: [clerkId],
      email: emailLower,
      role: UserRole.USER,
    });

    console.log(`\n✅ Success! User created:`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Clerk ID: ${clerkId}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   Database ID: ${newUser._id}`);

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
createUserWithClerkId(email, clerkId);

