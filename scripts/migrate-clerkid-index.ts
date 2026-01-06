import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

/**
 * Migration script to update the clerkId index to be sparse
 * This allows multiple users with null clerkId (admin-created users who haven't signed up yet)
 * 
 * Run with: npx tsx scripts/migrate-clerkid-index.ts
 */
async function migrateClerkIdIndex() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collection = db.collection('users');
    
    console.log('Dropping old clerkId_1 index...');
    try {
      await collection.dropIndex('clerkId_1');
      console.log('✓ Old index dropped');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('Index already dropped or does not exist');
      } else {
        throw error;
      }
    }
    
    console.log('Creating new sparse unique index on clerkId...');
    await collection.createIndex(
      { clerkId: 1 }, 
      { unique: true, sparse: true, name: 'clerkId_1' }
    );
    console.log('✓ New sparse index created');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('You can now add multiple users via admin panel without clerkId conflicts.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateClerkIdIndex();

