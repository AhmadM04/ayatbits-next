import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { translation } = body;

    if (!translation) {
      return NextResponse.json({ error: 'Translation code is required' }, { status: 400 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await User.findByIdAndUpdate(dbUser._id, {
      selectedTranslation: translation,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Translation update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update translation' },
      { status: 500 }
    );
  }
}



