import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { render } from '@react-email/render';
import { logger } from './logger';

// Email templates
import WaitlistWelcomeEmail from '@/emails/WaitlistWelcome';
import MembershipEndingSoonEmail from '@/emails/MembershipEndingSoon';
import HighestStreakEverEmail from '@/emails/HighestStreakEver';
import StreakWarningEmail from '@/emails/StreakWarning';
import SurahCompletionEmail from '@/emails/SurahCompletion';
import JuzCompletionEmail from '@/emails/JuzCompletion';
import RamadanVoucherEmail from '@/emails/RamadanVoucher';
import TrialEndingSoonEmail from '@/emails/TrialEndingSoon';
import WelcomeNewMemberEmail from '@/emails/WelcomeNewMember';
import MonthlyProgressEmail from '@/emails/MonthlyProgress';

// Initialize AWS SES client
const sesClient = process.env.AWS_SES_REGION
  ? new SESClient({
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  : null;

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'noreply@ayatbits.com';
const NOTIFICATION_EMAIL = process.env.WAITLIST_NOTIFICATION_EMAIL || '';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generic function to send emails via AWS SES
 */
async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<EmailResult> {
  if (!sesClient) {
    logger.warn('[AWS SES] SES client not configured. Skipping email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    logger.info('[AWS SES] Email sent successfully', {
      messageId: response.MessageId,
      to,
      subject,
    });

    return { success: true, messageId: response.MessageId };
  } catch (error: any) {
    logger.error('[AWS SES] Error sending email', error instanceof Error ? error : new Error(String(error)), {
      to,
      subject,
    });
    return { success: false, error: error.message };
  }
}

// ===== EMAIL FUNCTIONS =====

/**
 * Send welcome email to waitlist subscriber
 */
export async function sendWaitlistWelcomeEmail({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(WaitlistWelcomeEmail({ firstName }));
    return sendEmail(email, 'Welcome to the AyatBits Waitlist! 🌙', emailHtml);
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering waitlist welcome email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify user that their membership is ending soon
 */
export async function sendMembershipEndingSoonEmail({
  email,
  firstName,
  daysRemaining,
  subscriptionEndDate,
}: {
  email: string;
  firstName: string;
  daysRemaining: number;
  subscriptionEndDate: Date;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      MembershipEndingSoonEmail({ firstName, daysRemaining, subscriptionEndDate })
    );
    return sendEmail(
      email,
      `Your AyatBits membership ends in ${daysRemaining} days`,
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering membership ending email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Celebrate user's highest streak ever
 */
export async function sendHighestStreakEverEmail({
  email,
  firstName,
  streakCount,
}: {
  email: string;
  firstName: string;
  streakCount: number;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      HighestStreakEverEmail({ firstName, streakCount })
    );
    return sendEmail(
      email,
      `🎉 New Record! ${streakCount}-Day Streak!`,
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering highest streak email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Warn user about losing their streak
 */
export async function sendStreakWarningEmail({
  email,
  firstName,
  streakCount,
}: {
  email: string;
  firstName: string;
  streakCount: number;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(StreakWarningEmail({ firstName, streakCount }));
    return sendEmail(
      email,
      `🔥 Don't lose your ${streakCount}-day streak!`,
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering streak warning email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Congratulate user on completing a Surah
 */
export async function sendSurahCompletionEmail({
  email,
  firstName,
  surahName,
  surahNumber,
  totalSurahsCompleted,
}: {
  email: string;
  firstName: string;
  surahName: string;
  surahNumber: number;
  totalSurahsCompleted: number;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      SurahCompletionEmail({ firstName, surahName, surahNumber, totalSurahsCompleted })
    );
    return sendEmail(
      email,
      `🎊 You completed Surah ${surahName}!`,
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering surah completion email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Congratulate user on completing a Juz
 */
export async function sendJuzCompletionEmail({
  email,
  firstName,
  juzNumber,
  totalJuzCompleted,
}: {
  email: string;
  firstName: string;
  juzNumber: number;
  totalJuzCompleted: number;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      JuzCompletionEmail({ firstName, juzNumber, totalJuzCompleted })
    );
    return sendEmail(
      email,
      `📖 Juz ${juzNumber} Complete! MashaAllah!`,
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering juz completion email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Ramadan voucher
 */
export async function sendRamadanVoucherEmail({
  email,
  firstName,
  voucherCode,
}: {
  email: string;
  firstName: string;
  voucherCode: string;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      RamadanVoucherEmail({ firstName, voucherCode })
    );
    return sendEmail(
      email,
      '🌙 Ramadan Mubarak! Free Month Inside',
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering Ramadan voucher email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify user that trial is ending soon
 */
export async function sendTrialEndingSoonEmail({
  email,
  firstName,
  daysRemaining,
  trialEndDate,
}: {
  email: string;
  firstName: string;
  daysRemaining: number;
  trialEndDate: Date;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      TrialEndingSoonEmail({ firstName, daysRemaining, trialEndDate })
    );
    return sendEmail(
      email,
      `Your AyatBits trial ends in ${daysRemaining} days`,
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering trial ending email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Welcome new member after subscription
 */
export async function sendWelcomeNewMemberEmail({
  email,
  firstName,
  subscriptionPlan,
}: {
  email: string;
  firstName: string;
  subscriptionPlan: string;
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      WelcomeNewMemberEmail({ firstName, subscriptionPlan })
    );
    return sendEmail(
      email,
      'Welcome to AyatBits Pro! 🎉',
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering welcome member email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send monthly progress summary
 */
export async function sendMonthlyProgressEmail({
  email,
  firstName,
  stats,
}: {
  email: string;
  firstName: string;
  stats: {
    puzzlesCompleted: number;
    longestStreak: number;
    surahsCompleted: number;
    juzCompleted: number;
    newAchievements: number;
  };
}): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      MonthlyProgressEmail({ firstName, stats })
    );
    return sendEmail(
      email,
      '📊 Your Monthly Progress on AyatBits',
      emailHtml
    );
  } catch (error: any) {
    logger.error('[AWS SES] Error rendering monthly progress email', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to admin about new waitlist signup
 */
export async function notifyAdminWaitlistSignup({
  email,
  firstName,
}: {
  email: string;
  firstName?: string;
}): Promise<EmailResult> {
  if (!sesClient || !NOTIFICATION_EMAIL) {
    logger.info('[AWS SES] Admin notification skipped - not configured');
    return { success: false, error: 'Admin notification not configured' };
  }

  const htmlContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #16a34a;">New Waitlist Signup</h2>
      ${firstName ? `<p><strong>Name:</strong> ${firstName}</p>` : ''}
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        View all signups in your <a href="${process.env.NEXT_PUBLIC_URL}/admin" style="color: #16a34a;">admin dashboard</a>.
      </p>
    </div>
  `;

  return sendEmail(
    NOTIFICATION_EMAIL,
    `New Waitlist Signup: ${firstName ? `${firstName} (${email})` : email}`,
    htmlContent
  );
}

export default {
  sendWaitlistWelcomeEmail,
  sendMembershipEndingSoonEmail,
  sendHighestStreakEverEmail,
  sendStreakWarningEmail,
  sendSurahCompletionEmail,
  sendJuzCompletionEmail,
  sendRamadanVoucherEmail,
  sendTrialEndingSoonEmail,
  sendWelcomeNewMemberEmail,
  sendMonthlyProgressEmail,
  notifyAdminWaitlistSignup,
};

