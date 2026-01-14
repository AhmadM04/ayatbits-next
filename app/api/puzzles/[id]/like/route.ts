import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, LikedAyat, User } from '@/lib/db';
import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid puzzle ID' }, { status: 400 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find or create user
    let dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      dbUser = await User.create({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
      });
    }

    // Use findOneAndUpdate with upsert to handle duplicates gracefully
    await LikedAyat.findOneAndUpdate(
      {
        userId: dbUser._id,
        puzzleId: new mongoose.Types.ObjectId(id),
      },
      {
        userId: dbUser._id,
        puzzleId: new mongoose.Types.ObjectId(id),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return NextResponse.json({ success: true, alreadyLiked: true });
    }
    logger.error('Like error', error, { route: '/api/puzzles/[id]/like' });
    return NextResponse.json(
      { error: error.message || 'Failed to like puzzle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid puzzle ID' }, { status: 400 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user
    const dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await LikedAyat.findOneAndDelete({
      userId: dbUser._id,
      puzzleId: new mongoose.Types.ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Unlike error', error, { route: '/api/puzzles/[id]/like' });
    return NextResponse.json(
      { error: error.message || 'Failed to unlike puzzle' },
      { status: 500 }
    );
  }
}
