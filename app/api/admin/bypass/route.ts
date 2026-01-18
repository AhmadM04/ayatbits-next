import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { getAdminUser } from '@/lib/dashboard-access';

// Admin bypass route - grants premium access for testing
export async function POST() {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    await User.findOneAndUpdate(
      { clerkIds: adminUser.clerkIds?.[0] },
      { 
        subscriptionStatus: 'active',
        subscriptionPlan: 'lifetime',
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Admin bypass activated' });
  } catch (error) {
    console.error('Admin bypass error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
