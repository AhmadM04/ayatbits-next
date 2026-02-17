import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ============================================================================
 * LOOP BREAKER MIDDLEWARE - Simplified & Redirect-Loop-Free
 * ============================================================================
 * 
 * Key Changes:
 * ✅ No metadata checks (onboardingCompleted, etc.)
 * ✅ Simple logic: If logged in → allow access, if not → redirect to sign-in
 * ✅ Dashboard fixes missing metadata internally, not via middleware redirects
 * ✅ Eliminates redirect loops caused by metadata sync issues
 * 
 * The Problem (Before):
 * User signs up → Clerk metadata not synced → Middleware checks metadata →
 * Redirects to /sign-in → User already signed in → Redirects back → LOOP!
 * 
 * The Solution (After):
 * User signs up → Middleware sees valid session → Allows dashboard access →
 * Dashboard handles any missing data internally → No redirect loop!
 * ============================================================================
 */

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/puzzle(.*)',
  '/api/user(.*)',
  '/api/admin(.*)',
  '/api/billing(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();

  // ========================================================================
  // RULE 1: Not logged in + trying to access protected route → Sign in
  // ========================================================================
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ========================================================================
  // RULE 2: Logged in + protected route → ALWAYS ALLOW
  // ========================================================================
  // THE FIX: Do NOT check for onboardingCompleted or any other metadata here.
  // If the user has a valid session (userId exists), trust it and let them through.
  // The dashboard will handle any missing data or incomplete setup internally.
  if (userId && isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // ========================================================================
  // RULE 3: Everything else → Continue normally
  // ========================================================================
  return NextResponse.next();
});

/**
 * Matcher Configuration
 * 
 * Runs middleware on all routes EXCEPT:
 * - Static files (.jpg, .png, .css, .js, etc.)
 * - Next.js internals (_next)
 * - API routes and tRPC routes (handled separately)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
