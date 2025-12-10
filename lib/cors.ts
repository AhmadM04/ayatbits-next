import { NextRequest, NextResponse } from 'next/server';

// Allowed origins for CORS
const allowedOrigins = [
  'https://ayatbits.com',
  'https://www.ayatbits.com',
  // Add any additional production domains here
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

/**
 * Check if the origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests don't have an Origin header
  
  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for a response
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = isAllowedOrigin(origin) && origin ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  
  if (!isAllowedOrigin(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * Add CORS headers to an existing response
 */
export function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create a JSON response with CORS headers
 */
export function corsJsonResponse(
  data: any,
  request: NextRequest,
  init?: ResponseInit
): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...init?.headers,
      ...corsHeaders,
    },
  });
}

/**
 * Create an error response with CORS headers
 */
export function corsErrorResponse(
  message: string,
  request: NextRequest,
  status: number = 500
): NextResponse {
  return corsJsonResponse({ error: message }, request, { status });
}


