// scripts/add-performance-indexes.ts
// Script to add database indexes for performance optimization
// Run with: tsx -r dotenv/config scripts/add-performance-indexes.ts

import { connectDB, UserProgress, Puzzle, User } from '../lib/db';

async function createIndexSafely(
  collection: any,
  indexSpec: any,
  options: any,
  indexName: string
) {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`   ✓ Created index: ${indexName}`);
  } catch (error: any) {
    if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
      console.log(`   ℹ️  Index already exists: ${indexName}`);
    } else {
      throw error;
    }
  }
}

async function addPerformanceIndexes() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    console.log('\n📊 Adding performance indexes...\n');

    // UserProgress indexes
    console.log('1️⃣ Adding UserProgress indexes...');
    
    // Index for finding completed progress by user
    await createIndexSafely(
      UserProgress.collection,
      { userId: 1, status: 1 },
      { name: 'userId_status_idx', background: true },
      'userId_status_idx'
    );

    // Index for finding progress by puzzle
    await createIndexSafely(
      UserProgress.collection,
      { puzzleId: 1, userId: 1 },
      { name: 'puzzleId_userId_idx', background: true },
      'puzzleId_userId_idx'
    );

    // Puzzle indexes
    console.log('\n2️⃣ Adding Puzzle indexes...');
    
    // Index for finding puzzles by surah
    await createIndexSafely(
      Puzzle.collection,
      { surahId: 1 },
      { name: 'surahId_idx', background: true },
      'surahId_idx'
    );

    // Index for finding puzzles by juz
    await createIndexSafely(
      Puzzle.collection,
      { juzId: 1 },
      { name: 'juzId_idx', background: true },
      'juzId_idx'
    );

    // Compound index for finding puzzles by juz and surah
    await createIndexSafely(
      Puzzle.collection,
      { juzId: 1, surahId: 1 },
      { name: 'juzId_surahId_idx', background: true },
      'juzId_surahId_idx'
    );

    // User indexes
    console.log('\n3️⃣ Adding User indexes...');
    
    // Index for finding users by Clerk ID (if not already exists)
    await createIndexSafely(
      User.collection,
      { clerkIds: 1 },
      { name: 'clerkIds_idx', background: true },
      'clerkIds_idx'
    );

    console.log('\n✅ All indexes created successfully!');
    console.log('\n📈 Listing all indexes:\n');

    // List all indexes
    const userProgressIndexes = await UserProgress.collection.indexes();
    console.log('UserProgress indexes:', userProgressIndexes.map(idx => idx.name));

    const puzzleIndexes = await Puzzle.collection.indexes();
    console.log('Puzzle indexes:', puzzleIndexes.map(idx => idx.name));

    const userIndexes = await User.collection.indexes();
    console.log('User indexes:', userIndexes.map(idx => idx.name));

    console.log('\n🎉 Database optimization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  }
}

addPerformanceIndexes();

