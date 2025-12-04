import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';

// Admin bypass route - grants premium access for testing
export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Only allow specific admin emails (configure in env)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await User.findOneAndUpdate(
      { clerkId: user.id },
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
