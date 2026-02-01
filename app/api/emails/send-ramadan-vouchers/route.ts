/**
 * API endpoint to send Ramadan vouchers to all active users
 * Run this manually at the start of Ramadan
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { sendRamadanVoucherEmail } from '@/lib/aws-ses-service';
import { logger } from '@/lib/logger';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-admin-secret';

export async function POST(req: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
      logger.warn('[Ramadan Vouchers API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { voucherCode, targetGroup = 'all' } = body;

    if (!voucherCode) {
      return NextResponse.json(
        { error: 'Voucher code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Define target users based on group
    let query: any = {};
    
    switch (targetGroup) {
      case 'inactive':
        // Users who haven't logged in for 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = {
          subscriptionStatus: { $in: ['inactive', 'canceled'] },
          lastActivityDate: { $lt: thirtyDaysAgo },
        };
        break;
      
      case 'trial':
        // Users currently on trial
        query = { subscriptionStatus: 'trialing' };
        break;
      
      case 'free':
        // Users who never subscribed
        query = { subscriptionStatus: 'inactive' };
        break;
      
      case 'all':
      default:
        // All users with emails
        query = { email: { $exists: true, $ne: '' } };
        break;
    }

    const users = await User.find(query);
    
    logger.info(`[Ramadan Vouchers API] Sending vouchers to ${users.length} users`, {
      targetGroup,
      voucherCode,
    });

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      try {
        const result = await sendRamadanVoucherEmail({
          email: user.email,
          firstName: user.firstName || 'there',
          voucherCode,
        });

        if (result.success) {
          sentCount++;
        } else {
          errorCount++;
        }

        // Add delay to avoid rate limiting (AWS SES has sending limits)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`[Ramadan Vouchers API] Error sending to ${user.email}`, error instanceof Error ? error : new Error(String(error)));
        errorCount++;
      }
    }

    logger.info('[Ramadan Vouchers API] Voucher sending completed', {
      total: users.length,
      sent: sentCount,
      errors: errorCount,
    });

    return NextResponse.json({
      success: true,
      message: 'Ramadan vouchers sent',
      stats: {
        total: users.length,
        sent: sentCount,
        errors: errorCount,
      },
    });
  } catch (error: any) {
    logger.error('[Ramadan Vouchers API] Error sending vouchers', error);
    return NextResponse.json(
      { error: 'Failed to send vouchers', details: error.message },
      { status: 500 }
    );
  }
}

