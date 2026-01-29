# Fix Development Access Issue

## Problem
Your browser has production Clerk session cookies that conflict with your development environment. This causes:
- 404 errors on `/api/check-access`
- Clerk handshake errors
- Unable to authenticate properly in development

## Solution

### Step 1: Clear Browser Cookies

**Option A - Clear all localhost cookies (Recommended):**
1. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
2. Go to the "Application" tab
3. In the left sidebar, expand "Cookies"
4. Click on "http://localhost:3000"
5. Click "Clear all" (🚫 icon at the top)
6. Refresh the page

**Option B - Use Incognito/Private Window:**
1. Open a new Incognito/Private browser window
2. Go to `http://localhost:3000`
3. Sign in fresh

### Step 2: Sign Out and Back In
1. If you can, sign out of the app
2. Clear cookies (see Step 1)
3. Sign in again with your development account

### Step 3: Verify Your Account
After signing in fresh, the `ensureDbUser` function will automatically:
- Find your user by email (`ahmad.muhhamedsin@gmail.com`)
- Add your development Clerk ID to your account
- Grant you access based on your lifetime subscription

## Alternative: Force Cookie Clear via Code

If the above doesn't work, you can add this temporary code to force clear cookies:

**Add to `app/page.tsx` temporarily:**
```typescript
'use client';

useEffect(() => {
  // Clear all cookies for localhost
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  window.location.reload();
}, []);
```

## Why This Happened
- You have separate Clerk instances for dev and production
- Your browser cached production session cookies
- When you visited localhost, it tried to use production cookies in development
- The Clerk signing keys don't match between environments

## Verification
After clearing cookies and signing in, check:
1. No Clerk errors in terminal
2. `/api/check-access` returns 200 (not 404)
3. Dashboard is accessible

