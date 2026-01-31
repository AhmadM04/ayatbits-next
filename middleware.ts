import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import '@/lib/clerk-config'; // Ensure Clerk is configured with the right keys
import { 
  checkRateLimit, 
  getRateLimitIdentifier, 
  getClientIP, 
  getRateLimitHeaders,
  type RateLimitTier 
} from '@/lib/rate-limit';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/waitlist',
  '/terms',
  '/faq',
  '/manifest.json',
  '/manifest',
  '/api/webhook/(.*)', // Webhooks should be publicly accessible
  '/api/daily-quote', // Public API for daily quote
  '/api/waitlist/(.*)', // Allow waitlist API to be public
  '/api/check-access', // Allow check-access to handle its own auth (returns 401 if not authenticated)
  '/api/user/onboarding', // Allow onboarding API to be accessible
]);

// Routes that should skip onboarding check (to avoid redirect loops)
const isOnboardingRoute = createRouteMatcher([
  '/onboarding',
]);

// Routes that require stricter rate limiting
const isSensitiveRoute = createRouteMatcher([
  '/api/checkout',
  '/api/admin/(.*)',
  '/api/billing/(.*)',
]);

// Routes that require waitlist-specific rate limiting
const isWaitlistRoute = createRouteMatcher([
  '/api/waitlist/join',
]);

// Allowed origins for CORS
const allowedOrigins = [
  'https://ayatbits.com',
  'https://www.ayatbits.com',
];

// In development, allow localhost
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  );
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  // In development, allow any origin
  const allowOrigin = process.env.NODE_ENV !== 'production'
    ? origin || '*'
    : (origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]);

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const origin = request.headers.get('origin');
  const pathname = request.nextUrl.pathname;

  // Handle preflight OPTIONS requests for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    const corsHeaders = getCorsHeaders(origin);
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // For API routes, apply rate limiting and authentication
  if (pathname.startsWith('/api')) {
    const clientIP = getClientIP(request);
    const { userId } = await auth();
    const identifier = getRateLimitIdentifier(clientIP, userId);

    // Determine rate limit tier based on route
    let tier: RateLimitTier = 'authenticated';
    if (isWaitlistRoute(request)) {
      tier = 'waitlist';
    } else if (isSensitiveRoute(request)) {
      tier = 'sensitive';
    } else if (isPublicRoute(request)) {
      tier = 'public';
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(identifier, tier);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    // If rate limited, return 429
    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter: resetInSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': resetInSeconds.toString(),
            ...rateLimitHeaders,
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    // Handle authentication for protected routes
    if (!isPublicRoute(request)) {
      await auth.protect();
    }

    // Continue with rate limit headers
    const response = NextResponse.next();
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // For non-API routes, handle authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
    
    // Check onboarding status for dashboard routes
    // Skip if already on onboarding page to avoid redirect loops
    if (pathname.startsWith('/dashboard') && !isOnboardingRoute(request)) {
      const { userId } = await auth();
      
      if (userId) {
        try {
          // Check if user needs onboarding
          const onboardingCheck = await fetch(
            new URL('/api/user/onboarding', request.url),
            {
              headers: {
                cookie: request.headers.get('cookie') || '',
              },
            }
          );

          if (onboardingCheck.ok) {
            const data = await onboardingCheck.json();
            
            // Redirect to onboarding if not completed and not skipped
            if (!data.onboardingCompleted && !data.onboardingSkipped) {
              return NextResponse.redirect(new URL('/onboarding', request.url));
            }
          }
        } catch (error) {
          // If onboarding check fails, let user through to avoid blocking access
          console.error('Onboarding check failed:', error);
        }
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
