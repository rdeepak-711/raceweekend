import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Explicit AI crawler allowances (signal intent, improve GEO citability)
      { userAgent: 'GPTBot',        allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User',  allow: '/' },
      { userAgent: 'ClaudeBot',     allow: '/' },
      { userAgent: 'anthropic-ai',  allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/itinerary/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
