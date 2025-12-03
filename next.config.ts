import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },

  // Reduce bundle size in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Turbopack configuration (required for Next.js 16+)
  turbopack: {
    // Set root directory to silence warning
    root: process.cwd(),
  },

  // Experimental optimizations
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
  },

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
