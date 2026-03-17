import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.env.HOME!, 'Desktop/.secrets/raceweekend.env') });

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  compress: true,
  images: {
    qualities: [75],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.getyourguide.com' },
      { protocol: 'https', hostname: 'img.getyourguide.com' },
      { protocol: 'https', hostname: '**.getyourguide.com' },
      { protocol: 'https', hostname: 's1.ticketm.net' },
      { protocol: 'https', hostname: '**.ticketmaster.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
