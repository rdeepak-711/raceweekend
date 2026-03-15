import { existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceweekend.app';

// Maps F1 race slugs to track AVIF filenames in /public/tracks/
const TRACK_AVIF_MAP: Record<string, string> = {
  'australia-f1-2026':    'Australia_Circuit.avif',
  'austria-f1-2026':      'Austria_Circuit.avif',
  'bahrain-f1-2026':      'Bahrain_Circuit.avif',
  'spain-f1-2026':        'Barcelona_Circuit.avif',
  'belgium-f1-2026':      'Belgium_Circuit.avif',
  'britain-f1-2026':      'Britian_Circuit.avif',
  'canada-f1-2026':       'Canada_Circuit.avif',
  'hungary-f1-2026':      'Hungary_Circuit.avif',
  'japan-f1-2026':        'Japan_Circuit.avif',
  'miami-f1-2026':        'Miami_Circuit.avif',
  'monaco-f1-2026':       'Monaco_Circuit.avif',
  'netherlands-f1-2026':  'Netherlands_Circuit.avif',
  'saudi-arabia-f1-2026': 'Saudi_Arabia_Circuit.avif',
  'china-f1-2026':        'Shanghai_Circuit.avif',
};

export function getRaceImagePaths(raceSlug: string): {
  heroExists: boolean;
  circuitExists: boolean;
  heroUrl: string;
  circuitUrl: string;
  ogImageUrl: string | null;
  galleryImages: string[];
} {
  const raceDir = join(process.cwd(), 'public/races', raceSlug);
  const heroExists = existsSync(join(raceDir, 'hero.jpg'));
  const hasCircuitJpg = existsSync(join(raceDir, 'circuit.jpg'));
  const trackAvif = TRACK_AVIF_MAP[raceSlug];

  const circuitExists = !!trackAvif || hasCircuitJpg;
  // AVIF track diagrams take priority over circuit.jpg photos
  const circuitUrl = trackAvif
    ? `/tracks/${trackAvif}`
    : hasCircuitJpg
    ? `/races/${raceSlug}/circuit.jpg`
    : `/races/${raceSlug}/circuit.jpg`;

  const heroUrl = `/races/${raceSlug}/hero.jpg`;

  const ogImageUrl = circuitExists
    ? `${BASE_URL}${circuitUrl}`
    : heroExists
    ? `${BASE_URL}/races/${raceSlug}/hero.jpg`
    : null;

  // Find other images (image-1.jpg, image-2.jpg, etc.)
  const galleryImages: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const filename = `image-${i}.jpg`;
    if (existsSync(join(raceDir, filename))) {
      galleryImages.push(`/races/${raceSlug}/${filename}`);
    }
  }
    
  return { heroExists, circuitExists, heroUrl, circuitUrl, ogImageUrl, galleryImages };
}
