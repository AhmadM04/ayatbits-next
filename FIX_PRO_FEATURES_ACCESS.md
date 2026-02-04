# Fix: Pro Features Access for Admin-Granted Users

## Problem

Users who were manually granted access via the admin panel couldn't see or use Pro features (AI Tafsir, Word-by-Word Audio).

## Root Cause

The API endpoints were looking up users **only by Clerk ID**, but when you grant access via email to users who haven't signed in yet, they don't have a Clerk ID in the database yet. Even after they sign in, there could be a timing issue where the Clerk ID isn't synced immediately.

## Solution Implemented

### 1. Created Robust User Lookup Function

Added `findUserRobust()` in `/lib/subscription.ts` that:
- First tries to find user by Clerk ID (fast path)
- If not found, falls back to email lookup (handles admin-granted users)
- Automatically syncs the Clerk ID when found by email
- Logs all lookups for debugging

### 2. Updated Pro Feature Endpoints

Updated these critical endpoints to use the robust lookup:
- `/app/api/ai/tafsir/route.ts` - AI Tafsir feature
- `/app/api/user/settings/route.ts` - Word-by-Word Audio setting
- `/app/api/check-access/route.ts` - Access checking (used by frontend)

### 3. Added Better Logging

Added console logs to help diagnose access issues:
- Logs when users are found by email vs Clerk ID
- Logs subscription status when access is denied
- Shows exact values of `hasDirectAccess`, `subscriptionTier`, etc.

### 4. Created Diagnostic Script

Added `/scripts/check-user-access.ts` to help verify user access status.

## How to Use

### For Users You Already Granted Access To

1. **Ask them to sign out and sign back in**
   - This ensures their Clerk ID is synced with their database record
   - The new code will automatically sync their Clerk ID on first access

2. **Or wait for them to try using a Pro feature**
   - When they try to use AI Tafsir or Word-by-Word Audio
   - The robust lookup will find them by email and sync their Clerk ID automatically

### For New Users You Want to Grant Access To

1. Go to `/admin` on your app
2. Enter their email address
3. Select duration (lifetime, 1 year, etc.)
4. Click "Grant Access"
5. Tell them to sign up/in with that exact email

The system will automatically sync everything when they sign in.

## Diagnostic Script

To check if a user has proper access:

```bash
npx tsx scripts/check-user-access.ts user@example.com
```

This will show:
- ✅ If user exists in database
- ✅ Their Clerk ID status
- ✅ Their subscription details
- ✅ Whether they have basic and/or pro access
- ⚠️ Any issues and how to fix them

## What Changed in the Code

### Before
```typescript
// Only looked up by Clerk ID
const dbUser = await User.findOne({ clerkIds: user.id });
```

### After
```typescript
// Tries Clerk ID first, falls back to email, auto-syncs
const userEmail = user.emailAddresses?.[0]?.emailAddress;
const dbUser = await findUserRobust(user.id, userEmail);
```

## Testing the Fix

1. **Test with existing admin-granted user:**
   ```bash
   # Check their status
   npx tsx scripts/check-user-access.ts their@email.com
   
   # Have them sign out and back in
   # Then try accessing AI Tafsir or enabling Word-by-Word Audio
   ```

2. **Test with new user:**
   ```bash
   # Grant them access via /admin
   # Check status
   npx tsx scripts/check-user-access.ts newuser@email.com
   
   # Have them sign up with that email
   # Try pro features immediately
   ```

3. **Check logs:**
   Look for these log messages in your console/logs:
   - "User found by email but not by clerkId - syncing clerkId"
   - "ClerkId synced successfully"
   - "Pro access denied for user" (with full details)

## How Pro Access Works Now

Pro access is granted when **any** of these conditions are true:

1. ✅ `hasDirectAccess === true` (admin-granted)
2. ✅ `subscriptionTier === 'pro'` (paid pro subscription)
3. ✅ `role === 'admin'` (admin users)

When you use the admin panel to grant access, it sets:
- `hasDirectAccess: true`
- `subscriptionTier: 'pro'`
- `subscriptionStatus: 'active'`
- `subscriptionPlan: 'lifetime'` (or whatever duration you choose)

## Next Steps

1. Deploy these changes
2. Ask affected users to sign out and back in
3. Use the diagnostic script to verify their access
4. Monitor logs for any "Pro access denied" messages
5. If issues persist, check the console logs for the specific reason

## Files Modified

- `/lib/subscription.ts` - Added `findUserRobust()` function
- `/app/api/ai/tafsir/route.ts` - Use robust lookup + better logging
- `/app/api/user/settings/route.ts` - Use robust lookup + better logging
- `/app/api/check-access/route.ts` - Use robust lookup + return tier info
- `/scripts/check-user-access.ts` - New diagnostic tool

## Support

If users still can't access pro features after signing out/in:

1. Run the diagnostic script: `npx tsx scripts/check-user-access.ts their@email.com`
2. Check the output for warnings
3. If needed, re-grant access via the `/admin` panel
4. Check your application logs for the detailed console.log messages

The new code will automatically sync Clerk IDs and log exactly why access was denied, making it much easier to debug.


