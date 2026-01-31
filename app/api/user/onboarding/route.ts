import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB, User } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET: Check onboarding status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkIds: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted || false,
      onboardingSkipped: user.onboardingSkipped || false,
      referralSource: user.referralSource,
      ageRange: user.ageRange,
      onboardingCompletedAt: user.onboardingCompletedAt,
    });
  } catch (error) {
    logger.error('Failed to check onboarding status', error as Error);
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}

// POST: Save onboarding responses
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { referralSource, ageRange, preferredLanguage, translation, skipped } = body;

    await connectDB();
    const user = await User.findOne({ clerkIds: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user is skipping onboarding
    if (skipped) {
      user.onboardingSkipped = true;
      await user.save();
      
      logger.info('User skipped onboarding', {
        userId,
        email: user.email,
      });

      return NextResponse.json({
        success: true,
        message: 'Onboarding skipped',
      });
    }

    // Validate required fields
    if (!referralSource || !ageRange || !preferredLanguage || !translation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    user.onboardingCompleted = true;
    user.onboardingSkipped = false;
    user.referralSource = referralSource;
    user.ageRange = ageRange;
    user.preferredLanguage = preferredLanguage;
    user.selectedTranslation = translation;
    user.preferredTranslation = translation;
    user.onboardingCompletedAt = new Date();

    await user.save();

    logger.info('User completed onboarding', {
      userId,
      email: user.email,
      referralSource,
      ageRange,
      preferredLanguage,
      translation,
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        onboardingCompleted: true,
        referralSource: user.referralSource,
        ageRange: user.ageRange,
        preferredLanguage: user.preferredLanguage,
        selectedTranslation: user.selectedTranslation,
      },
    });
  } catch (error) {
    logger.error('Failed to save onboarding', error as Error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    );
  }
}

