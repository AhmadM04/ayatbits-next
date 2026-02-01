import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, Voucher, VoucherRedemption, SubscriptionStatusEnum } from '@/lib/db';
import { logger } from '@/lib/logger';

function addMonths(base: Date, months: number) {
  const copy = new Date(base);
  copy.setMonth(base.getMonth() + months);
  return copy;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voucher code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    await connectDB();

    // 2. Find user
    const dbUser = await User.findOne({ clerkIds: user.id });
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Find and validate voucher (with lock for concurrent safety)
    const voucher = await Voucher.findOne({ code: normalizedCode });

    if (!voucher) {
      return NextResponse.json({
        success: false,
        error: 'Invalid voucher code',
      });
    }

    if (!voucher.isActive) {
      return NextResponse.json({
        success: false,
        error: 'This voucher has been deactivated',
      });
    }

    if (new Date(voucher.expiresAt) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'This voucher has expired',
      });
    }

    if (voucher.redemptionCount >= voucher.maxRedemptions) {
      return NextResponse.json({
        success: false,
        error: 'This voucher has reached its redemption limit',
      });
    }

    // 4. Check if user already redeemed this voucher
    const existingRedemption = await VoucherRedemption.findOne({
      userId: dbUser._id,
      voucherId: voucher._id,
    });

    if (existingRedemption) {
      return NextResponse.json({
        success: false,
        error: 'You have already redeemed this voucher',
      });
    }

    // 5. Grant access based on voucher
    const now = new Date();
    const endDate = addMonths(now, voucher.duration);

    await User.findByIdAndUpdate(dbUser._id, {
      $set: {
        subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
        subscriptionPlan: voucher.duration >= 12 ? 'yearly' : 'monthly',
        subscriptionTier: voucher.tier,
        subscriptionEndDate: endDate,
        trialEndsAt: null, // Clear trial if any
      },
    });

    // 6. Increment voucher redemption count
    await Voucher.findByIdAndUpdate(voucher._id, {
      $inc: { redemptionCount: 1 },
    });

    // 7. Create redemption record
    await VoucherRedemption.create({
      userId: dbUser._id,
      voucherId: voucher._id,
      grantedTier: voucher.tier,
      grantedDuration: voucher.duration,
      redeemedAt: now,
    });

    logger.info('Voucher redeemed successfully', {
      userId: user.id,
      email: dbUser.email,
      voucherCode: voucher.code,
      tier: voucher.tier,
      duration: voucher.duration,
    });

    return NextResponse.json({
      success: true,
      message: 'Voucher redeemed successfully!',
      granted: {
        tier: voucher.tier,
        duration: voucher.duration,
        expiresAt: endDate,
      },
    });
  } catch (error: any) {
    logger.error('Voucher redemption error', error, {
      route: '/api/vouchers/redeem',
    });

    // Handle duplicate redemption race condition
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already redeemed this voucher' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to redeem voucher. Please try again.' },
      { status: 500 }
    );
  }
}

