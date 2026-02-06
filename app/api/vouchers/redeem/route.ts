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
    console.log('[voucher-redeem] ========== REDEMPTION STARTED ==========');
    
    // 1. Authenticate user
    const user = await currentUser();
    console.log('[voucher-redeem] User authenticated:', {
      userId: user?.id,
      email: user?.emailAddresses[0]?.emailAddress,
    });
    
    if (!user) {
      console.log('[voucher-redeem] ❌ No user - unauthorized');
      logger.warn('Voucher redemption attempted without authentication', {
        route: '/api/vouchers/redeem',
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Voucher redemption started', {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      route: '/api/vouchers/redeem',
    });

    const body = await req.json();
    const { code } = body;
    console.log('[voucher-redeem] Request body:', { code });

    if (!code || typeof code !== 'string') {
      console.log('[voucher-redeem] ❌ Invalid code:', code);
      logger.warn('Voucher redemption without code', {
        userId: user.id,
        route: '/api/vouchers/redeem',
      });
      return NextResponse.json(
        { success: false, error: 'Voucher code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();
    console.log('[voucher-redeem] Normalized code:', normalizedCode);
    
    logger.info('Processing voucher code', {
      userId: user.id,
      code: normalizedCode,
      route: '/api/vouchers/redeem',
    });

    await connectDB();
    console.log('[voucher-redeem] ✅ Database connected');

    // 2. Find or create user
    let dbUser = await User.findOne({ clerkIds: user.id });
    console.log('[voucher-redeem] DB user lookup:', {
      found: !!dbUser,
      userId: dbUser?._id?.toString(),
      email: dbUser?.email,
    });
    
    if (!dbUser) {
      // User not found by clerkId, try by email
      const email = user.emailAddresses[0]?.emailAddress;
      const emailLower = email?.toLowerCase();
      
      if (!emailLower) {
        return NextResponse.json(
          { success: false, error: 'Email address is required' },
          { status: 400 }
        );
      }
      
      // Check if user exists with this email
      dbUser = await User.findOne({ 
        email: { $regex: new RegExp(`^${emailLower}$`, 'i') } 
      });
      
      if (dbUser) {
        // Merge: Add clerkId to existing user
        if (!dbUser.clerkIds) {
          dbUser.clerkIds = [];
        }
        if (!dbUser.clerkIds.includes(user.id)) {
          dbUser.clerkIds.push(user.id);
          await dbUser.save();
          logger.info('Added clerkId to existing user during voucher redemption', {
            userId: user.id,
            email: emailLower,
          });
        }
      } else {
        // Create new user (webhook might have failed)
        dbUser = await User.create({
          clerkIds: [user.id],
          email: emailLower,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.fullName,
          imageUrl: user.imageUrl,
        });
        
        logger.info('User created during voucher redemption (webhook fallback)', {
          userId: user.id,
          email: emailLower,
        });
      }
    }

    // 3. Find and validate voucher (with lock for concurrent safety)
    const voucher = await Voucher.findOne({ code: normalizedCode });
    console.log('[voucher-redeem] Voucher lookup:', {
      found: !!voucher,
      code: voucher?.code,
      isActive: voucher?.isActive,
    });

    if (!voucher) {
      console.log('[voucher-redeem] ❌ Voucher not found:', normalizedCode);
      logger.warn('Invalid voucher code attempted', {
        userId: user.id,
        code: normalizedCode,
        route: '/api/vouchers/redeem',
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid voucher code',
      });
    }

    logger.info('Voucher found', {
      userId: user.id,
      voucherCode: voucher.code,
      voucherTier: voucher.tier,
      voucherDuration: voucher.duration,
      isActive: voucher.isActive,
      redemptionCount: voucher.redemptionCount,
      maxRedemptions: voucher.maxRedemptions,
      route: '/api/vouchers/redeem',
    });

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

    logger.info('Updating user subscription', {
      userId: user.id,
      dbUserId: dbUser._id.toString(),
      currentStatus: dbUser.subscriptionStatus,
      currentTier: dbUser.subscriptionTier,
      newStatus: SubscriptionStatusEnum.ACTIVE,
      newTier: voucher.tier,
      newEndDate: endDate.toISOString(),
      route: '/api/vouchers/redeem',
    });

    console.log('[voucher-redeem] 🔄 About to update user subscription:', {
      dbUserId: dbUser._id.toString(),
      updates: {
        subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
        subscriptionPlan: voucher.duration >= 12 ? 'yearly' : 'monthly',
        subscriptionTier: voucher.tier,
        subscriptionEndDate: endDate,
      },
    });

    const updatedUser = await User.findByIdAndUpdate(
      dbUser._id, 
      {
        $set: {
          subscriptionStatus: SubscriptionStatusEnum.ACTIVE,
          subscriptionPlan: voucher.duration >= 12 ? 'yearly' : 'monthly',
          subscriptionTier: voucher.tier,
          subscriptionEndDate: endDate,
          trialEndsAt: null, // Clear trial if any
        },
      },
      { 
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedUser) {
      console.log('[voucher-redeem] ❌ Failed to update user - updatedUser is null');
      logger.error('Failed to update user after voucher redemption', undefined, {
        userId: dbUser._id.toString(),
        voucherCode: voucher.code,
        route: '/api/vouchers/redeem',
      });
      return NextResponse.json(
        { success: false, error: 'Failed to update user subscription' },
        { status: 500 }
      );
    }

    console.log('[voucher-redeem] ✅ User updated successfully:', {
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionTier: updatedUser.subscriptionTier,
      subscriptionPlan: updatedUser.subscriptionPlan,
      subscriptionEndDate: updatedUser.subscriptionEndDate?.toISOString(),
    });

    // Log the update for debugging
    logger.info('User subscription updated successfully', {
      userId: user.id,
      dbUserId: updatedUser._id.toString(),
      email: updatedUser.email,
      newStatus: updatedUser.subscriptionStatus,
      newTier: updatedUser.subscriptionTier,
      newPlan: updatedUser.subscriptionPlan,
      newEndDate: updatedUser.subscriptionEndDate?.toISOString(),
      hasDirectAccess: updatedUser.hasDirectAccess,
      route: '/api/vouchers/redeem',
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

    console.log('[voucher-redeem] ========== ✅ SUCCESS ✅ ==========');
    console.log('[voucher-redeem] Voucher redeemed successfully!', {
      code: voucher.code,
      tier: voucher.tier,
      duration: voucher.duration,
      expiresAt: endDate.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Voucher redeemed successfully!',
      granted: {
        tier: voucher.tier,
        duration: voucher.duration,
        expiresAt: endDate,
      },
      // Tell client to refresh access check
      shouldRefreshAccess: true,
    }, {
      headers: {
        // Prevent caching of this response
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('[voucher-redeem] ========== ❌ ERROR ❌ ==========');
    console.error('[voucher-redeem] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
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


