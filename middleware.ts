import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
]);

export default clerkMiddleware(async (auth, request) => {
  // For public routes, don't block - let them load immediately
  if (isPublicRoute(request)) {
    return; // Skip auth check for public routes
  }
  
  // For protected routes, add timeout to prevent hanging
  try {
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), 5000); // 5 second timeout
    });
    
    const protectPromise = auth.protect();
    
    await Promise.race([protectPromise, timeoutPromise]);
  } catch (error) {
    // If auth fails, let Clerk handle the redirect
    console.error('Auth check error:', error);
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

