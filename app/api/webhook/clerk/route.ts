import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { connectDB, User, UserRole } from '@/lib/db';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    logger.error('Missing CLERK_WEBHOOK_SECRET environment variable', undefined, {
      route: '/api/webhook/clerk',
    });
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    // Get the headers
    const svix_id = request.headers.get('svix-id');
    const svix_timestamp = request.headers.get('svix-timestamp');
    const svix_signature = request.headers.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const body = await request.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);

    let evt: any;

    // Verify the webhook signature
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err: any) {
      securityLogger.logWebhookSignatureFailure({
        route: '/api/webhook/clerk',
        error: err.message,
      });
      logger.error('Clerk webhook signature verification failed', err, {
        route: '/api/webhook/clerk',
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the webhook event
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const primaryEmail = email_addresses.find((e: any) => e.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address;

      if (!email) {
        logger.warn('User created without email', {
          userId: id,
          route: '/api/webhook/clerk',
          event: 'user.created',
        });
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      const emailLower = email.toLowerCase();
      const role = isAdminEmail(emailLower) ? UserRole.ADMIN : UserRole.USER;

      await connectDB();

      // Check if user already exists (by clerkId or email)
      let existingUser = await User.findOne({
        $or: [
          { clerkIds: id },
          { email: { $regex: new RegExp(`^${emailLower}$`, 'i') } }
        ]
      });

      if (existingUser) {
        // User already exists - update clerkId if needed
        if (!existingUser.clerkIds) {
          existingUser.clerkIds = [];
        }
        if (!existingUser.clerkIds.includes(id)) {
          existingUser.clerkIds.push(id);
          await existingUser.save();
          
          logger.info('Added clerkId to existing user via webhook', {
            userId: id,
            email: emailLower,
            role: existingUser.role,
            route: '/api/webhook/clerk',
          });
        } else {
          logger.info('User already exists with clerkId', {
            userId: id,
            email: emailLower,
            route: '/api/webhook/clerk',
          });
        }
      } else {
        // Create new user
        const newUser = await User.create({
          clerkIds: [id],
          email: emailLower,
          firstName: first_name,
          lastName: last_name,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name,
          imageUrl: image_url,
          role,
        });

        logger.info('User created via Clerk webhook', {
          userId: id,
          email: emailLower,
          role,
          route: '/api/webhook/clerk',
        });

        securityLogger.logAdminAction('User created via webhook', {
          userId: id,
          email: emailLower,
          role,
        });
      }

      return NextResponse.json({ success: true });
    }

    // For other event types, just acknowledge receipt
    logger.info('Clerk webhook event received', {
      eventType,
      route: '/api/webhook/clerk',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Clerk webhook error', error, {
      route: '/api/webhook/clerk',
    });
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

