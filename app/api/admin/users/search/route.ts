import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { getAdminUser } from '@/lib/dashboard-access';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    await connectDB();

    // Search for users with similar emails (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    const users = await User.find({
      email: { $regex: new RegExp(`${normalizedEmail}`, 'i') }
    })
    .select('email clerkIds subscriptionStatus subscriptionPlan hasDirectAccess subscriptionEndDate trialEndsAt createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Find exact match
    const exactMatch = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    })
    .select('email clerkIds subscriptionStatus subscriptionPlan hasDirectAccess subscriptionEndDate trialEndsAt createdAt')
    .lean();

    return NextResponse.json({
      success: true,
      query: normalizedEmail,
      exactMatch: exactMatch ? {
        ...exactMatch,
        _id: exactMatch._id.toString(),
      } : null,
      similarUsers: users.map(u => ({
        ...u,
        _id: u._id.toString(),
      })),
    });
  } catch (error) {
    console.error('Admin user search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

