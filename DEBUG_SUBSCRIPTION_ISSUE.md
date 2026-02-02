# Debug Subscription Access Issue

## Current Issue
Payment completes successfully, redirects to landing page, but user has no access.

## Most Likely Causes (in order of probability)

### 1. ⚠️ **Stripe Webhook NOT Configured in Production** (90% likely)
The webhook needs to be set up in your Stripe dashboard to call your deployed API.

**How to check:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Look for a webhook pointing to: `https://your-domain.com/api/webhook/stripe`
3. Check if it's listening for: `checkout.session.completed`

**How to fix:**
1. In Stripe Dashboard → Webhooks → Add endpoint
2. Endpoint URL: `https://your-production-domain.com/api/webhook/stripe`
3. Listen to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to your environment variables: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. **IMPORTANT:** You need DIFFERENT webhook secrets for:
   - Local development (using Stripe CLI)
   - Production (from Stripe Dashboard)

**Signs this is the problem:**
- Payment succeeds in Stripe dashboard
- No errors in your app
- User immediately redirected to landing page
- No user record created in database with subscription

### 2. Webhook Secret Mismatch (If webhook exists)
The `STRIPE_WEBHOOK_SECRET` environment variable might be wrong or missing in production.

**How to check:**
- Look at your Vercel/deployment platform environment variables
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Make sure it matches the secret from your production webhook (NOT the CLI secret)

### 3. Webhook Timing Issue
The redirect happens faster than the webhook fires.

**How to check:**
- Look in Stripe dashboard → Webhooks → View logs
- See if webhook fires after user is already redirected

### 4. Database Connection Issue
MongoDB not accessible from production webhook.

**Signs:**
- Webhook fires (shows in Stripe logs)
- But user not created in database

## Step-by-Step Debugging

### Step 1: Check if user record exists at all
Run this script with the email you used for payment:

```bash
npx tsx scripts/check-user-subscription.ts your-test-email@example.com
```

**If no user found:** Webhook definitely didn't fire → Check Step 2

**If user found but no subscription data:** Webhook fired but failed → Check logs

### Step 2: Check Stripe Webhook Configuration
1. Go to: https://dashboard.stripe.com/test/webhooks (for test mode)
2. Or: https://dashboard.stripe.com/webhooks (for live mode)
3. Look for webhooks

**If no webhook found:** THIS IS YOUR PROBLEM
- You need to create a webhook endpoint pointing to your production URL
- See "How to fix" in section 1 above

**If webhook exists:**
- Click on it
- Check "Recent attempts"
- Look for failed deliveries
- Check error messages

### Step 3: Check Environment Variables
Make sure these are set in your production environment (Vercel/deployment platform):

```env
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  (from production webhook, NOT CLI)
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 4: Test Webhook Manually
You can test if the webhook works by using Stripe's "Send test webhook" feature:
1. Go to webhook in Stripe dashboard
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. Send it
5. Check if user gets created in database

### Step 5: Check Logs
If you have access to production logs:
- Search for: "Creating user from Stripe checkout"
- Search for: "Subscription activated"
- Search for: "Invalid signature" (means webhook secret is wrong)

## Quick Test in Development

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhook/stripe`
4. Copy the webhook secret it gives you (whsec_...)
5. Set in `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Run your app: `npm run dev`
7. Make a test payment
8. Watch the terminal - you should see webhook events

## Expected Successful Flow

When everything works correctly, you should see:

1. **In Stripe Dashboard:**
   - Payment successful
   - Subscription created with 7-day trial
   - Webhook fired successfully (200 response)

2. **In Application Logs:**
   - "Stripe checkout session created"
   - "Creating user from Stripe checkout" OR "Subscription activated for existing user"
   - User record with subscriptionStatus: 'trialing'

3. **For User:**
   - Redirected to `/dashboard?success=true`
   - Has immediate access
   - Can see trial days remaining

## Most Likely Solution

Based on the symptoms (no error, clean redirect, but no access), **you need to set up the production webhook in Stripe Dashboard.**

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-production-domain.com/api/webhook/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to your production environment variables as `STRIPE_WEBHOOK_SECRET`
6. Test with a new payment

This should fix the issue immediately!

