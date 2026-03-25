import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.env.HOME!, 'Desktop/.secrets/raceweekend.env') });

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: false,
  turbopack: {
    root: process.cwd(),
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.getyourguide.com' },
      { protocol: 'https', hostname: 'img.getyourguide.com' },
      { protocol: 'https', hostname: '**.getyourguide.com' },
      { protocol: 'https', hostname: 's1.ticketm.net' },
      { protocol: 'https', hostname: '**.ticketmaster.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      {
        source: '/f1/:slug/travel-guide',
        destination: '/f1/:slug/guide',
        permanent: true,
      },
      {
        source: '/motogp/:slug/travel-guide',
        destination: '/motogp/:slug/guide',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
        ],
      },
      {
        source: '/races/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/tracks/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
