# Environment Variables Configuration

This document explains how to configure environment variables for both development and production environments.

## Clerk Authentication Keys

The app uses **different Clerk keys** based on the environment, controlled by the `CLERK_ENVIRONMENT` variable.

### ⚠️ Important: Preventing JWT Kid Mismatch

To prevent JWT kid mismatch errors, the app uses a **single environment selector** that ensures frontend and backend use keys from the SAME Clerk instance.

### Clerk Environment Selector (NEW)
```env
# Set to 'test' for development, 'production' for production
CLERK_ENVIRONMENT=test
```

### Development Environment (Local Testing)
```env
CLERK_ENVIRONMENT=test
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxxxxxx
```

### Production Environment
```env
CLERK_ENVIRONMENT=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
```

### iOS App (Optional)
```env
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
APPLE_BUNDLE_ID=com.your.app.bundle
```

## How It Works

The app uses the `CLERK_ENVIRONMENT` variable to select Clerk keys:

- **Test Environment** (`CLERK_ENVIRONMENT=test`): 
  - Uses keys with `_TEST` suffix
  - Both frontend and backend use test instance keys
  - This allows you to test locally without affecting production users

- **Production Environment** (`CLERK_ENVIRONMENT=production`): 
  - Uses standard keys (no suffix)
  - Both frontend and backend use production instance keys
  - Ensures production users authenticate with the production Clerk instance

### Why This Matters

Previously, the app used a fallback approach (`TEST || PROD`) which could cause frontend and backend to use keys from different Clerk instances, resulting in JWT kid mismatch errors. The new approach guarantees consistency.

## Configuration Files

### `lib/clerk-config.ts`
This file contains the logic that:
1. Detects the current environment
2. Selects the appropriate Clerk keys
3. Automatically configures the Clerk SDK

### `app/layout.tsx`
Uses `getClerkPublishableKey()` to get the correct publishable key for the client-side.

### `middleware.ts`
Imports the clerk configuration to ensure server-side middleware uses the correct keys.

## Setting Up Your Environment

### For Local Development

Create a `.env.local` file with:

```env
# MongoDB
MONGODB_URL=mongodb+srv://your-connection-string

# Clerk Environment Selector
CLERK_ENVIRONMENT=test

# Development Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST=pk_test_your_key_here
CLERK_SECRET_KEY_TEST=sk_test_your_key_here

# Optional: Production keys (for testing production builds locally)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin emails
ADMIN_EMAILS=your-email@example.com
```

### For Production Deployment

Set these environment variables in your deployment platform (Vercel, Netlify, etc.):

```env
NODE_ENV=production
CLERK_ENVIRONMENT=production
MONGODB_URL=your-production-mongodb-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://www.ayatbits.com
ADMIN_EMAILS=admin@ayatbits.com
```

## Testing Production Keys Locally

If you want to test production Clerk keys locally:

```bash
# Build with production environment
NODE_ENV=production npm run build

# Or run in production mode
NODE_ENV=production npm run start
```

This will use your `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production keys).

## Getting Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys**
4. You'll find separate keys for:
   - **Development** instance (use for `_TEST` variables)
   - **Production** instance (use for standard variables)

## Troubleshooting

### JWT Kid Mismatch Error?
**Error**: `Unable to find a signing key in JWKS that matches the kid='ins_xxxxx'`

**Solution**:
1. Check your `CLERK_ENVIRONMENT` variable is set correctly
2. Visit `/api/debug/clerk-status` to verify key consistency
3. Ensure both TEST and PROD keys are configured
4. Restart your dev server after changing environment variables

### Keys not working in development?
- Set `CLERK_ENVIRONMENT=test` in `.env.local`
- Verify you have `_TEST` suffixed keys in `.env.local`
- Restart your dev server after adding keys
- Check `/api/debug/clerk-status` for validation

### Keys not working in production?
- Set `CLERK_ENVIRONMENT=production` in deployment environment
- Verify `NODE_ENV=production` is set
- Check that production keys (without `_TEST` suffix) are configured
- Ensure keys match your Clerk production instance

### "Publishable key not found" error?
- Check that you're using the correct variable names
- Verify the clerk-config.ts file is being imported
- Clear `.next` cache and rebuild
- Visit `/api/debug/clerk-status` to check configuration

## Security Notes

⚠️ **Never commit `.env.local` to git!**

- `.env.local` is in `.gitignore` by default
- Only use test/development keys for local development
- Store production keys securely in your deployment platform's environment variables
- Rotate keys if they are ever exposed

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

