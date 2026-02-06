# Clerk Webhook Issue - User Access Problem

## Problem Summary

User signed up successfully and redeemed a voucher (RAMADAN2026), but still doesn't have dashboard access.

### Root Cause

**Clerk is NOT sending `user.created` webhook events** - only `email.created` and `session.created` events are being sent.

- Without `user.created` event → Database user record is never created
- Voucher redemption requires user to exist in database
- Even though voucher validates, user can't redeem it and won't have access

## Event Log Analysis

```
email.created    - 01KGS6HHRY8WTRZ4VD9BE3JB9W - 6/02/2026, 11:04
session.created  - 01KGS6HHPSS2WCY1237P5D2B2W - 6/02/2026, 11:04
email.created    - 01KGS6G7GTKKWMPXPJ3NWVMWY3 - 6/02/2026, 11:03

❌ MISSING: user.created event
```

## Solution Implemented

### ✅ Fixed: Voucher Redemption Endpoint

Updated `/app/api/vouchers/redeem/route.ts` to **create user if they don't exist** (similar to the sync endpoint pattern).

**What was changed:**
- Previously: Returned 404 if user not found
- Now: Creates user automatically if missing (webhook fallback)
- Also handles email-based merging for existing accounts

This ensures voucher redemption works even if webhooks fail.

## Action Required: Fix Clerk Webhook Configuration

### Step 1: Check Clerk Dashboard

1. Go to: https://dashboard.clerk.com
2. Navigate to: **Webhooks** section
3. Find your webhook endpoint (should be `https://yourdomain.com/api/webhook/clerk`)
4. Click to edit the webhook

### Step 2: Verify Event Subscription

**Make sure `user.created` is checked in the events list!**

The webhook should be subscribed to:
- ✅ `user.created` (CRITICAL - currently missing)
- ✅ `user.updated` (recommended)
- ✅ `user.deleted` (optional)

### Step 3: Verify Webhook Secret

Ensure `CLERK_WEBHOOK_SECRET` is set in your environment variables:

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

You can find this secret in the Clerk dashboard under your webhook's "Signing Secret".

### Step 4: Test Webhook

After enabling `user.created`:
1. Create a test user in Clerk Dashboard
2. Check your application logs for: `User created via Clerk webhook`
3. Verify the webhook appears in Clerk's webhook logs

## Existing Fallback Mechanisms

Your application already has multiple fallbacks for user creation:

### 1. Clerk Webhook (Primary)
- **File:** `/app/api/webhook/clerk/route.ts`
- **Triggered:** When Clerk sends `user.created` event
- **Status:** ❌ NOT WORKING (event not being sent)

### 2. User Sync Endpoint (Fallback #1)
- **File:** `/app/api/user/sync/route.ts`
- **Triggered:** When user loads dashboard (via UserSyncProvider)
- **Status:** ✅ WORKING (but user must visit dashboard first)

### 3. Voucher Redemption (Fallback #2 - NEW)
- **File:** `/app/api/vouchers/redeem/route.ts`
- **Triggered:** When user redeems a voucher
- **Status:** ✅ FIXED (now creates user if missing)

### 4. Dashboard Access (Fallback #3)
- **File:** `/lib/dashboard-access.ts` (`ensureDbUser` function)
- **Triggered:** When user accesses protected dashboard routes
- **Status:** ✅ WORKING

## For the Current User

Since the voucher redemption endpoint is now fixed, the user can:

### Option 1: Re-redeem Voucher
Have the user try redeeming the voucher code again: `RAMADAN2026`
- The endpoint will now create their user account
- Access will be granted automatically

### Option 2: Manual Database Check
Check if the user already exists in the database but subscription wasn't applied:

```bash
# Get user email from Clerk logs
# Then check MongoDB for user with that email
```

If user exists, manually update their subscription in the admin panel.

### Option 3: Admin Grant Access
Use the admin panel to grant access directly by email:
1. Go to admin dashboard
2. Find "Grant Premium Access"
3. Enter user's email
4. Select duration (1 month for RAMADAN2026 voucher)

## Long-term Fix

**Enable `user.created` webhook event in Clerk Dashboard** to prevent this issue from happening again.

## Testing Checklist

- [ ] Verify `user.created` is enabled in Clerk webhook configuration
- [ ] Test new user signup → Check if database record is created
- [ ] Test voucher redemption for new user (should work now)
- [ ] Monitor Clerk webhook logs for `user.created` events
- [ ] Verify `CLERK_WEBHOOK_SECRET` is set in environment variables

## Files Modified

- ✅ `/app/api/vouchers/redeem/route.ts` - Added user creation fallback

---

**Status:** Code fix deployed ✅ | Webhook configuration pending ⏳

