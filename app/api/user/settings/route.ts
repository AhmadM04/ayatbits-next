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
        { translation: 'en.sahih' },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId }).lean() as any;

    return NextResponse.json(
      { translation: user?.selectedTranslation || 'en.sahih' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { translation: 'en.sahih' },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
