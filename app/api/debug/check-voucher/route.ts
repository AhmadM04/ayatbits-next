import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, Voucher, VoucherRedemption, User } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check voucher status
 * Usage: GET /api/debug/check-voucher?code=VOUCHERCODE
 */
export async function GET(request: NextRequest) {
  try {
    const voucherCode = request.nextUrl.searchParams.get('code');
    
    if (!voucherCode) {
      return NextResponse.json({
        error: 'No voucher code provided',
        usage: 'GET /api/debug/check-voucher?code=VOUCHERCODE',
      });
    }

    await connectDB();

    const normalizedCode = voucherCode.toUpperCase().trim();
    const voucher = await Voucher.findOne({ code: normalizedCode });

    if (!voucher) {
      return NextResponse.json({
        error: 'Voucher not found',
        code: normalizedCode,
        exists: false,
      });
    }

    // Get redemptions for this voucher
    const redemptions = await VoucherRedemption.find({ 
      voucherId: voucher._id 
    }).populate('userId').lean();

    // Get current user and check if they've redeemed this
    const clerkUser = await currentUser();
    let currentUserRedeemed = false;
    let currentUserRedemptionDate = null;

    if (clerkUser) {
      const dbUser = await User.findOne({ clerkIds: clerkUser.id });
      if (dbUser) {
        const userRedemption = redemptions.find((r: any) => 
          r.userId?._id?.toString() === dbUser._id.toString()
        );
        if (userRedemption) {
          currentUserRedeemed = true;
          currentUserRedemptionDate = userRedemption.redeemedAt;
        }
      }
    }

    // Calculate if voucher is valid
    const now = new Date();
    const isExpired = new Date(voucher.expiresAt) < now;
    const hasReachedLimit = voucher.redemptionCount >= voucher.maxRedemptions;
    const isValid = voucher.isActive && !isExpired && !hasReachedLimit;

    // Detailed validation reasons
    const validationIssues = [];
    if (!voucher.isActive) validationIssues.push('Voucher is not active');
    if (isExpired) validationIssues.push(`Voucher expired on ${voucher.expiresAt.toISOString()}`);
    if (hasReachedLimit) validationIssues.push(`Reached max redemptions (${voucher.maxRedemptions})`);
    if (currentUserRedeemed) validationIssues.push('You have already redeemed this voucher');

    return NextResponse.json({
      success: true,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        tier: voucher.tier,
        duration: voucher.duration,
        isActive: voucher.isActive,
        expiresAt: voucher.expiresAt,
        isExpired,
        maxRedemptions: voucher.maxRedemptions,
        redemptionCount: voucher.redemptionCount,
        hasReachedLimit,
        description: voucher.description,
        createdAt: voucher.createdAt,
      },
      validation: {
        isValid,
        canRedeem: isValid && !currentUserRedeemed,
        issues: validationIssues,
        currentUserRedeemed,
        currentUserRedemptionDate,
      },
      redemptions: {
        total: redemptions.length,
        list: redemptions.map((r: any) => ({
          userEmail: r.userId?.email,
          tier: r.grantedTier,
          duration: r.grantedDuration,
          redeemedAt: r.redeemedAt,
        })),
      },
      diagnosis: {
        voucherExists: true,
        voucherIsActive: voucher.isActive,
        voucherNotExpired: !isExpired,
        voucherHasRemainingRedemptions: !hasReachedLimit,
        userHasNotRedeemed: !currentUserRedeemed,
        canBeRedeemed: isValid && !currentUserRedeemed,
        recommendation: 
          !voucher.isActive ? 'Voucher is deactivated. Contact admin to activate it.'
          : isExpired ? 'Voucher has expired. Create a new voucher or extend the expiration date.'
          : hasReachedLimit ? 'Voucher has reached its redemption limit. Increase maxRedemptions or create a new voucher.'
          : currentUserRedeemed ? 'User has already redeemed this voucher. Users can only redeem each voucher once.'
          : 'Voucher is valid and can be redeemed!',
      },
    });
  } catch (error: any) {
    console.error('[debug/check-voucher] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check voucher',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

