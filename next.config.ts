import type { NextConfig } from "next";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  fallbacks: {
    document: '/offline',
  },
  // Aggressive caching strategy for better offline experience
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'quran-api',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /^https:\/\/everyayah\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-recitations',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Turbopack configuration (empty to silence warning)
  turbopack: {},
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@clerk/nextjs',
      'framer-motion',
      'next-intl',
      'zustand',
      '@react-email/components',
      'lucide-react',
      '@dnd-kit/core',
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://*.sentry.io https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://js.stripe.com https://checkout.stripe.com https://*.stripe.com blob:; script-src-elem 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://*.sentry.io https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://js.stripe.com https://checkout.stripe.com https://*.stripe.com blob:; worker-src 'self' blob: https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https://everyayah.com https://*.everyayah.com https://api.alquran.cloud https://*.alquran.cloud https://api.quran.com https://*.quran.com https://verses.quran.com https://*.verses.quran.com; connect-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://clerk-telemetry.com https://*.ayatbits.com https://*.sentry.io https://api.stripe.com https://checkout.stripe.com https://*.stripe.com https://*.ingest.us.sentry.io https://api.alquran.cloud https://*.alquran.cloud https://api.quran.com https://*.quran.com https://verses.quran.com https://*.verses.quran.com; frame-src 'self' https://*.clerk.com https://*.clerk.dev https://*.clerk.accounts.dev https://*.ayatbits.com https://js.stripe.com https://checkout.stripe.com https://*.stripe.com https://challenges.cloudflare.com https://www.google.com https://www.recaptcha.net https://recaptcha.google.com https://www.gstatic.com;",
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
      {
        // Optimize Clerk resources caching to reduce token refresh frequency
        source: "/__clerk/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
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
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
};

export default withPWA(withBundleAnalyzer(nextConfig));
