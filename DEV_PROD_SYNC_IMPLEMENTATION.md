# Dev/Prod User Sync Implementation

## Overview

This document describes the implementation of a solution to sync user data, admin access, and permissions across development and production environments while using the same MongoDB database with different Clerk instances.

## Problem Statement

**Before:**
- Same MongoDB database used for both dev and prod environments
- Different Clerk instances (dev and prod) assign different `clerkId` values to the same user
- User model stored only ONE `clerkId` (string)
- When logging into dev, the prod `clerkId` was overwritten
- When switching back to prod, the dev `clerkId` was overwritten
- This caused loss of admin access and permissions when switching environments

## Solution

**After:**
- User model now stores an ARRAY of `clerkIds` instead of a single string
- When a user logs in from a different environment, their new `clerkId` is APPENDED to the array
- Email remains the primary identifier for syncing permissions
- Admin status and direct access are preserved across all environments

## Changes Made

### 1. User Model Schema Update

**File:** `lib/models/User.ts`

- Changed `clerkId?: string` to `clerkIds?: string[]`
- Removed unique constraint (email remains unique)
- Updated schema definition to use array type

```typescript
// Before:
clerkId: { type: String, required: false, unique: true, sparse: true, index: true }

// After:
clerkIds: { type: [String], required: false, index: true }
```

### 2. Dashboard Access Logic

**File:** `lib/dashboard-access.ts`

Updated `ensureDbUser()` function to:
- Search for users by checking if clerkId exists in the `clerkIds` array
- Append new clerkIds instead of overwriting
- Maintain admin status sync based on `ADMIN_EMAILS`
- Preserve all permissions across environment switches

### 3. API Routes Updated

All API routes that query by `clerkId` have been updated to use the array syntax:

**Files updated:**
- `app/api/webhook/stripe/route.ts`
- `app/api/subscriptions/sync/route.ts`
- `app/api/check-access/route.ts`
- `app/api/user/settings/route.ts`
- `app/api/user/clear-data/route.ts`
- `app/api/user/translation/route.ts`
- `app/api/user/resume/route.ts`
- `app/api/user/liked/route.ts`
- `app/api/user/achievements/route.ts`
- `app/api/billing/portal/route.ts`
- `app/api/checkout/route.ts`
- `app/api/puzzles/[id]/like/route.ts`
- `app/api/puzzles/[id]/progress/route.ts`
- `app/api/debug/subscription-status/route.ts`
- `app/api/debug/user-status/route.ts`
- `app/api/admin/bypass/route.ts`
- `app/actions/admin.ts`

**Query pattern change:**
```typescript
// Before:
User.findOne({ clerkId: userId })

// After:
User.findOne({ clerkIds: userId })
// MongoDB automatically searches arrays with this syntax
```

### 4. Helper Functions

**File:** `lib/user-helpers.ts` (NEW)

Created utility functions for common user operations:
- `findUserByAnyClerkId(clerkId)` - Find user by checking clerkIds array
- `getUserByEmail(email)` - Case-insensitive email lookup
- `addClerkIdToUser(userId, clerkId)` - Safely add a new clerkId
- `findOrCreateUserByClerkId()` - Find or create with proper merging
- `userHasAnyClerkId()` - Check if user has any of given clerkIds
- `getAllClerkIdsForUser()` - Get all clerkIds for a user by email

### 5. Migration Script

**File:** `scripts/migrate-clerkids.ts` (NEW)

Created a safe migration script to convert existing data:
- Finds all users with old `clerkId` field (string)
- Converts to `clerkIds` array format
- Handles edge cases (null values, existing arrays)
- Provides verification after migration
- Includes 3-second countdown for safety

**Usage:**
```bash
npm run db:migrate-clerkids
```

**Added to package.json:**
```json
"scripts": {
  "db:migrate-clerkids": "tsx -r dotenv/config scripts/migrate-clerkids.ts"
}
```

## How It Works

### User Login Flow

```
1. User logs in via Clerk (dev or prod)
2. Clerk provides clerkId (different per environment)
3. System searches for user by clerkId in clerkIds array
4. If found: User is authenticated
5. If not found: Search by email
   - If email exists: Add new clerkId to array
   - If email doesn't exist: Create new user with clerkIds array
6. Admin status synced based on ADMIN_EMAILS env var
7. All permissions (hasDirectAccess, subscriptions) preserved
```

### MongoDB Query Behavior

MongoDB automatically searches array fields when using simple equality:

```typescript
// This query works for both:
User.findOne({ clerkIds: "user_abc123" })

// Matches documents with:
{ clerkIds: ["user_abc123"] }
{ clerkIds: ["user_abc123", "user_xyz789"] }
{ clerkIds: ["user_xyz789", "user_abc123"] }
```

## Migration Steps

### For Existing Deployments

1. **Deploy the code changes** (all files updated above)
2. **Run the migration script:**
   ```bash
   npm run db:migrate-clerkids
   ```
3. **Verify migration:**
   - Check that users can log in from both dev and prod
   - Verify admin access is maintained
   - Check that permissions persist

### For New Deployments

No migration needed - the schema will automatically use `clerkIds` arrays.

## Testing Checklist

- [ ] Log in to dev environment with your email
- [ ] Verify admin access works in dev
- [ ] Check MongoDB - should see your dev clerkId in clerkIds array
- [ ] Log in to prod environment with same email
- [ ] Verify admin access works in prod
- [ ] Check MongoDB - should see BOTH dev and prod clerkIds in array
- [ ] Switch back to dev - verify everything still works
- [ ] Test subscription/payment flows in both environments
- [ ] Test admin panel operations from both environments

## Benefits

✅ **Seamless Environment Switching** - Log in to dev or prod without losing access  
✅ **Unified Permissions** - Admin status and direct access synced via email  
✅ **No Data Loss** - All clerkIds preserved, no overwrites  
✅ **Backward Compatible** - Migration script handles existing data safely  
✅ **Single Source of Truth** - Email remains the primary identifier  
✅ **Production Safe** - No breaking changes, graceful migration  

## Environment Variables

No changes needed to environment variables. The system continues to use:

- `ADMIN_EMAILS` - Comma-separated list of admin emails (works across both environments)
- `MONGODB_URL` - Same database for both environments
- `CLERK_SECRET_KEY_TEST` / `CLERK_SECRET_KEY` - Separate keys per environment
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

## Rollback Plan

If issues occur, you can rollback by:

1. Revert code changes (git revert)
2. Run a reverse migration (convert clerkIds array back to single clerkId)
3. Redeploy previous version

**Note:** The migration script preserves data, so rollback is safe.

## Maintenance

### Adding New API Routes

When creating new API routes that query users:

```typescript
// ✅ Correct:
const user = await User.findOne({ clerkIds: userId });

// ❌ Wrong:
const user = await User.findOne({ clerkId: userId });
```

### Creating New Users

When creating users programmatically:

```typescript
// ✅ Correct:
await User.create({
  clerkIds: [clerkId],
  email: email.toLowerCase(),
  // ... other fields
});

// ❌ Wrong:
await User.create({
  clerkId: clerkId,
  // ...
});
```

## Support

For issues or questions:
1. Check MongoDB to verify clerkIds array structure
2. Check logs for "Merging existing user account" messages
3. Verify ADMIN_EMAILS environment variable is set correctly
4. Use the helper functions in `lib/user-helpers.ts` for user operations

---

**Implementation Date:** January 17, 2026  
**Status:** ✅ Complete  
**Migration Required:** Yes (run `npm run db:migrate-clerkids`)

