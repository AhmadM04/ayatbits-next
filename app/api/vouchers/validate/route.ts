import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Voucher } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Voucher code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    await connectDB();

    // Find voucher
    const voucher = await Voucher.findOne({ code: normalizedCode }).lean();

    if (!voucher) {
      logger.info('Voucher validation failed - not found', { code: normalizedCode });
      return NextResponse.json({
        valid: false,
        error: 'Invalid voucher code',
      });
    }

    // Check if active
    if (!voucher.isActive) {
      logger.info('Voucher validation failed - inactive', { code: normalizedCode });
      return NextResponse.json({
        valid: false,
        error: 'This voucher has been deactivated',
      });
    }

    // Check expiration
    if (new Date(voucher.expiresAt) < new Date()) {
      logger.info('Voucher validation failed - expired', { 
        code: normalizedCode,
        expiredAt: voucher.expiresAt,
      });
      return NextResponse.json({
        valid: false,
        error: 'This voucher has expired',
      });
    }

    // Check redemption limit
    if (voucher.redemptionCount >= voucher.maxRedemptions) {
      logger.info('Voucher validation failed - max redemptions reached', {
        code: normalizedCode,
        redemptionCount: voucher.redemptionCount,
        maxRedemptions: voucher.maxRedemptions,
      });
      return NextResponse.json({
        valid: false,
        error: 'This voucher has reached its redemption limit',
      });
    }

    // Voucher is valid!
    logger.info('Voucher validation successful', {
      code: normalizedCode,
      tier: voucher.tier,
      duration: voucher.duration,
    });

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        tier: voucher.tier,
        duration: voucher.duration,
        description: voucher.description,
        expiresAt: voucher.expiresAt,
        remainingRedemptions: voucher.maxRedemptions - voucher.redemptionCount,
      },
    });
  } catch (error: any) {
    logger.error('Voucher validation error', error, {
      route: '/api/vouchers/validate',
    });
    return NextResponse.json(
      { valid: false, error: 'Failed to validate voucher' },
      { status: 500 }
    );
  }
}

