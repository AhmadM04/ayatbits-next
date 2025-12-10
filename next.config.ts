import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@clerk/nextjs',
      'framer-motion',
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },

  // Configure headers for CORS and security
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production" 
              ? "https://ayatbits.com" 
              : "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With, Accept, Origin",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400", // 24 hours preflight cache
          },
        ],
      },
      {
        // Security and performance headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://*.sentry.io blob:; script-src-elem 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://*.sentry.io blob:; worker-src 'self' blob: https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https://everyayah.com https://*.everyayah.com https://api.alquran.cloud https://*.alquran.cloud; connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://*.sentry.io https://api.stripe.com https://*.ingest.us.sentry.io https://api.alquran.cloud https://*.alquran.cloud; frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://js.stripe.com;",
          },
        ],
      },
      {
        // Cache static assets
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache _next static files
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Rewrites for manifest.json
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/manifest',
      },
    ];
  },

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },

  // Turbopack handles code splitting automatically
  // Webpack config removed to avoid conflicts with Turbopack
};

export default nextConfig;
