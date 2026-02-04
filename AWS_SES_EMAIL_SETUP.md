# AWS SES Email Setup Guide

This document explains how to set up and use the AWS SES email system for AyatBits.

## Table of Contents

1. [Overview](#overview)
2. [AWS SES Configuration](#aws-ses-configuration)
3. [Email Templates](#email-templates)
4. [Automated Email Triggers](#automated-email-triggers)
5. [Manual Email Sending](#manual-email-sending)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)

## Overview

AyatBits uses AWS SES (Simple Email Service) to send transactional and marketing emails to users. The system includes:

- **10 pre-built email templates** for different use cases
- **Automated triggers** for streak tracking, subscriptions, and achievements
- **Cron jobs** for scheduled emails (membership reminders, monthly progress)
- **API endpoints** for manual email campaigns (e.g., Ramadan vouchers)

## AWS SES Configuration

### Step 1: Create an AWS Account

1. Go to [AWS Console](https://aws.amazon.com/)
2. Create an account or sign in
3. Navigate to **SES (Simple Email Service)**

### Step 2: Verify Your Domain

1. In SES, go to **Configuration > Verified identities**
2. Click **Create identity**
3. Choose **Domain** and enter `ayatbits.com`
4. Complete the DNS verification by adding the provided CNAME records to your domain
5. Wait for verification (usually 5-10 minutes)

### Step 3: Verify Email Addresses (Sandbox Mode)

If you're in SES Sandbox mode, you need to verify recipient emails:

1. Go to **Configuration > Verified identities**
2. Click **Create identity**
3. Choose **Email address** and enter the email
4. The recipient will receive a verification email

### Step 4: Request Production Access

To send emails to any address:

1. Go to **Account dashboard**
2. Click **Request production access**
3. Fill out the form explaining your use case
4. Wait for approval (usually 24-48 hours)

### Step 5: Create IAM User for API Access

1. Go to **IAM > Users > Add user**
2. Create a user named `ayatbits-ses`
3. Attach the policy `AmazonSESFullAccess`
4. Create access keys
5. Save the **Access Key ID** and **Secret Access Key**

## Email Templates

The system includes 10 email templates:

### 1. Waitlist Welcome (`WaitlistWelcome.tsx`)
- **When**: User joins the waitlist
- **Purpose**: Welcome and set expectations

### 2. Membership Ending Soon (`MembershipEndingSoon.tsx`)
- **When**: 7, 3, and 1 day before subscription ends
- **Purpose**: Encourage renewal

### 3. Highest Streak Ever (`HighestStreakEver.tsx`)
- **When**: User achieves a new personal streak record
- **Purpose**: Celebrate achievement

### 4. Streak Warning (`StreakWarning.tsx`)
- **When**: User hasn't completed a puzzle today (runs at 8 PM)
- **Purpose**: Prevent streak loss

### 5. Surah Completion (`SurahCompletion.tsx`)
- **When**: User completes all puzzles in a Surah
- **Purpose**: Celebrate milestone

### 6. Juz Completion (`JuzCompletion.tsx`)
- **When**: User completes all puzzles in a Juz
- **Purpose**: Celebrate milestone

### 7. Ramadan Voucher (`RamadanVoucher.tsx`)
- **When**: Manually sent during Ramadan
- **Purpose**: Offer 1-month free access

### 8. Trial Ending Soon (`TrialEndingSoon.tsx`)
- **When**: 3 and 1 day before trial ends
- **Purpose**: Convert trial to paid

### 9. Welcome New Member (`WelcomeNewMember.tsx`)
- **When**: User subscribes
- **Purpose**: Onboard new members

### 10. Monthly Progress (`MonthlyProgress.tsx`)
- **When**: 1st of each month
- **Purpose**: Show stats and encourage continued learning

## Automated Email Triggers

### Cron Jobs (Vercel)

Two cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/emails/trigger-checks?type=all",
      "schedule": "0 20 * * *"
    },
    {
      "path": "/api/emails/trigger-checks?type=monthly",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

#### Daily Checks (8 PM UTC)
- Membership expiring reminders
- Trial ending reminders
- Streak warnings for users at risk

#### Monthly Report (1st of month, 9 AM UTC)
- Send progress reports to all active users

### Real-time Triggers

Certain emails are triggered immediately:

- **Welcome email**: When user subscribes (Stripe webhook)
- **Highest streak**: When user breaks personal record (puzzle completion)
- **Waitlist welcome**: When user joins waitlist

## Manual Email Sending

### Send Ramadan Vouchers

```bash
curl -X POST https://ayatbits.com/api/emails/send-ramadan-vouchers \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "voucherCode": "RAMADAN2026",
    "targetGroup": "inactive"
  }'
```

**Target Groups:**
- `all`: All users
- `inactive`: Users inactive for 30+ days
- `trial`: Users on trial
- `free`: Users who never subscribed

### Manual Trigger Email Checks

```bash
# Run all checks
curl -X GET https://ayatbits.com/api/emails/trigger-checks?type=all \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Run specific check
curl -X GET https://ayatbits.com/api/emails/trigger-checks?type=streak \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Environment Variables

Add these to your `.env` file:

```bash
# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=noreply@ayatbits.com

# Email Notifications
WAITLIST_NOTIFICATION_EMAIL=admin@ayatbits.com

# Cron Job Security
CRON_SECRET=generate-a-secure-random-string
ADMIN_SECRET=generate-a-secure-random-string
```

### Generate Secure Secrets

```bash
# On macOS/Linux
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing

### Test Email Sending

1. **Test Waitlist Email** (easiest to test):
   - Go to your website
   - Join the waitlist
   - Check your email

2. **Test Welcome Email**:
   - Complete a test subscription
   - Check your email

3. **Test Cron Jobs Locally**:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# Manually trigger cron
curl http://localhost:3000/api/emails/trigger-checks?type=streak \
  -H "Authorization: Bearer your-cron-secret"
```

### Check Email Logs

1. Go to **AWS SES > Configuration > Sending statistics**
2. View delivery, bounce, and complaint rates
3. Check **CloudWatch** for detailed logs

### Test Email Templates

You can preview email templates using React Email:

```bash
# Install React Email CLI (if not already)
npm install -g @react-email/cli

# Preview templates
npx email dev
```

Open `http://localhost:3000` to see all email templates.

## Monitoring

### Key Metrics to Watch

1. **Delivery Rate**: Should be >95%
2. **Bounce Rate**: Should be <5%
3. **Complaint Rate**: Should be <0.1%
4. **Open Rate**: Track in SES configuration sets (optional)

### Setting Up Alerts

1. Go to **CloudWatch > Alarms**
2. Create alarms for:
   - High bounce rate
   - High complaint rate
   - SES sending limits

## Rate Limits

### Sandbox Mode
- 200 emails per 24 hours
- 1 email per second

### Production Mode
- Default: 50,000 emails per 24 hours
- 14 emails per second
- Can request increase

## Best Practices

1. **Always use verified domains** in production
2. **Monitor bounce and complaint rates** to maintain sender reputation
3. **Add unsubscribe links** to marketing emails
4. **Use descriptive subject lines** and clear sender names
5. **Test emails** before sending to large groups
6. **Respect user preferences** for email frequency

## Troubleshooting

### Email Not Sending

1. **Check SES Status**: Ensure you're not in sandbox mode
2. **Verify Email**: Check if recipient email is verified (sandbox only)
3. **Check Logs**: Look at CloudWatch logs for errors
4. **Environment Variables**: Ensure all AWS credentials are correct
5. **IAM Permissions**: Verify the IAM user has SES permissions

### Emails Going to Spam

1. **SPF Record**: Add to DNS: `v=spf1 include:amazonses.com ~all`
2. **DKIM**: Enable DKIM in SES and add DNS records
3. **DMARC**: Add DMARC policy to DNS
4. **From Address**: Use a verified domain email
5. **Content**: Avoid spam trigger words, include unsubscribe link

### Rate Limiting Errors

1. **Add Delays**: Use `setTimeout` between emails (100ms)
2. **Batch Processing**: Send in smaller batches
3. **Request Limit Increase**: Through AWS support

## Support

For issues or questions:
- Check AWS SES documentation: https://docs.aws.amazon.com/ses/
- Review CloudWatch logs
- Contact AWS Support if sending limits are reached

---

**Last Updated**: February 2026
**Maintained by**: AyatBits Development Team


