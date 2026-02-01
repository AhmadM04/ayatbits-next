import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, Voucher, UserRole } from '@/lib/db';
import { logger } from '@/lib/logger';

// GET - List all vouchers (admin only)
export async function GET() {
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

    const vouchers = await Voucher.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ vouchers });
  } catch (error: any) {
    logger.error('Error fetching vouchers', error);
    return NextResponse.json(
      { error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

// POST - Create new voucher (admin only)
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { code, type, tier, duration, maxRedemptions, expiresAt, description } = body;

    // Validate required fields
    if (!code || !type || !tier || !duration || !maxRedemptions || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tier
    if (tier !== 'basic' && tier !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "basic" or "pro"' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: 'Voucher code already exists' },
        { status: 400 }
      );
    }

    // Create voucher
    const voucher = await Voucher.create({
      code: code.toUpperCase().trim(),
      type,
      tier,
      duration,
      maxRedemptions,
      expiresAt: new Date(expiresAt),
      createdBy: dbUser._id,
      isActive: true,
      description: description?.trim() || undefined,
    });

    logger.info('Voucher created by admin', {
      adminId: user.id,
      voucherCode: voucher.code,
      tier,
      duration,
    });

    return NextResponse.json({
      success: true,
      voucher,
    });
  } catch (error: any) {
    logger.error('Error creating voucher', error);
    return NextResponse.json(
      { error: 'Failed to create voucher' },
      { status: 500 }
    );
  }
}

