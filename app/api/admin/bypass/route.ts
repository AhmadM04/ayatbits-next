import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { isAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, reason, action } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    if (action === 'remove') {
      // Remove bypass
      const updatedUser = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          hasBypass: false,
          bypassReason: null,
        },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Bypass removed for ${email}`,
        user: { email: updatedUser.email, hasBypass: updatedUser.hasBypass }
      });
    }

    // Add bypass
    // Try to find user by email first
    let dbUser = await User.findOne({ email: email.toLowerCase() });

    // If user doesn't exist, create them (they exist in Clerk but haven't visited the app yet)
    if (!dbUser) {
      dbUser = await User.create({
        email: email.toLowerCase(),
        // clerkId will be set when they first sign in
        subscriptionStatus: 'active',
        hasBypass: true,
        bypassReason: reason || 'Admin granted access',
      });
    } else {
      // Update existing user
      dbUser = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          hasBypass: true,
          bypassReason: reason || 'Admin granted access',
          subscriptionStatus: 'active', // Give them active status
        },
        { new: true }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bypass granted to ${email}`,
      user: { 
        email: dbUser.email, 
        hasBypass: dbUser.hasBypass,
        bypassReason: dbUser.bypassReason 
      }
    });
  } catch (error: any) {
    console.error('Bypass error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update bypass' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Get all users with bypass
    const bypassUsers = await User.find({ hasBypass: true })
      .select('email name hasBypass bypassReason createdAt')
      .lean();

    return NextResponse.json({ 
      success: true, 
      users: bypassUsers 
    });
  } catch (error: any) {
    console.error('Get bypass users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bypass users' },
      { status: 500 }
    );
  }
}


