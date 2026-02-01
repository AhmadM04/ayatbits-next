import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Waitlist } from '@/lib/db';
import { sendWaitlistWelcomeEmail, notifyAdminWaitlistSignup } from '@/lib/aws-ses-service';
import { getClientIP } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// List of common disposable email domains
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com',
  'maildrop.cc',
  'temp-mail.org',
];

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email is from a disposable domain
 */
function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.some((disposable) => domain === disposable);
}


/**
 * POST /api/waitlist/join
 * Join the waitlist
 */
export async function POST(request: NextRequest) {
  console.log('[Waitlist API] POST request received');
  try {
    // Get request data
    const body = await request.json();
    const { firstName, email, source = 'web' } = body;
    console.log('[Waitlist API] Request body:', { firstName, email: email?.substring(0, 3) + '***', source });

    // Validation
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'First name is required (at least 2 characters)' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedFirstName = firstName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (isDisposableEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Disposable emails are not allowed' },
        { status: 400 }
      );
    }

    // Rate limiting is now handled by middleware
    // Connect to database
    await connectDB();

    // Check if email already exists
    const existingEntry = await Waitlist.findOne({ email: normalizedEmail });

    if (existingEntry) {
      console.log('[Waitlist API] Email already exists in waitlist, returning early');
      // Return success even if already exists (don't reveal if email is in system)
      return NextResponse.json({
        success: true,
        message: 'You\'re on the waitlist!',
        alreadyExists: true,
      });
    }
    
    console.log('[Waitlist API] Email is new, creating waitlist entry');

    // Collect metadata
    const clientIP = getClientIP(request);
    const metadata = {
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || '',
      referrer: request.headers.get('referer') || request.headers.get('referrer') || '',
    };

    // Create waitlist entry
    const waitlistEntry = await Waitlist.create({
      email: normalizedEmail,
      firstName: normalizedFirstName,
      source,
      interests: ['news', 'features', 'beta'], // Default interests
      metadata,
      status: 'pending',
    });

    logger.info('New waitlist signup', {
      firstName: normalizedFirstName,
      email: normalizedEmail,
      source,
      route: '/api/waitlist/join',
    });
    console.log('[Waitlist API] Waitlist entry created successfully, initiating email send');

    // Send welcome email (async, don't wait)
    sendWaitlistWelcomeEmail({ email: normalizedEmail, firstName: normalizedFirstName }).catch((err) => {
      logger.error('Error sending waitlist welcome email', err, { email: normalizedEmail });
      console.error('[Waitlist API] Email sending error caught:', err);
    });

    // Notify admin (async, don't wait)
    notifyAdminWaitlistSignup({ email: normalizedEmail, firstName: normalizedFirstName }).catch((err) => {
      logger.error('Error sending admin notification', err, { email: normalizedEmail });
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      id: waitlistEntry._id,
    });
  } catch (error) {
    logger.error('Waitlist API error', error as Error, { route: '/api/waitlist/join' });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waitlist/join
 * Return method not allowed
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

