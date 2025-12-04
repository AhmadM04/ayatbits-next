import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/api/webhook/(.*)', // Webhooks should be publicly accessible
  '/api/daily-quote', // Public API for daily quote
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

  // For API routes, add CORS headers to the response
  if (pathname.startsWith('/api')) {
    // Let the request continue, CORS headers will be added by next.config.ts
    // But we need to handle authentication
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
    return NextResponse.next();
  }

  // For non-API routes, handle authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
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
