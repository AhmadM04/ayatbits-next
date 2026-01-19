import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { getAdminUser } from '@/lib/dashboard-access';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Verify admin access
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Find duplicate emails (case-insensitive)
    const duplicates = await User.aggregate([
      {
        $group: {
          _id: { $toLower: '$email' },
          count: { $sum: 1 },
          users: {
            $push: {
              id: '$_id',
              email: '$email',
              clerkIds: '$clerkIds',
              subscriptionStatus: '$subscriptionStatus',
              subscriptionPlan: '$subscriptionPlan',
              hasDirectAccess: '$hasDirectAccess',
              createdAt: '$createdAt',
            }
          }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 50
      }
    ]);

    // Also find users with no clerkIds
    const usersWithoutClerkIds = await User.find({
      $or: [
        { clerkIds: { $exists: false } },
        { clerkIds: { $size: 0 } },
        { clerkIds: null }
      ]
    })
    .select('email clerkIds subscriptionStatus subscriptionPlan hasDirectAccess createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    return NextResponse.json({
      success: true,
      duplicateEmails: duplicates,
      usersWithoutClerkIds: usersWithoutClerkIds.map(u => ({
        ...u,
        _id: u._id.toString(),
      })),
    });
  } catch (error) {
    console.error('Admin duplicates check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

