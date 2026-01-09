import { Resend } from 'resend';
import { render } from '@react-email/render';
import WaitlistWelcomeEmail from '@/emails/WaitlistWelcome';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const NOTIFICATION_EMAIL = process.env.WAITLIST_NOTIFICATION_EMAIL || '';

interface WaitlistWelcomeEmailParams {
  email: string;
  firstName: string;
}

/**
 * Send a welcome email to a new waitlist subscriber
 */
export async function sendWaitlistWelcomeEmail({ email, firstName }: WaitlistWelcomeEmailParams) {
  if (!resend) {
    console.warn('[Email Service] Resend API key not configured. Skipping email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailHtml = render(WaitlistWelcomeEmail({ firstName }));

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to the AyatBits Waitlist! 🌙',
      html: emailHtml,
    });

    if (error) {
      console.error('[Email Service] Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email Service] Welcome email sent successfully:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email Service] Unexpected error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send notification to admin about new waitlist signup
 */
export async function notifyAdminWaitlistSignup({ email, firstName }: { email: string; firstName?: string }) {
  if (!resend || !NOTIFICATION_EMAIL) {
    console.log('[Email Service] Admin notification skipped - not configured');
    return { success: false, error: 'Admin notification not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: `New Waitlist Signup: ${firstName ? `${firstName} (${email})` : email}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a;">New Waitlist Signup</h2>
          ${firstName ? `<p><strong>Name:</strong> ${firstName}</p>` : ''}
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            View all signups in your <a href="${process.env.NEXT_PUBLIC_URL}/admin" style="color: #16a34a;">admin dashboard</a>.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Email Service] Error sending admin notification:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email Service] Admin notification sent:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('[Email Service] Error in admin notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

export default {
  sendWaitlistWelcomeEmail,
  notifyAdminWaitlistSignup,
};

