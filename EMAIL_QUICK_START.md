# AWS SES Email System - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install Package (✅ Already Done)
```bash
npm install @aws-sdk/client-ses
```

### 2. Get AWS Credentials

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **SES (Simple Email Service)**
3. Verify your email domain `ayatbits.com`:
   - Go to **Verified identities** → **Create identity**
   - Choose **Domain**
   - Add DNS records to your domain registrar
4. Create IAM user:
   - Go to **IAM** → **Users** → **Create user**
   - Name: `ayatbits-ses`
   - Attach policy: `AmazonSESFullAccess`
   - Create access key → Save credentials

### 3. Add Environment Variables

Add to your `.env.local` (development) and Vercel (production):

```bash
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=noreply@ayatbits.com
CRON_SECRET=$(openssl rand -hex 32)
ADMIN_SECRET=$(openssl rand -hex 32)
```

### 4. Test Locally

```bash
npm run dev

# Test by joining waitlist at http://localhost:3000/waitlist
# You should receive a welcome email
```

### 5. Deploy to Vercel

```bash
vercel env add AWS_SES_REGION
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_SES_FROM_EMAIL
vercel env add CRON_SECRET
vercel env add ADMIN_SECRET

vercel --prod
```

✅ Done! Cron jobs will automatically start running.

---

## 📧 Email Types & When They Send

### Automatic Emails

| Email Type | Trigger | Timing |
|-----------|---------|--------|
| **Welcome to Waitlist** | User joins waitlist | Immediately |
| **Welcome Member** | User subscribes | Immediately |
| **Highest Streak** | User breaks streak record | Immediately |
| **Trial Ending** | Trial expires soon | 3 days, 1 day before |
| **Membership Ending** | Subscription expires soon | 7, 3, 1 days before |
| **Streak Warning** | User hasn't done puzzle today | Daily at 8 PM UTC |
| **Monthly Progress** | New month begins | 1st of month, 9 AM UTC |

### Manual Emails

| Email Type | How to Send |
|-----------|-------------|
| **Ramadan Voucher** | Call API endpoint (see below) |
| **Surah Completion** | Triggered on puzzle completion (coming soon) |
| **Juz Completion** | Triggered on puzzle completion (coming soon) |

---

## 🎯 Quick Actions

### Send Ramadan Vouchers to All Users

```bash
curl -X POST https://ayatbits.com/api/emails/send-ramadan-vouchers \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "voucherCode": "RAMADAN2026",
    "targetGroup": "all"
  }'
```

### Send to Inactive Users Only

```bash
curl -X POST https://ayatbits.com/api/emails/send-ramadan-vouchers \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "voucherCode": "RAMADAN2026",
    "targetGroup": "inactive"
  }'
```

Target groups: `all`, `inactive`, `trial`, `free`

### Manually Trigger Daily Checks

```bash
curl https://ayatbits.com/api/emails/trigger-checks?type=all \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Check types: `all`, `membership`, `trial`, `streak`, `monthly`

---

## 📊 Monitor Email Performance

### AWS SES Dashboard
1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Check **Sending statistics** for:
   - Delivery rate (should be >95%)
   - Bounce rate (should be <5%)
   - Complaint rate (should be <0.1%)

### Vercel Cron Logs
1. Go to Vercel dashboard
2. Navigate to your project → **Cron Jobs**
3. View execution logs

---

## 🛠️ Common Tasks

### Preview Email Templates

```bash
npx email dev
```

Open http://localhost:3000 to see all templates

### Test Single Email

```typescript
import { sendHighestStreakEverEmail } from '@/lib/aws-ses-service';

await sendHighestStreakEverEmail({
  email: 'test@example.com',
  firstName: 'Test',
  streakCount: 7,
});
```

### Add New Email Template

1. Create template in `emails/YourTemplate.tsx`
2. Add function to `lib/aws-ses-service.ts`
3. Add trigger logic to `lib/email-triggers.ts` (if automated)
4. Call function where needed in your app

---

## 🚨 Troubleshooting

### Emails Not Sending?

**Check 1: AWS SES Sandbox Mode**
- In sandbox, you can only send to verified emails
- Solution: Request production access in AWS SES dashboard

**Check 2: Environment Variables**
```bash
# In Vercel, verify all variables are set:
vercel env ls
```

**Check 3: Domain Verification**
- Go to AWS SES → Verified identities
- Ensure `ayatbits.com` shows "Verified"

**Check 4: CloudWatch Logs**
- Go to AWS CloudWatch
- Check `/aws/lambda/` logs for errors

### Cron Jobs Not Running?

**Check 1: Vercel Cron Setup**
- Ensure `vercel.json` includes cron configuration
- Redeploy if you just added cron jobs

**Check 2: Function Timeout**
- Vercel free tier: 10 second timeout
- Pro tier: 60 second timeout
- Monthly emails might need Pro tier

**Check 3: Authorization**
- Ensure `CRON_SECRET` is set in Vercel env variables
- Must match the secret used in cron job calls

---

## 📝 Email Template Customization

All email templates are in `emails/` directory. They use React Email components:

```tsx
// emails/YourTemplate.tsx
import { Html, Body, Container, Heading, Text, Link } from '@react-email/components';

export const YourTemplate = ({ firstName = 'there' }) => {
  return (
    <Html>
      <Body style={main}>
        <Container>
          <Heading>Hello {firstName}!</Heading>
          <Text>Your custom message here</Text>
          <Link href="https://ayatbits.com">Visit AyatBits</Link>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: 'system-ui, sans-serif',
};
```

---

## 🎨 Email Branding

Current branding:
- **Primary Color**: `#16a34a` (green)
- **Logo**: "AyatBits" text
- **Font**: System UI / Arial
- **Style**: Clean, modern, Islamic-themed

To customize:
1. Edit styles in email templates
2. Add your logo image to `public/`
3. Use `<Img>` component in templates

---

## 📚 Additional Resources

- **Full Setup Guide**: See `AWS_SES_EMAIL_SETUP.md`
- **Implementation Details**: See `EMAIL_SYSTEM_IMPLEMENTATION.md`
- **AWS SES Docs**: https://docs.aws.amazon.com/ses/
- **React Email Docs**: https://react.email/docs
- **AWS SES Pricing**: https://aws.amazon.com/ses/pricing/

---

## 💡 Pro Tips

1. **Test First**: Always test emails in sandbox mode before going to production
2. **Monitor Metrics**: Check AWS SES dashboard weekly for bounce/complaint rates
3. **Rate Limiting**: The system has built-in 100ms delays for bulk sends
4. **Personalization**: Use user's firstName, language, and stats in emails
5. **Timing**: Send engagement emails (streak warnings) in user's timezone if possible
6. **Unsubscribe**: Add unsubscribe options for marketing emails (required by law)

---

## 🆘 Need Help?

- **AWS SES Issues**: Check CloudWatch logs or contact AWS support
- **Code Issues**: Check `EMAIL_SYSTEM_IMPLEMENTATION.md`
- **Rate Limits**: Request increase through AWS support console
- **Domain Verification**: Contact your DNS provider for help with records

---

**Quick Reference**: Keep this file handy for day-to-day email operations!


