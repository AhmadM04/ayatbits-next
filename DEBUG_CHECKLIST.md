# Debug Checklist for Stripe Checkout Issue

## Step 1: Test & Capture Browser Console Logs

1. Open your site in an incognito/private window
2. Open DevTools (F12) → Console tab
3. Start a checkout flow
4. Complete payment with test card: `4242 4242 4242 4242`
5. After redirect back to your site, **copy ALL console logs**

Look for these specific logs:
- `[PricingContent] Component mounted`
- `[PricingContent] URL params: ...` (should show `success: 'true'`)
- `[PricingContent] Starting access polling...`
- `[PricingContent] Access check response: ...`

## Step 2: Check Stripe Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Find your webhook endpoint (should be: `https://yourdomain.com/api/webhook/stripe`)
3. Check:
   - ✅ Is the endpoint URL correct?
   - ✅ Is the webhook enabled?
   - ✅ Is `checkout.session.completed` event selected?
4. Click on recent webhook attempts
5. Check if they show "Succeeded" or "Failed"
6. If failed, check the response/error

## Step 3: Check Environment Variables

Verify these are set correctly:

```bash
# Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID=price_...

# App URL (must match exactly)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

⚠️ Common issues:
- Webhook secret not set or incorrect
- App URL has trailing slash or missing https://
- Using test keys in production or vice versa

## Step 4: Check Server Logs

Check your hosting platform logs (Vercel, etc.) and search for:
- `[stripe-webhook]` - webhook processing
- `[check-access]` - access verification

If you don't see ANY webhook logs, the webhook isn't being received.

## Step 5: Test Webhook Manually

In Stripe Dashboard:
1. Go to Webhooks → Click your endpoint
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. Send it
5. Check if your server logs show `[stripe-webhook]` messages

## Common Issues & Solutions

### Issue: No webhook logs at all
**Cause**: Webhook not reaching your server
**Solutions**:
- Check webhook URL is correct in Stripe
- Check firewall/hosting allows POST requests to `/api/webhook/stripe`
- Check `STRIPE_WEBHOOK_SECRET` environment variable is set

### Issue: Webhook fails signature verification
**Cause**: Wrong webhook secret
**Solutions**:
- Copy the webhook secret from Stripe Dashboard
- Update `STRIPE_WEBHOOK_SECRET` in environment variables
- Redeploy

### Issue: Webhook succeeds but user not found
**Cause**: Clerk ID not in metadata or user not in database
**Solutions**:
- Check checkout session includes metadata with `clerkId`
- Check user was created in database during signup
- Check logs show user lookup result

### Issue: Frontend never detects access
**Cause**: Access check not seeing subscription
**Solutions**:
- Check server logs show subscription was saved
- Check database to verify user has subscription data
- Check `subscriptionStatus`, `subscriptionEndDate` fields

## What to Share

Please share:
1. ✅ Browser console logs (all `[PricingContent]` logs)
2. ✅ Server logs (all `[stripe-webhook]` and `[check-access]` logs)
3. ✅ Stripe webhook attempt details (success/fail, response code)
4. ✅ Screenshot of Stripe webhook configuration
5. ✅ Confirm all environment variables are set

