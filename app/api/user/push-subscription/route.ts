import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User } from '@/lib/db';

// =============================================================================
// POST – Save a new push subscription for the authenticated user
// =============================================================================
export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid push subscription: endpoint, keys.p256dh, and keys.auth are required.' },
        { status: 400 },
      );
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: clerkUser.id });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialise the array if it doesn't exist yet
    if (!dbUser.pushSubscriptions) {
      dbUser.pushSubscriptions = [];
    }

    // Prevent duplicate subscriptions (same endpoint = same browser/device)
    const existingIndex = dbUser.pushSubscriptions.findIndex(
      (sub: any) => sub.endpoint === endpoint,
    );

    if (existingIndex >= 0) {
      // Update keys in case they rotated
      dbUser.pushSubscriptions[existingIndex] = {
        endpoint,
        keys,
        createdAt: new Date(),
      };
    } else {
      dbUser.pushSubscriptions.push({
        endpoint,
        keys,
        createdAt: new Date(),
      });
    }

    // Also enable the in-app notifications flag
    dbUser.inAppNotifications = true;

    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully.',
    });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save push subscription' },
      { status: 500 },
    );
  }
}

// =============================================================================
// DELETE – Remove a push subscription (user opted out or unsubscribed)
// =============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint in request body.' },
        { status: 400 },
      );
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: clerkUser.id });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.pushSubscriptions && dbUser.pushSubscriptions.length > 0) {
      dbUser.pushSubscriptions = dbUser.pushSubscriptions.filter(
        (sub: any) => sub.endpoint !== endpoint,
      );
    }

    // If no subscriptions remain, disable the in-app notifications flag
    if (!dbUser.pushSubscriptions || dbUser.pushSubscriptions.length === 0) {
      dbUser.inAppNotifications = false;
    }

    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed successfully.',
    });
  } catch (error: any) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove push subscription' },
      { status: 500 },
    );
  }
}

