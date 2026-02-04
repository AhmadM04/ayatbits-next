import { NextResponse } from 'next/server';
import { getClerkKeys, getClerkEnvironment } from '@/lib/clerk-environment';
import { 
  getClerkInstanceInfo, 
  validateClerkInstanceConsistency 
} from '@/lib/clerk-instance-validator';

/**
 * Debug endpoint to check Clerk configuration
 * Only available in development
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    const keys = getClerkKeys();
    const environment = getClerkEnvironment();
    const instanceInfo = getClerkInstanceInfo();
    const validation = validateClerkInstanceConsistency();

    // Get JWKS endpoint (derived from publishable key)
    const jwksEndpoint = keys.publishableKey 
      ? `https://api.clerk.com/v1/jwks` 
      : 'NOT_AVAILABLE';

    return NextResponse.json({
      status: validation.valid ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        CLERK_ENVIRONMENT: environment,
      },
      keys: {
        publishableKey: keys.publishableKey.substring(0, 25) + '...',
        secretKey: keys.secretKey ? keys.secretKey.substring(0, 25) + '...' : 'NOT_SET',
        hasPublishableKey: !!keys.publishableKey,
        hasSecretKey: !!keys.secretKey,
      },
      instance: instanceInfo,
      validation: {
        valid: validation.valid,
        publishableInstance: validation.publishableInstance,
        secretInstance: validation.secretInstance,
        error: validation.error,
      },
      jwks: {
        endpoint: jwksEndpoint,
      },
      environmentVariables: {
        hasTestPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST,
        hasTestSecret: !!process.env.CLERK_SECRET_KEY_TEST,
        hasProdPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasProdSecret: !!process.env.CLERK_SECRET_KEY,
      },
      recommendations: validation.valid 
        ? ['Configuration is valid', 'Frontend and backend keys match']
        : [
            'Fix the key mismatch',
            'Ensure CLERK_ENVIRONMENT is set correctly',
            'Verify both TEST and PROD keys are configured in .env.local',
            `Current environment is "${environment}" - ensure you have matching keys`,
          ],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


