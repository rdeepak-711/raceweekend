import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Race Weekend',
    short_name: 'Race Weekend',
    description: 'F1 & MotoGP travel guide — race schedules, experiences, and itineraries',
    start_url: '/',
    display: 'standalone',
    background_color: '#15151E',
    theme_color: '#E10600',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    categories: ['sports', 'travel'],
  };
}
