# Voucher Access Debugging Guide

## The Problem
User redeems voucher but still doesn't have access.

## What's Likely Happening
1. **Clerk ID Not Synced**: The user in your database doesn't have the Clerk ID linked
2. **Frontend Caching**: The frontend is caching old access state
3. **Database Propagation**: Race condition between redemption and access check

## Testing Steps

### Step 1: Test Voucher Redemption (No Webhooks Needed)
Vouchers work through the `/api/vouchers/redeem` endpoint, NOT webhooks.

1. **Create a test voucher** in your admin panel
2. **Sign in as a test user**
3. **Go to /pricing page**
4. **Enter the voucher code and click redeem**
5. **Watch the browser console** for errors
6. **Check if you're redirected** to /dashboard

### Step 2: Check User Status After Redemption
After redeeming, immediately go to this URL:

```
https://yourapp.com/api/debug/voucher-access
```

This will show you:
- ✅ If user exists in database
- ✅ If Clerk ID is synced
- ✅ Subscription status, tier, end date
- ✅ All voucher redemptions
- ✅ Whether user should have access
- ✅ Specific diagnosis and recommendation

### Step 3: Check Specific User by Email
If you want to debug a specific user:

```
https://yourapp.com/api/debug/voucher-access?email=user@example.com
```

### Step 4: Understanding the Output

#### ✅ Good State (Working)
```json
{
  "debug": {
    "identity": {
      "clerkIdMatches": true  // ✅ Clerk ID is synced
    },
    "subscription": {
      "status": "active",  // ✅ Active subscription
      "endDate": "2026-03-06T...",  // ✅ Future date
      "isEndDateFuture": true  // ✅ Not expired
    },
    "access": {
      "hasBasicAccess": true,  // ✅ Has access
      "hasProAccess": true  // ✅ Has pro (if voucher was pro)
    },
    "vouchers": {
      "totalRedeemed": 1  // ✅ Voucher was redeemed
    }
  }
}
```

#### ❌ Problem 1: Clerk ID Not Synced
```json
{
  "identity": {
    "clerkId": "user_abc123",  // Current Clerk ID
    "clerkIdsInDb": [],  // ❌ Empty! Not synced
    "clerkIdMatches": false  // ❌ Not matched
  }
}
```

**FIX**: The user needs to sign out and sign back in, OR you need to manually add their Clerk ID to the database.

#### ❌ Problem 2: Voucher Didn't Redeem Properly
```json
{
  "subscription": {
    "status": "inactive",  // ❌ Should be "active"
    "endDate": null  // ❌ No end date set
  },
  "vouchers": {
    "totalRedeemed": 0  // ❌ No redemptions recorded
  }
}
```

**FIX**: Voucher redemption failed. Check server logs for errors in `/api/vouchers/redeem`.

#### ❌ Problem 3: End Date in Past
```json
{
  "subscription": {
    "status": "active",
    "endDate": "2025-01-01T...",  // ❌ Date in past
    "isEndDateFuture": false,  // ❌ Expired
    "daysUntilExpiry": -36  // ❌ Negative days
  }
}
```

**FIX**: Voucher expired or date was set incorrectly.

## What Webhooks to Test

### ❌ DON'T Test These:
- `email.created` - Does nothing for vouchers
- `email.updated` - Does nothing for vouchers

### ✅ DO Test This (If Needed):
- `user.created` - Only needed if users aren't being created properly

**But for vouchers, you DON'T need webhooks at all!** Vouchers are handled by the `/api/vouchers/redeem` endpoint.

## Clerk Webhook Testing (Optional)
If you still want to test Clerk webhooks:

1. Go to Clerk Dashboard → Webhooks
2. Select your webhook endpoint
3. Send a test `user.created` event
4. Check that a user is created in your database

**This has NOTHING to do with voucher access.**

## Quick Fix Checklist

If user redeemed voucher but has no access:

1. ✅ **Check user exists**: `/api/debug/voucher-access?email=user@example.com`
2. ✅ **Check Clerk ID synced**: Look at `clerkIdMatches` in debug output
3. ✅ **Check redemption recorded**: Look at `vouchers.totalRedeemed`
4. ✅ **Check subscription active**: Look at `subscription.status`
5. ✅ **Check end date valid**: Look at `subscription.isEndDateFuture`
6. ✅ **Clear frontend cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
7. ✅ **Sign out and back in**: Forces Clerk ID sync

## Manual Database Fix (If Needed)

If Clerk ID isn't synced, you can manually fix it in MongoDB:

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $addToSet: { clerkIds: "user_clerkIdHere" }
  }
)
```

## Still Having Issues?

1. Check server logs during voucher redemption
2. Check browser console during voucher redemption
3. Verify voucher is active and not expired
4. Verify voucher hasn't exceeded max redemptions
5. Check that user isn't already subscribed via Stripe (might be using wrong account)

## TL;DR

**Vouchers don't use webhooks. They use `/api/vouchers/redeem`.**

To debug:
1. User redeems voucher
2. Immediately check: `/api/debug/voucher-access`
3. Look at the `diagnosis.recommendation` field
4. Follow the fix instructions above

