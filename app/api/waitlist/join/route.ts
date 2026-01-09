import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Waitlist } from '@/lib/db';
import { sendWaitlistWelcomeEmail, notifyAdminWaitlistSignup } from '@/lib/email-service';

// Rate limiting map (in-memory for simplicity, consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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
 * Rate limiting check (3 attempts per hour per IP)
 */
function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    // Reset or new entry
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 }); // 1 hour
    return { allowed: true, remainingAttempts: 2 };
  }

  if (limit.count >= 3) {
    return { allowed: false };
  }

  // Increment count
  limit.count += 1;
  return { allowed: true, remainingAttempts: 3 - limit.count };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  
  return 'unknown';
}

/**
 * POST /api/waitlist/join
 * Join the waitlist
 */
export async function POST(request: NextRequest) {
  try {
    // Get request data
    const body = await request.json();
    const { firstName, email, source = 'web' } = body;

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

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIP);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: 3600 // seconds
        },
        { status: 429 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if email already exists
    const existingEntry = await Waitlist.findOne({ email: normalizedEmail });

    if (existingEntry) {
      // Return success even if already exists (don't reveal if email is in system)
      return NextResponse.json({
        success: true,
        message: 'You\'re on the waitlist!',
        alreadyExists: true,
      });
    }

    // Collect metadata
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

    console.log(`[Waitlist] New signup: ${normalizedFirstName} (${normalizedEmail}) from ${source}`);

    // Send welcome email (async, don't wait)
    sendWaitlistWelcomeEmail({ email: normalizedEmail, firstName: normalizedFirstName }).catch((err) => {
      console.error('[Waitlist] Error sending welcome email:', err);
    });

    // Notify admin (async, don't wait)
    notifyAdminWaitlistSignup({ email: normalizedEmail, firstName: normalizedFirstName }).catch((err) => {
      console.error('[Waitlist] Error sending admin notification:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      id: waitlistEntry._id,
    });
  } catch (error) {
    console.error('[Waitlist API] Error:', error);
    
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

