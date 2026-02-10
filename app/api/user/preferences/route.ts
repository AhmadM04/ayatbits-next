import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user by clerkId
    const dbUser = await User.findOne({ clerkIds: clerkUser.id });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the preference updates from request body
    const body = await req.json();
    
    // Validate and update only allowed preferences
    const allowedFields = ['theme', 'themePreference', 'emailNotifications', 'inAppNotifications'];
    const updates: any = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        // Handle both 'theme' and 'themePreference' keys (normalize to themePreference)
        if (key === 'theme') {
          updates.themePreference = value;
        } else {
          updates[key] = value;
        }
      }
    }

    // Update user preferences
    Object.assign(dbUser, updates);
    await dbUser.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Preferences updated successfully',
      preferences: {
        themePreference: dbUser.themePreference,
        emailNotifications: dbUser.emailNotifications,
        inAppNotifications: dbUser.inAppNotifications,
      }
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user by clerkId
    const dbUser = await User.findOne({ clerkIds: clerkUser.id });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      themePreference: dbUser.themePreference || 'dark',
      emailNotifications: dbUser.emailNotifications ?? true,
      inAppNotifications: dbUser.inAppNotifications ?? true,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

