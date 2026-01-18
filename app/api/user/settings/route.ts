import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic'; // Disable caching
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { translation: 'en.sahih', showTransliteration: false, enableWordByWordAudio: false },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkIds: userId }).lean() as any;

    return NextResponse.json(
      { 
        translation: user?.selectedTranslation || 'en.sahih',
        showTransliteration: user?.showTransliteration || false,
        enableWordByWordAudio: user?.enableWordByWordAudio || false
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { translation: 'en.sahih', showTransliteration: false, enableWordByWordAudio: false },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { showTransliteration, enableWordByWordAudio } = body;

    // Validate input - at least one field must be provided
    if (showTransliteration === undefined && enableWordByWordAudio === undefined) {
      return NextResponse.json(
        { error: 'No settings provided' },
        { status: 400 }
      );
    }

    // Validate types if provided
    if (showTransliteration !== undefined && typeof showTransliteration !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid showTransliteration value' },
        { status: 400 }
      );
    }

    if (enableWordByWordAudio !== undefined && typeof enableWordByWordAudio !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid enableWordByWordAudio value' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateFields: any = {};
    if (showTransliteration !== undefined) {
      updateFields.showTransliteration = showTransliteration;
    }
    if (enableWordByWordAudio !== undefined) {
      updateFields.enableWordByWordAudio = enableWordByWordAudio;
    }

    const user = await User.findOneAndUpdate(
      { clerkIds: userId },
      updateFields,
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        showTransliteration: user.showTransliteration,
        enableWordByWordAudio: user.enableWordByWordAudio
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
