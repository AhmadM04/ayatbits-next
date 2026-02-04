import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, Voucher, UserRole } from '@/lib/db';
import { logger } from '@/lib/logger';

// PATCH - Update voucher (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({ clerkIds: user.id });
    if (!dbUser || dbUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { error: 'isActive field is required' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher not found' },
        { status: 404 }
      );
    }

    logger.info('Voucher updated by admin', {
      adminId: user.id,
      voucherId: id,
      isActive,
    });

    return NextResponse.json({
      success: true,
      voucher,
    });
  } catch (error: any) {
    logger.error('Error updating voucher', error);
    return NextResponse.json(
      { error: 'Failed to update voucher' },
      { status: 500 }
    );
  }
}


