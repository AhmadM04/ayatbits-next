# Environment Variables Configuration

This document explains how to configure environment variables for both development and production environments.

## Clerk Authentication Keys

The app uses **different Clerk keys** based on the environment:

### Development Environment (Local Testing)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxxxxxx
```

### Production Environment
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
```

### iOS App (Optional)
```env
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
APPLE_BUNDLE_ID=com.your.app.bundle
```

## How It Works

The app automatically selects the correct Clerk keys based on `NODE_ENV`:

- **Development** (`NODE_ENV=development`): 
  - Uses keys with `_TEST` suffix
  - This allows you to test locally without affecting production users

- **Production** (`NODE_ENV=production`): 
  - Uses standard keys (no suffix)
  - Ensures production users authenticate with the production Clerk instance

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

### Keys not working in development?
- Make sure `NODE_ENV` is not set to `production`
- Verify you have `_TEST` suffixed keys in `.env.local`
- Restart your dev server after adding keys

### Keys not working in production?
- Verify `NODE_ENV=production` is set
- Check that production keys (without `_TEST` suffix) are configured
- Ensure keys match your Clerk production instance

### "Publishable key not found" error?
- Check that you're using the correct variable names
- Verify the clerk-config.ts file is being imported
- Clear `.next` cache and rebuild

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

