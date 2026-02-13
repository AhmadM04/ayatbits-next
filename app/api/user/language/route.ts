import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User } from '@/lib/db';
import { logger } from '@/lib/logger';

// Supported locales
const SUPPORTED_LOCALES = [
  'en', 'ar', 'ru', 'fr', 'es', 'de', 'tr', 'ur', 
  'id', 'ms', 'bn', 'hi', 'zh', 'ja', 'nl'
];

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language } = await request.json();

    // Validate language
    if (!language || !SUPPORTED_LOCALES.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update user's preferred language
    const dbUser = await User.findOneAndUpdate(
      { clerkIds: user.id },
      { preferredLanguage: language },
      { new: true }
    );

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    logger.info('User language updated', {
      userId: user.id,
      language,
    });

    return NextResponse.json({
      success: true,
      language: dbUser.preferredLanguage,
    });
  } catch (error: any) {
    logger.error('Language update error', error, { route: '/api/user/language' });
    return NextResponse.json(
      { error: error.message || 'Failed to update language' },
      { status: 500 }
    );
  }
}

