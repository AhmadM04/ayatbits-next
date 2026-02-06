import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connectDB, User, VoucherRedemption } from '@/lib/db';
import { checkProAccess } from '@/lib/subscription';

/**
 * Debug endpoint to check user's database state and voucher redemptions
 * Helps diagnose why user doesn't have access after redeeming voucher
 */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const emailLower = email?.toLowerCase();

    await connectDB();

    // Check if user exists in database
    const dbUser = await User.findOne({ 
      $or: [
        { clerkIds: user.id },
        emailLower ? { email: { $regex: new RegExp(`^${emailLower}$`, 'i') } } : {}
      ]
    });

    if (!dbUser) {
      return NextResponse.json({
        found: false,
        clerkId: user.id,
        email: emailLower,
        message: 'User not found in database',
      });
    }

    // Get voucher redemptions
    const redemptions = await VoucherRedemption.find({ 
      userId: dbUser._id 
    }).populate('voucherId').lean();

    // Check access
    const hasProAccess = checkProAccess(dbUser);

    return NextResponse.json({
      found: true,
      user: {
        _id: dbUser._id.toString(),
        email: dbUser.email,
        clerkIds: dbUser.clerkIds,
        subscriptionStatus: dbUser.subscriptionStatus,
        subscriptionPlan: dbUser.subscriptionPlan,
        subscriptionTier: dbUser.subscriptionTier,
        subscriptionEndDate: dbUser.subscriptionEndDate,
        hasDirectAccess: dbUser.hasDirectAccess,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      },
      access: {
        hasProAccess,
        shouldHaveAccess: hasProAccess || dbUser.hasDirectAccess || dbUser.role === 'admin',
      },
      redemptions: redemptions.map((r: any) => ({
        voucherCode: r.voucherId?.code,
        grantedTier: r.grantedTier,
        grantedDuration: r.grantedDuration,
        redeemedAt: r.redeemedAt,
      })),
      currentTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[debug-user-voucher-status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user status' },
      { status: 500 }
    );
  }
}

