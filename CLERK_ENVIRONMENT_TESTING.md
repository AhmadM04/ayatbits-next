# Clerk Environment Testing Guide

This guide helps you test the new Clerk environment selector to ensure frontend and backend use matching keys.

## Quick Test

### 1. Add Environment Variable

Add to your `.env.local`:
```env
CLERK_ENVIRONMENT=test
```

### 2. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3. Check Configuration

Visit: http://localhost:3000/api/debug/clerk-status

You should see:
```json
{
  "status": "OK",
  "environment": {
    "CLERK_ENVIRONMENT": "test"
  },
  "validation": {
    "valid": true,
    "publishableInstance": "pk_test",
    "secretInstance": "sk_test"
  }
}
```

### 4. Test Sign In

1. Go to http://localhost:3000/sign-in
2. Sign in with your test account
3. You should NOT see JWT kid mismatch errors

## Switching Environments

### Switch to Production Keys

1. Update `.env.local`:
```env
CLERK_ENVIRONMENT=production
```

2. Restart dev server
3. Visit `/api/debug/clerk-status`
4. Verify `publishableInstance` and `secretInstance` both show `pk_live` and `sk_live`

### Switch Back to Test Keys

1. Update `.env.local`:
```env
CLERK_ENVIRONMENT=test
```

2. Restart dev server
3. Verify configuration at `/api/debug/clerk-status`

## Common Issues

### Issue: "valid": false in debug endpoint

**Cause**: Frontend and backend keys are from different instances

**Fix**:
1. Check that both TEST keys are configured (or both PROD keys)
2. Verify `CLERK_ENVIRONMENT` matches your intended environment
3. Restart dev server

### Issue: Still seeing kid mismatch errors

**Cause**: Old session cookies from previous configuration

**Fix**:
1. Clear browser cookies for localhost:3000
2. Sign out and sign in again
3. Restart dev server

### Issue: Keys not found

**Cause**: Missing environment variables

**Fix**:
1. Ensure `.env.local` has both TEST and PROD keys
2. Check variable names match exactly:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST`
   - `CLERK_SECRET_KEY_TEST`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## Verification Checklist

- [ ] `CLERK_ENVIRONMENT` is set in `.env.local`
- [ ] Both TEST and PROD keys are configured
- [ ] `/api/debug/clerk-status` shows `"valid": true`
- [ ] `publishableInstance` and `secretInstance` match (both test or both live)
- [ ] Sign in works without kid mismatch errors
- [ ] Can switch between test and production environments

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform:
```env
CLERK_ENVIRONMENT=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
NODE_ENV=production
```

2. Verify deployment:
   - Check application logs for Clerk configuration
   - Test sign in with production users
   - Monitor for JWT errors

## Debug Logs

In development, the app logs Clerk configuration on startup:

```
[Clerk Environment] {
  environment: 'test',
  publishableKeyPrefix: 'pk_test_xxxxxxxxxxxx...',
  hasSecretKey: true
}
[Clerk Instance Validation] {
  environment: 'test',
  valid: true,
  publishableInstance: 'pk_test',
  secretInstance: 'sk_test'
}
[Clerk] ✓ Instance validation passed
```

If you see validation errors, check your environment variables.

## Need Help?

1. Visit `/api/debug/clerk-status` for detailed configuration info
2. Check the console logs on server startup
3. Verify your Clerk Dashboard has both test and production instances configured
4. Ensure you're using keys from the same Clerk application

---

**Last Updated**: January 2026  
**Related Docs**: 
- [ENV_VARIABLES.md](ENV_VARIABLES.md)
- [CLERK_DUAL_ENV_SETUP.md](CLERK_DUAL_ENV_SETUP.md)

