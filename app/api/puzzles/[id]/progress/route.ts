import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, UserProgress, User } from '@/lib/db';
import mongoose from 'mongoose';
import { checkAndSendHighestStreakEmail } from '@/lib/email-triggers';
import { getCurrentPlan } from '@/lib/subscription';

async function updateStreak(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = user.lastActivityDate 
    ? new Date(user.lastActivityDate)
    : null;
  
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If last activity was today, don't update streak
  if (lastActivity && lastActivity.getTime() === today.getTime()) {
    return;
  }

  const previousLongestStreak = user.longestStreak || 0;

  // If last activity was yesterday, increment streak
  if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
    const newStreak = (user.currentStreak || 0) + 1;
    const newLongestStreak = Math.max(previousLongestStreak, newStreak);
    
    await User.findByIdAndUpdate(userId, {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
    });

    // Send email if new record (async, don't wait)
    if (newStreak === newLongestStreak && newStreak > previousLongestStreak) {
      checkAndSendHighestStreakEmail(userId).catch(err => 
        console.error('Error sending highest streak email:', err)
      );
    }
  } else {
    // If last activity was more than 1 day ago or never, reset streak to 1
    await User.findByIdAndUpdate(userId, {
      currentStreak: 1,
      longestStreak: Math.max(previousLongestStreak, 1),
      lastActivityDate: today,
    });
  }
}

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
    const body = await request.json();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find or create user
    let dbUser = await User.findOne({ clerkIds: user.id });
    if (!dbUser) {
      dbUser = await User.create({
        clerkIds: [user.id],
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.fullName,
        imageUrl: user.imageUrl,
      });
    }

    // ============================================================================
    // FREE TIER LIMIT ENFORCEMENT
    // ============================================================================
    // Check if user is on free tier and enforce 10 puzzle/day limit
    const currentPlan = getCurrentPlan(dbUser);
    
    if (currentPlan === 'free' && body.status === 'COMPLETED') {
      // Check if this is a new puzzle completion (not a retry)
      const existingCompletion = await UserProgress.findOne({
        userId: dbUser._id,
        puzzleId: new mongoose.Types.ObjectId(id),
        status: 'COMPLETED',
      });

      // Only enforce limit for NEW completions
      if (!existingCompletion) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastPuzzleDate = dbUser.lastPuzzleDate ? new Date(dbUser.lastPuzzleDate) : null;
        if (lastPuzzleDate) {
          lastPuzzleDate.setHours(0, 0, 0, 0);
        }

        // Reset counter if it's a new day
        if (!lastPuzzleDate || lastPuzzleDate.getTime() !== today.getTime()) {
          dbUser.dailyPuzzleCount = 0;
          dbUser.lastPuzzleDate = today;
        }

        // Check if user has reached the daily limit
        if ((dbUser.dailyPuzzleCount || 0) >= 10) {
          console.log('[puzzle-progress] ❌ Free tier daily limit reached:', {
            userId: dbUser._id,
            email: dbUser.email,
            count: dbUser.dailyPuzzleCount,
          });

          return NextResponse.json(
            { 
              error: 'Daily puzzle limit reached',
              message: 'You have completed 10 puzzles today. Upgrade to continue or come back tomorrow!',
              limit: 10,
              used: dbUser.dailyPuzzleCount,
              plan: 'free',
            },
            { status: 429 } // 429 Too Many Requests
          );
        }

        // Increment daily counter
        dbUser.dailyPuzzleCount = (dbUser.dailyPuzzleCount || 0) + 1;
        await dbUser.save();
        
        console.log('[puzzle-progress] ✅ Free tier puzzle counted:', {
          userId: dbUser._id,
          count: dbUser.dailyPuzzleCount,
          limit: 10,
        });
      }
    }

    await UserProgress.findOneAndUpdate(
      {
        userId: dbUser._id,
        puzzleId: new mongoose.Types.ObjectId(id),
      },
      {
        status: body.status,
        score: body.score || 0,
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
      },
      {
        upsert: true,
        new: true,
      }
    );

    // Update streak and lastPuzzleId if puzzle was completed
    if (body.status === 'COMPLETED') {
      await updateStreak(dbUser._id);
      
      // Update total puzzles completed (check if this puzzle was already completed)
      const existingProgress = await UserProgress.findOne({
        userId: dbUser._id,
        puzzleId: new mongoose.Types.ObjectId(id),
        status: 'COMPLETED',
      });
      
      if (!existingProgress) {
        await User.findByIdAndUpdate(dbUser._id, {
          $inc: { totalPuzzlesCompleted: 1 },
        });
      }
    }

    // Always update lastPuzzleId to track where user left off
    await User.findByIdAndUpdate(dbUser._id, {
      lastPuzzleId: new mongoose.Types.ObjectId(id),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save progress' },
      { status: 500 }
    );
  }
}

