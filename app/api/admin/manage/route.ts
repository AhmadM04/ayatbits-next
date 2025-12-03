import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { isAdmin } from '@/lib/admin';

/**
 * Grant or revoke admin access to a user
 * POST /api/admin/manage
 * Body: { email: string, action: 'grant' | 'revoke' }
 */
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
    const { email, action } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['grant', 'revoke'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "grant" or "revoke"' }, { status: 400 });
    }

    await connectDB();

    // Try to find user by email
    let dbUser = await User.findOne({ email: email.toLowerCase() });

    if (!dbUser) {
      return NextResponse.json({ 
        error: `User with email ${email} not found in database. They must sign in and visit the app at least once (e.g., go to /dashboard or /check-access) before you can grant admin access.` 
      }, { status: 404 });
    }

    // Update admin status
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        isAdmin: action === 'grant',
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Admin access ${action === 'grant' ? 'granted' : 'revoked'} for ${email}`,
      user: { 
        email: updatedUser.email, 
        isAdmin: updatedUser.isAdmin,
      }
    });
  } catch (error: any) {
    console.error('Admin management error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update admin access' },
      { status: 500 }
    );
  }
}

/**
 * Get all admins
 * GET /api/admin/manage
 */
export async function GET() {
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

    // Get all admins (both from database and legacy emails)
    const dbAdmins = await User.find({ isAdmin: true })
      .select('email name isAdmin createdAt')
      .lean();

    return NextResponse.json({ 
      success: true, 
      admins: dbAdmins 
    });
  } catch (error: any) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get admins' },
      { status: 500 }
    );
  }
}

