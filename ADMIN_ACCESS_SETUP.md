# Admin Access Setup Guide

## Understanding the Issue

Clerk uses **separate databases** for development and production environments. This means:

- **Dev Environment**: Uses test Clerk keys → Separate user database
- **Prod Environment**: Uses live Clerk keys → Different user database

When you sign in with `muhhamedsin@gmail.com` in dev, you get a **dev-specific Clerk ID**.  
When you sign in with the same email in prod, you get a **different prod-specific Clerk ID**.

## How Admin Access Works

The app grants admin access based on **email addresses** (not Clerk IDs), configured via the `ADMIN_EMAILS` environment variable.

```typescript
// From lib/dashboard-access.ts
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
```

## Solution: Configure Admin Email in Both Environments

### For Development (Local)

Add to your `.env.local` file:

```env
# Admin Configuration
ADMIN_EMAILS=muhhamedsin@gmail.com
```

**OR** if you have multiple admins:

```env
ADMIN_EMAILS=muhhamedsin@gmail.com,admin2@example.com,admin3@example.com
```

### For Production (Vercel/Netlify/etc.)

Add the same variable to your production environment:

1. Go to your deployment platform (Vercel, Netlify, etc.)
2. Navigate to **Project Settings** → **Environment Variables**
3. Add:
   ```
   ADMIN_EMAILS=muhhamedsin@gmail.com
   ```

## Steps to Enable Admin Access

### Step 1: Configure Environment Variables

- ✅ Add `ADMIN_EMAILS=muhhamedsin@gmail.com` to `.env.local`
- ✅ Add `ADMIN_EMAILS=muhhamedsin@gmail.com` to production environment

### Step 2: Sign In with Admin Email in Both Environments

**In Development:**
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Sign in with: muhhamedsin@gmail.com
```

**In Production:**
```
# Visit https://www.ayatbits.com
# Sign in with: muhhamedsin@gmail.com
```

### Step 3: Verify Admin Access

The system automatically:
1. Detects the email is in `ADMIN_EMAILS`
2. Sets `isAdmin: true` in the MongoDB User document
3. Grants full dashboard access without subscription checks

You can verify by checking:
- MongoDB User document has `isAdmin: true`
- You can access `/admin` route
- Dashboard access works without subscription

## Common Issues & Solutions

### Issue 1: "Email works in dev but not prod"

**Solution:** Make sure `ADMIN_EMAILS` is set in **both** environments:
- Check `.env.local` for development
- Check deployment platform environment variables for production

### Issue 2: "Already signed up but not seeing admin access"

**Solution:** The email check happens during sign-in/signup. To fix:
1. Ensure `ADMIN_EMAILS` is configured correctly
2. Sign out and sign back in
3. The `ensureDbUser()` function will update the `isAdmin` flag

### Issue 3: "API routes returning 404"

**Solution:** Clear Next.js cache and restart:
```bash
rm -rf .next
npm run dev
```

If using Turbopack, try without it:
```bash
next dev
```

## Technical Details

### How Account Merging Works

When you sign in, the system:

1. **First tries to find user by Clerk ID:**
   ```typescript
   let dbUser = await User.findOne({ clerkId: clerkUser.id });
   ```

2. **If not found, searches by email:**
   ```typescript
   dbUser = await User.findOne({ 
     email: { $regex: new RegExp(`^${emailLower}$`, 'i') } 
   });
   ```

3. **Merges accounts if email matches:**
   ```typescript
   if (dbUser) {
     dbUser.clerkId = clerkUser.id; // Attach new Clerk ID
     await dbUser.save();
   }
   ```

4. **Checks if email is admin:**
   ```typescript
   const shouldBeAdmin = isAdminEmail(emailLower);
   if (shouldBeAdmin && !dbUser.isAdmin) {
     dbUser.isAdmin = true;
     await dbUser.save();
   }
   ```

### Database Structure

```typescript
interface IUser {
  clerkId: string;          // Changes between dev/prod
  email: string;            // Same in dev/prod - used for admin check
  isAdmin: boolean;         // Set to true if email is in ADMIN_EMAILS
  subscriptionStatus: string;
  // ... other fields
}
```

## Verification Checklist

- [ ] `.env.local` has `ADMIN_EMAILS=muhhamedsin@gmail.com`
- [ ] Production env vars have `ADMIN_EMAILS=muhhamedsin@gmail.com`
- [ ] Signed up/in with `muhhamedsin@gmail.com` in dev
- [ ] Signed up/in with `muhhamedsin@gmail.com` in prod
- [ ] Can access `/admin` route in dev
- [ ] Can access `/admin` route in prod
- [ ] Dashboard works without subscription in both environments

## Quick Test

### Test Dev Environment:
```bash
# 1. Make sure .env.local has ADMIN_EMAILS
echo "ADMIN_EMAILS=muhhamedsin@gmail.com" >> .env.local

# 2. Clear cache and restart
rm -rf .next
npm run dev

# 3. Visit http://localhost:3000 and sign in
# 4. Try accessing http://localhost:3000/admin
```

### Test Prod Environment:
```bash
# 1. Add ADMIN_EMAILS to Vercel/Netlify
# 2. Redeploy
# 3. Visit production URL and sign in
# 4. Try accessing /admin route
```

## Need More Help?

If you're still experiencing issues:

1. Check the MongoDB User document:
   ```javascript
   db.users.findOne({ email: "muhhamedsin@gmail.com" })
   // Should show isAdmin: true
   ```

2. Check server logs for errors:
   ```bash
   # Look for these log messages:
   [ensureDbUser] Found existing user by email! Merging accounts...
   [ensureDbUser] ✅ Account merged successfully!
   ```

3. Verify environment variables are loaded:
   ```typescript
   console.log('Admin emails:', process.env.ADMIN_EMAILS);
   ```

---

**Date Created:** January 9, 2026  
**Last Updated:** January 9, 2026

