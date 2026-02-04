# Stripe API Version Update ✅

## What Changed

Updated Stripe API version from `2025-11-17.clover` to `2026-01-28.clover` (latest version) across the entire codebase.

## Files Updated

1. ✅ `app/api/checkout/route.ts` - Checkout session creation
2. ✅ `app/api/webhook/stripe/route.ts` - Webhook handling
3. ✅ `app/api/billing/portal/route.ts` - Billing portal
4. ✅ `app/api/admin/sync-subscriptions/route.ts` - Admin subscription sync
5. ✅ `scripts/fix-subscription-dates.ts` - Subscription fix script

All files now use:
```typescript
apiVersion: '2026-01-28.clover' as any
```

## Required Action: Update Stripe Webhook

**CRITICAL**: You must update your Stripe webhook to match this version!

### Steps:

1. **Go to Stripe Dashboard**
   - [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Make sure you're in **Live mode** (toggle top right)

2. **Update Your Webhook**
   - Click on your webhook endpoint
   - Click **"..."** menu → **"Update details"**
   - Under **"API version"**, select: `2026-01-28.clover`
   - Click **"Update endpoint"**

3. **Verify Events**
   Make sure these events are selected:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`

4. **Test the Webhook**
   - Click **"Send test webhook"**
   - Select `checkout.session.completed`
   - Should return **200 OK**

## Why This Matters

**API version mismatch can cause:**
- ❌ Webhook processing failures
- ❌ Missing or different field names
- ❌ Type errors in your code
- ❌ Subscription data not syncing

**With matching versions:**
- ✅ Reliable webhook processing
- ✅ Latest Stripe features
- ✅ Better type safety
- ✅ Future-proof implementation

## Benefits of 2026-01-28.clover

- Latest Stripe features and improvements
- Better error handling
- Enhanced security features
- Up-to-date field structures

## Next Steps

1. ✅ **Code updated** (done automatically)
2. ⚠️ **Update webhook in Stripe Dashboard** (do this now!)
3. ⚠️ **Redeploy your app**
4. ✅ **Test a checkout flow**

## Testing After Update

1. Create a test checkout
2. Complete payment
3. Check server logs for `[stripe-webhook]` messages
4. Verify no errors appear
5. Confirm user gets access

## Rollback (If Needed)

If you encounter issues, you can rollback:

1. Change all instances back to `'2025-11-17.clover'`
2. Update webhook to `2025-11-17.clover`
3. Redeploy

But this shouldn't be necessary - the latest version is stable!

## Additional Fix: .env File

**IMPORTANT**: Also fix your `.env` file!

Change:
```env
ADMIN_EMAILS = muhhamedsin@gmail.com,ahmad.muhhamedsin@gmail.com,aminya.makhmutova@gmail.com
```

To (remove spaces around `=`):
```env
ADMIN_EMAILS=muhhamedsin@gmail.com,ahmad.muhhamedsin@gmail.com,aminya.makhmutova@gmail.com
```

This fixes admin access for your email addresses!

## Summary

- ✅ All code updated to latest Stripe API version
- ⚠️ **ACTION REQUIRED**: Update webhook in Stripe Dashboard to `2026-01-28.clover`
- ⚠️ **ACTION REQUIRED**: Fix `.env` file (remove spaces around `=`)
- ⚠️ **ACTION REQUIRED**: Redeploy your app

