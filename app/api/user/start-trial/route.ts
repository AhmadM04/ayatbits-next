import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB, User, UserProgress, Puzzle } from '@/lib/db';
import { findUserRobust } from '@/lib/subscription';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route: Start Trial
 * 
 * This endpoint handles trial activation when a user clicks "Start 7-Day Trial"
 * on the pricing page. No Stripe session is created at this stage.
 * 
 * Logic:
 * - Check if user has already used their trial
 * - Set trialStartedAt, trialPlan, and hasUsedTrial
 * - Use .lean() for performance
 * - Parallel queries with Promise.all
 */
export async function POST(request: Request) {
  try {
    console.log('[start-trial] API called');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('[start-trial] ❌ No userId - not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body; // 'basic' or 'pro'

    if (!plan || !['basic', 'pro'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Must be "basic" or "pro"' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('[start-trial] ✅ Database connected');
    
    // Use robust lookup with email fallback
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
    
    const user = await findUserRobust(userId, userEmail);
    console.log('[start-trial] User found:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has already used their trial
    if (user.hasUsedTrial) {
      console.log('[start-trial] ❌ User has already used trial');
      return NextResponse.json(
        { success: false, error: 'Trial already used' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    if (
      user.stripeCustomerId &&
      user.subscriptionStatus === 'active' &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate).getTime() > Date.now()
    ) {
      console.log('[start-trial] ❌ User already has active subscription');
      return NextResponse.json(
        { success: false, error: 'Already subscribed' },
        { status: 400 }
      );
    }

    // PERFORMANCE OPTIMIZATION: Use Promise.all for parallel queries
    // Get user progress count in background (for analytics/logging)
    const now = new Date();
    
    const [updateResult] = await Promise.all([
      // Update user with trial info
      User.findByIdAndUpdate(
        user._id,
        {
          trialStartedAt: now,
          trialPlan: plan,
          hasUsedTrial: true,
          subscriptionStatus: 'trialing',
        },
        { new: true }
      ).select('trialStartedAt trialPlan hasUsedTrial subscriptionStatus email').lean(),
      
      // Background: Get puzzle count (non-blocking, for analytics)
      UserProgress.countDocuments({ 
        userId: user._id, 
        status: 'COMPLETED' 
      }).then(count => {
        console.log('[start-trial] User has completed', count, 'puzzles');
        return count;
      }).catch(() => 0),
    ]);

    console.log('[start-trial] ✅ Trial activated:', {
      email: user.email,
      plan,
      trialStartedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Trial started successfully',
      trial: {
        plan,
        startedAt: now.toISOString(),
        endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 7,
      },
    });
  } catch (error) {
    console.error('[start-trial] ❌ Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start trial',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

