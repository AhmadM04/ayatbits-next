# Admin Scripts

This directory contains utility scripts for managing subscriptions and user access.

## Scripts

### 1. `fix-subscription-dates.ts`

**Purpose:** Fixes users who have active/trialing subscriptions but missing `subscriptionEndDate`.

**When to use:**
- After deploying subscription webhook fixes
- When users report they can't access dashboard despite having paid
- Periodic maintenance to ensure data consistency

**How to run:**
```bash
npx tsx --env-file=.env.local scripts/fix-subscription-dates.ts
```

**What it does:**
1. Finds all users with `subscriptionStatus: 'active' | 'trialing'` but no `subscriptionEndDate`
2. Fetches their subscription data from Stripe API
3. Updates the database with correct end dates and plan information
4. Provides detailed output showing what was fixed

**Output Example:**
```
🔍 Searching for users with missing subscription end dates...

📋 Found 2 users to fix

👤 Processing: user@example.com
   Clerk IDs: user_123abc
   ✅ FIXED!
      Status: trialing
      Plan: monthly
      End Date: 2026-03-04T08:19:21.070Z
      Days remaining: 30

📊 Summary:
   ✅ Fixed: 1
   ❌ Errors: 1
   📋 Total: 2
```

---

### 2. `grant-access.ts`

**Purpose:** Manually grant dashboard access to a specific user (emergency use).

**When to use:**
- Emergency access needed immediately
- Webhook issues preventing automatic access
- Testing subscription features
- Gifting access to users

**How to use:**
1. Edit the script and set the `EMAIL` variable:
   ```typescript
   const EMAIL = 'user@example.com';
   const DURATION_DAYS = 30; // Adjust as needed
   ```

2. Run the script:
   ```bash
   npx tsx --env-file=.env.local scripts/grant-access.ts
   ```

**What it does:**
1. Finds the user by email
2. Sets:
   - `subscriptionStatus: 'active'`
   - `subscriptionPlan: 'monthly'`
   - `subscriptionTier: 'pro'`
   - `subscriptionEndDate: now + DURATION_DAYS`
   - `hasDirectAccess: true` (bypasses all subscription checks)

**Output Example:**
```
✅ Found user:
   Email: user@example.com
   Current Status: inactive
   Has Direct Access: false

✅ Access granted!
   New Status: active
   New Plan: monthly (Pro tier)
   End Date: 2026-03-04T08:19:21.070Z
   Days: 30
```

---

### 3. `set-admin.ts`

**Purpose:** Promote a user to admin role.

**How to run:**
```bash
npx tsx scripts/set-admin.ts user@example.com
```

---

## API Alternative

Instead of running scripts locally, you can use the admin API endpoint:

### Sync All Subscriptions

**Endpoint:** `POST /api/admin/sync-subscriptions`

**Authentication:** Requires admin user session

**Example:**
```bash
curl -X POST https://ayatbits.com/api/admin/sync-subscriptions \
  -H "Cookie: your-auth-cookie"
```

**Response:**
```json
{
  "success": true,
  "results": {
    "total": 2,
    "fixed": 1,
    "errors": 1,
    "details": [
      {
        "email": "user@example.com",
        "status": "fixed",
        "subscriptionStatus": "active",
        "subscriptionPlan": "monthly",
        "subscriptionEndDate": "2026-03-04T08:19:21.070Z"
      }
    ]
  }
}
```

---

## Environment Variables

All scripts require the following environment variables (loaded from `.env.local`):

- `STRIPE_SECRET_KEY` - Stripe API secret key
- `MONGODB_URI` - MongoDB connection string
- Other app-specific variables (see `.env.example`)

---

## Troubleshooting

### Script won't run
```bash
# Make sure tsx is installed
npm install -D tsx

# Check environment variables are loaded
npx tsx --env-file=.env.local -e "console.log(process.env.STRIPE_SECRET_KEY ? 'OK' : 'MISSING')"
```

### Permission errors
```bash
# Make sure you have the correct .env.local file
ls -la .env.local

# Verify MongoDB connection
# Check Stripe API key is valid
```

### No users found to fix
This is good! It means all users have valid subscription data.

---

## Best Practices

1. **Always backup before running scripts** (MongoDB has automatic backups)
2. **Test on staging first** if possible
3. **Run fix scripts after deploying webhook changes**
4. **Use `grant-access.ts` only for emergencies** - prefer using admin panel
5. **Monitor logs** after running scripts to verify success

---

## See Also

- `/SUBSCRIPTION_FIX_SUMMARY.md` - Complete documentation of the subscription fix
- `/app/api/admin/sync-subscriptions/route.ts` - API endpoint implementation
- `/lib/subscription.ts` - Subscription checking logic

