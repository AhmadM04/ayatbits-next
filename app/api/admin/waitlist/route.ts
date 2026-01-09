import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Waitlist, WaitlistStatus } from '@/lib/db';
import { getAdminUser } from '@/lib/dashboard-access';

/**
 * GET /api/admin/waitlist
 * Get all waitlist entries with stats (admin only)
 */
export async function GET() {
  try {
    // Check if user is admin
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all entries
    const entries = await Waitlist.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const stats = {
      total: entries.length,
      pending: entries.filter(e => e.status === WaitlistStatus.PENDING).length,
      contacted: entries.filter(e => e.status === WaitlistStatus.CONTACTED).length,
      converted: entries.filter(e => e.status === WaitlistStatus.CONVERTED).length,
    };

    return NextResponse.json({
      success: true,
      entries,
      stats,
    });
  } catch (error) {
    console.error('[Admin Waitlist API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist data' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/waitlist
 * Update waitlist entry status (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check if user is admin
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!Object.values(WaitlistStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update entry
    const updatedEntry = await Waitlist.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    console.log(`[Admin Waitlist] Updated ${updatedEntry.email} status to ${status}`);

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    });
  } catch (error) {
    console.error('[Admin Waitlist API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

