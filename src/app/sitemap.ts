import type { MetadataRoute } from 'next';
import { getRacesBySeries } from '@/services/race.service';
import { db } from '@/lib/db';
import { experiences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const BASE = 'https://raceweekend.app';

// [subRoute, priority, changeFrequency]
const RACE_SUB_ROUTES = [
  ['', 0.95, 'daily'],           // Race overview
  ['/schedule', 0.8, 'weekly'],
  ['/experiences', 0.9, 'daily'],
  ['/tickets', 0.8, 'weekly'],
  ['/guide', 0.85, 'monthly'],
  ['/getting-there', 0.7, 'monthly'],
  ['/where-to-stay', 0.7, 'monthly'],
  ['/tips', 0.7, 'monthly'],
  ['/travel-guide', 0.85, 'weekly'],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [f1Races, motogpRaces] = await Promise.all([
    getRacesBySeries('f1'),
    getRacesBySeries('motogp'),
  ]);

  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/f1`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/motogp`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/site-directory`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
  ];

  const generateRacePages = (races: any[], series: string): MetadataRoute.Sitemap =>
    races.flatMap(race =>
      RACE_SUB_ROUTES.map(([sub, priority, freq]) => ({
        url: `${BASE}/${series}/${race.slug}${sub}`,
        lastModified: now,
        changeFrequency: freq as MetadataRoute.Sitemap[0]['changeFrequency'],
        priority: priority as number,
      }))
    );

  // Generate experience detail pages
  const experiencePages: MetadataRoute.Sitemap = [];
  const raceMap = new Map<number, { slug: string; series: string }>();
  for (const race of f1Races) raceMap.set(race.id, { slug: race.slug, series: 'f1' });
  for (const race of motogpRaces) raceMap.set(race.id, { slug: race.slug, series: 'motogp' });

  try {
    const allExps = await db
      .select({
        slug: experiences.slug,
        raceId: experiences.race_id,
        isFeatured: experiences.is_featured,
        updatedAt: experiences.updated_at,
      })
      .from(experiences);

    for (const exp of allExps) {
      const raceInfo = exp.raceId ? raceMap.get(exp.raceId) : null;
      if (!raceInfo || !exp.slug) continue;
      experiencePages.push({
        url: `${BASE}/${raceInfo.series}/${raceInfo.slug}/experiences/${exp.slug}`,
        lastModified: exp.updatedAt ? new Date(exp.updatedAt).toISOString() : now,
        changeFrequency: 'weekly',
        priority: exp.isFeatured ? 0.85 : 0.75,
      });
    }
  } catch {
    // DB not available during build, skip experience pages
  }

  return [
    ...staticPages,
    ...generateRacePages(f1Races, 'f1'),
    ...generateRacePages(motogpRaces, 'motogp'),
    ...experiencePages,
  ];
}
