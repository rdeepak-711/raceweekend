import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/itinerary/'],
      },
    ],
    sitemap: 'https://raceweekend.app/sitemap.xml',
    host: 'https://raceweekend.app',
  };
}
