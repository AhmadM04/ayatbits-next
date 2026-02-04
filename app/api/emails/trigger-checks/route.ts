/**
 * API endpoint to manually trigger email checks
 * This can be called by cron jobs or scheduled tasks
 * 
 * Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/emails/trigger-checks",
 *       "schedule": "0 20 * * *"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAndSendMembershipReminders,
  checkAndSendTrialReminders,
  checkAndSendStreakWarnings,
  sendMonthlyProgressReports,
} from '@/lib/email-triggers';
import { logger } from '@/lib/logger';

// Protect this endpoint with a secret key
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      logger.warn('[Email Triggers API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    logger.info('[Email Triggers API] Running email checks', { type });

    const results: any = {};

    // Run different checks based on type
    if (type === 'all' || type === 'membership') {
      await checkAndSendMembershipReminders();
      results.membership = 'completed';
    }

    if (type === 'all' || type === 'trial') {
      await checkAndSendTrialReminders();
      results.trial = 'completed';
    }

    if (type === 'all' || type === 'streak') {
      await checkAndSendStreakWarnings();
      results.streak = 'completed';
    }

    if (type === 'monthly') {
      await sendMonthlyProgressReports();
      results.monthly = 'completed';
    }

    logger.info('[Email Triggers API] Email checks completed', results);

    return NextResponse.json({
      success: true,
      message: 'Email checks completed',
      results,
    });
  } catch (error: any) {
    logger.error('[Email Triggers API] Error running email checks', error);
    return NextResponse.json(
      { error: 'Failed to run email checks', details: error.message },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}


